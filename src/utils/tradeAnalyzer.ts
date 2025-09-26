import { Trade, TradeAnalysis, AssetStats, DailyStats, MonthlyStats, ChartData, AssetBreakdown } from '../types/trades'
import { format, parseISO, startOfDay, startOfMonth } from 'date-fns'
import { detectDataFormat, convertMockApeToTrades } from './mockapeConverter'

export function parseTradesData(jsonData: string): Trade[] {
  try {
    const format = detectDataFormat(jsonData)
    
    if (format === 'unknown') {
      throw new Error('Format de données non reconnu. Utilisez le format de trades standard ou le format MockApe.')
    }
    
    if (format === 'mockape') {
      const data = JSON.parse(jsonData)
      return convertMockApeToTrades(data)
    }
    
    // Format de trades standard
    const data = JSON.parse(jsonData)
    
    if (!Array.isArray(data)) {
      throw new Error('Les données doivent être un tableau de trades')
    }

    return data.map((trade, index) => {
      // Validation des champs requis
      if (!trade.date || !trade.asset || !trade.side || typeof trade.quantity !== 'number' || typeof trade.price !== 'number') {
        throw new Error(`Trade invalide à l'index ${index}: champs requis manquants`)
      }

      if (!['buy', 'sell'].includes(trade.side)) {
        throw new Error(`Trade invalide à l'index ${index}: side doit être 'buy' ou 'sell'`)
      }

      const total = trade.quantity * trade.price
      const fees = trade.fees || 0

      return {
        date: trade.date,
        asset: trade.asset,
        side: trade.side,
        quantity: trade.quantity,
        price: trade.price,
        fees,
        symbol: trade.symbol || trade.asset,
        total,
        pnl: 0 // Sera calculé plus tard
      }
    })
  } catch (error) {
    throw new Error(`Erreur lors du parsing des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

export function calculateTradeAnalysis(trades: Trade[]): TradeAnalysis {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      totalVolume: 0,
      totalFees: 0,
      totalPnL: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      maxWin: 0,
      maxLoss: 0,
      bestAsset: '',
      worstAsset: '',
      tradesByAsset: {},
      tradesByDate: {},
      monthlyStats: {}
    }
  }

  // Calculer le PnL pour chaque trade
  const tradesWithPnL = calculateTradePnL(trades)
  
  // Statistiques générales
  const totalTrades = tradesWithPnL.length
  const totalVolume = tradesWithPnL.reduce((sum, trade) => sum + trade.total!, 0)
  const totalFees = tradesWithPnL.reduce((sum, trade) => sum + trade.fees, 0)
  const totalPnL = tradesWithPnL.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  
  // Trades gagnants et perdants
  const winningTrades = tradesWithPnL.filter(trade => (trade.pnl || 0) > 0)
  const losingTrades = tradesWithPnL.filter(trade => (trade.pnl || 0) < 0)
  
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length : 0
  const maxWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(trade => trade.pnl || 0)) : 0
  const maxLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(trade => trade.pnl || 0)) : 0

  // Statistiques par actif
  const tradesByAsset = calculateAssetStats(tradesWithPnL)
  
  // Meilleur et pire actif
  const assetEntries = Object.entries(tradesByAsset)
  const bestAsset = assetEntries.length > 0 ? assetEntries.reduce((best, [asset, stats]) => 
    stats.totalPnL > tradesByAsset[best].totalPnL ? asset : best
  ) : ''
  const worstAsset = assetEntries.length > 0 ? assetEntries.reduce((worst, [asset, stats]) => 
    stats.totalPnL < tradesByAsset[worst].totalPnL ? asset : worst
  ) : ''

  // Statistiques par date
  const tradesByDate = calculateDailyStats(tradesWithPnL)
  
  // Statistiques mensuelles
  const monthlyStats = calculateMonthlyStats(tradesWithPnL)

  return {
    totalTrades,
    totalVolume,
    totalFees,
    totalPnL,
    winRate,
    avgWin,
    avgLoss,
    maxWin,
    maxLoss,
    bestAsset,
    worstAsset,
    tradesByAsset,
    tradesByDate,
    monthlyStats
  }
}

function calculateTradePnL(trades: Trade[]): Trade[] {
  const assetPositions = new Map<string, { quantity: number; avgPrice: number }>()
  
  return trades.map(trade => {
    const currentPosition = assetPositions.get(trade.asset) || { quantity: 0, avgPrice: 0 }
    let pnl = 0

    if (trade.side === 'buy') {
      // Achat
      const newQuantity = currentPosition.quantity + trade.quantity
      const newAvgPrice = currentPosition.quantity === 0 
        ? trade.price 
        : (currentPosition.quantity * currentPosition.avgPrice + trade.quantity * trade.price) / newQuantity
      
      assetPositions.set(trade.asset, { quantity: newQuantity, avgPrice: newAvgPrice })
    } else {
      // Vente
      if (currentPosition.quantity >= trade.quantity) {
        pnl = (trade.price - currentPosition.avgPrice) * trade.quantity - trade.fees
        const newQuantity = currentPosition.quantity - trade.quantity
        assetPositions.set(trade.asset, { quantity: newQuantity, avgPrice: currentPosition.avgPrice })
      } else {
        // Vente partielle ou sans position
        pnl = (trade.price - currentPosition.avgPrice) * currentPosition.quantity - trade.fees
        assetPositions.set(trade.asset, { quantity: 0, avgPrice: 0 })
      }
    }

    return { ...trade, pnl }
  })
}

function calculateAssetStats(trades: Trade[]): Record<string, AssetStats> {
  const assetMap = new Map<string, Trade[]>()
  
  // Grouper les trades par actif
  trades.forEach(trade => {
    if (!assetMap.has(trade.asset)) {
      assetMap.set(trade.asset, [])
    }
    assetMap.get(trade.asset)!.push(trade)
  })

  const stats: Record<string, AssetStats> = {}
  
  assetMap.forEach((assetTrades, asset) => {
    const totalTrades = assetTrades.length
    const totalVolume = assetTrades.reduce((sum, trade) => sum + trade.total!, 0)
    const totalPnL = assetTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    const winningTrades = assetTrades.filter(trade => (trade.pnl || 0) > 0)
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0
    const avgPrice = assetTrades.reduce((sum, trade) => sum + trade.price, 0) / totalTrades
    const totalQuantity = assetTrades.reduce((sum, trade) => sum + trade.quantity, 0)

    stats[asset] = {
      asset,
      totalTrades,
      totalVolume,
      totalPnL,
      winRate,
      avgPrice,
      totalQuantity
    }
  })

  return stats
}

function calculateDailyStats(trades: Trade[]): Record<string, DailyStats> {
  const dailyMap = new Map<string, Trade[]>()
  
  trades.forEach(trade => {
    const dateKey = format(startOfDay(parseISO(trade.date)), 'yyyy-MM-dd')
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, [])
    }
    dailyMap.get(dateKey)!.push(trade)
  })

  const stats: Record<string, DailyStats> = {}
  
  dailyMap.forEach((dayTrades, date) => {
    const totalVolume = dayTrades.reduce((sum, trade) => sum + trade.total!, 0)
    const totalPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)

    stats[date] = {
      date,
      totalTrades: dayTrades.length,
      totalVolume,
      totalPnL,
      trades: dayTrades
    }
  })

  return stats
}

function calculateMonthlyStats(trades: Trade[]): Record<string, MonthlyStats> {
  const monthlyMap = new Map<string, Trade[]>()
  
  trades.forEach(trade => {
    const monthKey = format(startOfMonth(parseISO(trade.date)), 'yyyy-MM')
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, [])
    }
    monthlyMap.get(monthKey)!.push(trade)
  })

  const stats: Record<string, MonthlyStats> = {}
  
  monthlyMap.forEach((monthTrades, month) => {
    const totalVolume = monthTrades.reduce((sum, trade) => sum + trade.total!, 0)
    const totalPnL = monthTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    const winningTrades = monthTrades.filter(trade => (trade.pnl || 0) > 0)
    const winRate = monthTrades.length > 0 ? (winningTrades.length / monthTrades.length) * 100 : 0

    stats[month] = {
      month,
      totalTrades: monthTrades.length,
      totalVolume,
      totalPnL,
      winRate
    }
  })

  return stats
}

export function generateChartData(trades: Trade[]): ChartData[] {
  const dailyStats = calculateDailyStats(trades)
  const sortedDates = Object.keys(dailyStats).sort()
  
  let cumulativePnl = 0
  
  return sortedDates.map(date => {
    const dayStats = dailyStats[date]
    cumulativePnl += dayStats.totalPnL
    
    return {
      date,
      pnl: dayStats.totalPnL,
      cumulativePnl,
      volume: dayStats.totalVolume,
      trades: dayStats.totalTrades
    }
  })
}

export function generateAssetBreakdown(trades: Trade[]): AssetBreakdown[] {
  const assetStats = calculateAssetStats(trades)
  const totalValue = Object.values(assetStats).reduce((sum, stats) => sum + stats.totalVolume, 0)
  
  return Object.values(assetStats)
    .map(stats => ({
      asset: stats.asset,
      value: stats.totalVolume,
      percentage: totalValue > 0 ? (stats.totalVolume / totalValue) * 100 : 0,
      pnl: stats.totalPnL,
      trades: stats.totalTrades
    }))
    .sort((a, b) => b.value - a.value)
}
