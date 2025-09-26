// Analyseur simple et robuste pour les données MockApe
export interface SimpleTrade {
  id?: string
  tokenName?: string
  pnlSol?: number
  solInvested?: number
  solReceived?: number
  timestamp?: number
  entryMarketCap?: number
  exitMarketCap?: number
  platform?: string
  // Format standard
  date?: string
  asset?: string
  side?: 'buy' | 'sell'
  quantity?: number
  price?: number
  fees?: number
  total?: number
  pnl?: number
  symbol?: string
}

export interface SimpleAnalysis {
  totalTrades: number
  totalPnL: number
  totalVolume: number
  totalFees: number
  winRate: number
  avgWin: number
  avgLoss: number
  maxWin: number
  maxLoss: number
  bestAsset: string
  worstAsset: string
  tradesByAsset: { [asset: string]: any }
  dailyStats: { [date: string]: any }
  recommendations: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export class SimpleTradeAnalyzer {
  public static analyzeData(jsonString: string): SimpleAnalysis {
    try {
      const data = JSON.parse(jsonString)
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid or empty JSON data')
      }

      // Detect format and convert
      const trades = this.convertToStandardFormat(data)
      
      // Analyze trades
      return this.analyzeTrades(trades)
    } catch (error) {
      console.error('Analysis error:', error)
      throw new Error(`Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static convertToStandardFormat(data: any[]): SimpleTrade[] {
    return data.map((item, index) => {
      // Format MockApe
      if (item.tokenName && item.pnlSol !== undefined) {
        return {
          id: item.id || `trade_${index}`,
          tokenName: item.tokenName,
          pnlSol: item.pnlSol,
          solInvested: item.solInvested || 0,
          solReceived: item.solReceived || 0,
          timestamp: item.timestamp,
          entryMarketCap: item.entryMarketCap,
          exitMarketCap: item.exitMarketCap,
          platform: item.platform,
          // Conversion vers format standard
          date: item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString(),
          asset: item.tokenName,
          side: item.pnlSol > 0 ? 'sell' : 'buy',
          quantity: 1,
          price: item.solInvested || 0,
          fees: 0,
          total: item.solInvested || 0,
          pnl: item.pnlSol,
          symbol: item.tokenName
        }
      }
      
      // Format standard déjà
      return {
        ...item,
        id: item.id || `trade_${index}`,
        total: item.total || (item.quantity * item.price) || 0,
        pnl: item.pnl || 0
      }
    })
  }

  private static analyzeTrades(trades: SimpleTrade[]): SimpleAnalysis {
    const totalTrades = trades.length
    let totalPnL = 0
    let totalVolume = 0
    let totalFees = 0
    let winningTrades = 0
    let losingTrades = 0
    let totalWins = 0
    let totalLosses = 0
    let maxWin = 0
    let maxLoss = 0
    
    const tradesByAsset: { [asset: string]: any } = {}
    const dailyStats: { [date: string]: any } = {}

    trades.forEach(trade => {
      const pnl = trade.pnl || trade.pnlSol || 0
      const volume = trade.total || trade.solInvested || 0
      const fees = trade.fees || 0
      const asset = trade.asset || trade.tokenName || 'UNKNOWN'
      const date = trade.date ? trade.date.split('T')[0] : new Date().toISOString().split('T')[0]

      // Statistiques globales
      totalPnL += pnl
      totalVolume += volume
      totalFees += fees

      if (pnl > 0) {
        winningTrades++
        totalWins += pnl
        maxWin = Math.max(maxWin, pnl)
      } else if (pnl < 0) {
        losingTrades++
        totalLosses += Math.abs(pnl)
        maxLoss = Math.min(maxLoss, pnl)
      }

      // Par actif
      if (!tradesByAsset[asset]) {
        tradesByAsset[asset] = {
          totalTrades: 0,
          totalPnL: 0,
          totalVolume: 0,
          totalSolInvested: 0,
          totalSolReceived: 0,
          winningTrades: 0,
          losingTrades: 0,
          maxWin: 0,
          maxLoss: 0
        }
      }
      
      tradesByAsset[asset].totalTrades++
      tradesByAsset[asset].totalPnL += pnl
      tradesByAsset[asset].totalVolume += volume
      
      // Ajouter les vraies données MockApe si disponibles
      if (trade.solInvested) {
        tradesByAsset[asset].totalSolInvested += trade.solInvested
      }
      if (trade.solReceived) {
        tradesByAsset[asset].totalSolReceived += trade.solReceived
      }
      
      if (pnl > 0) {
        tradesByAsset[asset].winningTrades++
        tradesByAsset[asset].maxWin = Math.max(tradesByAsset[asset].maxWin, pnl)
      } else if (pnl < 0) {
        tradesByAsset[asset].losingTrades++
        tradesByAsset[asset].maxLoss = Math.min(tradesByAsset[asset].maxLoss, pnl)
      }

      // Par jour
      if (!dailyStats[date]) {
        dailyStats[date] = {
          trades: 0,
          pnl: 0,
          volume: 0
        }
      }
      
      dailyStats[date].trades++
      dailyStats[date].pnl += pnl
      dailyStats[date].volume += volume
    })

    // Calculs finaux
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0
    const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0

    // Meilleur et pire actif
    let bestAsset = 'N/A'
    let worstAsset = 'N/A'
    let bestPnL = -Infinity
    let worstPnL = Infinity

    Object.entries(tradesByAsset).forEach(([asset, stats]) => {
      if (stats.totalPnL > bestPnL) {
        bestPnL = stats.totalPnL
        bestAsset = asset
      }
      if (stats.totalPnL < worstPnL) {
        worstPnL = stats.totalPnL
        worstAsset = asset
      }
    })

    // Recommandations IA
    const recommendations = this.generateRecommendations({
      totalPnL,
      winRate,
      totalTrades,
      maxLoss,
      tradesByAsset
    })

    // Niveau de risque
    const riskLevel = this.calculateRiskLevel({
      totalPnL,
      winRate,
      maxLoss,
      totalVolume
    })

    return {
      totalTrades,
      totalPnL,
      totalVolume,
      totalFees,
      winRate,
      avgWin,
      avgLoss,
      maxWin,
      maxLoss,
      bestAsset,
      worstAsset,
      tradesByAsset,
      dailyStats,
      recommendations,
      riskLevel
    }
  }

  private static generateRecommendations(data: any): string[] {
    const recommendations: string[] = []

    if (data.winRate < 40) {
      recommendations.push('🎯 Améliorez votre stratégie d\'entrée et de sortie')
    }

    if (data.totalPnL < 0) {
      recommendations.push('📉 Considérez réduire la taille de vos positions')
    }

    if (data.maxLoss < -data.totalVolume * 0.2) {
      recommendations.push('🛡️ Implémentez des stop-loss pour limiter les pertes')
    }

    const assetCount = Object.keys(data.tradesByAsset).length
    if (assetCount < 3) {
      recommendations.push('🌐 Diversifiez votre portefeuille avec plus d\'actifs')
    }

    if (data.totalTrades > 50 && data.winRate > 60) {
      recommendations.push('🚀 Excellente performance ! Considérez augmenter la taille des positions')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Continuez votre stratégie actuelle')
    }

    return recommendations
  }

  private static calculateRiskLevel(data: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    const riskFactors = []

    if (data.winRate < 30) riskFactors.push('winRate')
    if (data.maxLoss < -data.totalVolume * 0.3) riskFactors.push('maxLoss')
    if (data.totalPnL < -data.totalVolume * 0.1) riskFactors.push('totalPnL')

    if (riskFactors.length >= 2) return 'HIGH'
    if (riskFactors.length === 1) return 'MEDIUM'
    return 'LOW'
  }

  public static exportToTable(analysis: SimpleAnalysis): string {
    const rows = [
      ['Metric', 'Value'],
      ['Total Trades', analysis.totalTrades.toString()],
      ['Total PnL', `${analysis.totalPnL.toFixed(4)} SOL`],
      ['Total Volume', `${analysis.totalVolume.toFixed(4)} SOL`],
      ['Total Fees', `${analysis.totalFees.toFixed(4)} SOL`],
      ['Win Rate', `${analysis.winRate.toFixed(1)}%`],
      ['Average Win', `${analysis.avgWin.toFixed(4)} SOL`],
      ['Average Loss', `${analysis.avgLoss.toFixed(4)} SOL`],
      ['Best Trade', `${analysis.maxWin.toFixed(4)} SOL`],
      ['Worst Trade', `${analysis.maxLoss.toFixed(4)} SOL`],
      ['Best Asset', analysis.bestAsset],
      ['Worst Asset', analysis.worstAsset],
      ['Risk Level', analysis.riskLevel],
      ['', ''],
      ['Recommendations', ''],
    ]

    analysis.recommendations.forEach((rec, index) => {
      rows.push([`${index + 1}.`, rec])
    })

    return rows.map(row => row.join('\t')).join('\n')
  }
}
