import { PnLDataPoint } from '../components/PnLChart'

export interface MockApeEntry {
  pnlSol: number
  solInvested: number
  solReceived: number
  timestamp: number
  tokenName: string
}

export interface StandardTrade {
  date: string
  asset: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  fees: number
}

export function convertMockApeToPnLData(data: MockApeEntry[], solPriceUsd: number = 1): PnLDataPoint[] {
  if (!data || data.length === 0) return []

  // Trier par timestamp (plus ancien en premier pour les graphiques)
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)
  
  let cumulativePnlSol = 0
  const pnlData: PnLDataPoint[] = []

  sortedData.forEach((entry, index) => {
    // Garder le PnL en SOL pour le calcul cumulatif
    cumulativePnlSol += entry.pnlSol
    
    pnlData.push({
      date: new Date(entry.timestamp).toISOString(),
      timestamp: entry.timestamp,
      pnl: entry.pnlSol, // PnL en SOL
      cumulativePnl: cumulativePnlSol * solPriceUsd, // Cumulatif converti en USD
      // Ajouter des informations supplémentaires pour le debug
      tokenName: entry.tokenName,
      solInvested: entry.solInvested,
      solReceived: entry.solReceived
    })
  })

  return pnlData
}

export function convertStandardTradesToPnLData(trades: StandardTrade[]): PnLDataPoint[] {
  if (!trades || trades.length === 0) return []

  // Trier par date (plus ancien en premier pour les graphiques)
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  let cumulativePnl = 0
  const pnlData: PnLDataPoint[] = []

  sortedTrades.forEach((trade) => {
    const tradeValue = trade.quantity * trade.price
    // Calculer le PnL plus précisément
    let pnl = 0
    if (trade.side === 'sell') {
      // Pour une vente, le PnL est positif (on récupère de l'argent)
      pnl = tradeValue - trade.fees
    } else {
      // Pour un achat, le PnL est négatif (on dépense de l'argent)
      pnl = -(tradeValue + trade.fees)
    }
    
    cumulativePnl += pnl
    
    pnlData.push({
      date: trade.date,
      timestamp: new Date(trade.date).getTime(),
      pnl: pnl,
      cumulativePnl: cumulativePnl,
      // Ajouter des informations supplémentaires
      asset: trade.asset,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price
    })
  })

  return pnlData
}

export function detectDataFormat(jsonString: string): 'mockape' | 'trades' | 'unknown' {
  try {
    const data = JSON.parse(jsonString)
    
    if (!Array.isArray(data) || data.length === 0) {
      return 'unknown'
    }

    const firstItem = data[0]
    
    // Vérifier le format MockApe
    if (firstItem.pnlSol !== undefined && 
        firstItem.solInvested !== undefined && 
        firstItem.timestamp !== undefined && 
        firstItem.tokenName !== undefined) {
      return 'mockape'
    }
    
    // Vérifier le format de trades standard
    if (firstItem.date !== undefined && 
        firstItem.asset !== undefined && 
        firstItem.side !== undefined && 
        firstItem.quantity !== undefined && 
        firstItem.price !== undefined) {
      return 'trades'
    }
    
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

export function convertJsonToPnLData(jsonString: string, solPriceUsd: number = 1): PnLDataPoint[] {
  const format = detectDataFormat(jsonString)
  
  if (format === 'mockape') {
    const mockapeData = JSON.parse(jsonString) as MockApeEntry[]
    return convertMockApeToPnLData(mockapeData, solPriceUsd)
  } else if (format === 'trades') {
    const tradesData = JSON.parse(jsonString) as StandardTrade[]
    return convertStandardTradesToPnLData(tradesData)
  }
  
  return []
}
