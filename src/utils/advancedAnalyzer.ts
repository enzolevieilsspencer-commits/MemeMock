import { Trade, TradeAnalysis } from '../types/trades'
import { format, parseISO, differenceInDays } from 'date-fns'

export interface AdvancedInsights {
  // Métriques de performance
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  winStreak: number
  lossStreak: number
  
  // Analyse temporelle
  bestTradingDay: string
  worstTradingDay: string
  averageTradeDuration: number
  
  // Analyse de risque
  riskScore: number
  diversificationScore: number
  concentrationRisk: number
  
  // Prédictions et tendances
  trendDirection: 'bullish' | 'bearish' | 'neutral'
  momentumScore: number
  volatilityForecast: number
  
  // Recommandations
  recommendations: string[]
  riskWarnings: string[]
  
  // Métriques avancées
  calmarRatio: number
  sortinoRatio: number
  var95: number // Value at Risk 95%
  expectedShortfall: number
}

export interface ExportData {
  trades: Trade[]
  summary: TradeAnalysis
  insights: AdvancedInsights
  monthlyData: MonthlyPerformance[]
  assetData: AssetPerformance[]
  riskMetrics: RiskMetrics
}

export interface MonthlyPerformance {
  month: string
  trades: number
  pnl: number
  volume: number
  winRate: number
  sharpeRatio: number
  maxDrawdown: number
}

export interface AssetPerformance {
  asset: string
  totalTrades: number
  totalPnL: number
  winRate: number
  avgReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  correlation: number
}

export interface RiskMetrics {
  portfolio: {
    var95: number
    expectedShortfall: number
    maxDrawdown: number
    volatility: number
    sharpeRatio: number
  }
  assets: {
    [asset: string]: {
      var95: number
      volatility: number
      beta: number
    }
  }
}

export class AdvancedTradeAnalyzer {
  private trades: Trade[]
  private analysis: TradeAnalysis

  constructor(trades: Trade[], analysis: TradeAnalysis) {
    this.trades = trades
    this.analysis = analysis
  }

  public generateAdvancedInsights(): AdvancedInsights {
    const dailyReturns = this.calculateDailyReturns()
    // const monthlyReturns = this.calculateMonthlyReturns()
    
    return {
      // Métriques de performance
      sharpeRatio: this.calculateSharpeRatio(dailyReturns),
      maxDrawdown: this.calculateMaxDrawdown(dailyReturns),
      volatility: this.calculateVolatility(dailyReturns),
      winStreak: this.calculateWinStreak(),
      lossStreak: this.calculateLossStreak(),
      
      // Analyse temporelle
      bestTradingDay: this.findBestTradingDay(),
      worstTradingDay: this.findWorstTradingDay(),
      averageTradeDuration: this.calculateAverageTradeDuration(),
      
      // Analyse de risque
      riskScore: this.calculateRiskScore(),
      diversificationScore: this.calculateDiversificationScore(),
      concentrationRisk: this.calculateConcentrationRisk(),
      
      // Prédictions et tendances
      trendDirection: this.analyzeTrend(),
      momentumScore: this.calculateMomentumScore(),
      volatilityForecast: this.forecastVolatility(dailyReturns),
      
      // Recommandations
      recommendations: this.generateRecommendations(),
      riskWarnings: this.generateRiskWarnings(),
      
      // Métriques avancées
      calmarRatio: this.calculateCalmarRatio(dailyReturns),
      sortinoRatio: this.calculateSortinoRatio(dailyReturns),
      var95: this.calculateVaR(dailyReturns, 0.95),
      expectedShortfall: this.calculateExpectedShortfall(dailyReturns, 0.95)
    }
  }

  public generateExportData(): ExportData {
    return {
      trades: this.trades,
      summary: this.analysis,
      insights: this.generateAdvancedInsights(),
      monthlyData: this.generateMonthlyPerformance(),
      assetData: this.generateAssetPerformance(),
      riskMetrics: this.generateRiskMetrics()
    }
  }

  private calculateDailyReturns(): number[] {
    const dailyPnL = new Map<string, number>()
    
    this.trades.forEach(trade => {
      const date = format(parseISO(trade.date), 'yyyy-MM-dd')
      const currentPnL = dailyPnL.get(date) || 0
      dailyPnL.set(date, currentPnL + (trade.pnl || 0))
    })
    
    const sortedDates = Array.from(dailyPnL.keys()).sort()
    return sortedDates.map(date => dailyPnL.get(date) || 0)
  }

  // private calculateMonthlyReturns(): number[] {
  //   const monthlyPnL = new Map<string, number>()
    
  //   this.trades.forEach(trade => {
  //     const month = format(parseISO(trade.date), 'yyyy-MM')
  //     const currentPnL = monthlyPnL.get(month) || 0
  //     monthlyPnL.set(month, currentPnL + (trade.pnl || 0))
  //   })
    
  //   const sortedMonths = Array.from(monthlyPnL.keys()).sort()
  //   return sortedMonths.map(month => monthlyPnL.get(month) || 0)
  // }

  private calculateSharpeRatio(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0
    
    const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length
    const stdDev = Math.sqrt(variance)
    
    if (stdDev === 0) return 0
    return avgReturn / stdDev
  }

  private calculateMaxDrawdown(dailyReturns: number[]): number {
    let maxDrawdown = 0
    let peak = 0
    let runningSum = 0
    
    for (const ret of dailyReturns) {
      runningSum += ret
      if (runningSum > peak) {
        peak = runningSum
      }
      const drawdown = peak - runningSum
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }
    
    return maxDrawdown
  }

  private calculateVolatility(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0
    
    const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length
    
    return Math.sqrt(variance)
  }

  private calculateWinStreak(): number {
    let currentStreak = 0
    let maxStreak = 0
    
    this.trades.forEach(trade => {
      if ((trade.pnl || 0) > 0) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })
    
    return maxStreak
  }

  private calculateLossStreak(): number {
    let currentStreak = 0
    let maxStreak = 0
    
    this.trades.forEach(trade => {
      if ((trade.pnl || 0) < 0) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })
    
    return maxStreak
  }

  private findBestTradingDay(): string {
    const dailyPnL = new Map<string, number>()
    
    this.trades.forEach(trade => {
      const date = format(parseISO(trade.date), 'yyyy-MM-dd')
      const currentPnL = dailyPnL.get(date) || 0
      dailyPnL.set(date, currentPnL + (trade.pnl || 0))
    })
    
    let bestDate = ''
    let bestPnL = -Infinity
    
    dailyPnL.forEach((pnl, date) => {
      if (pnl > bestPnL) {
        bestPnL = pnl
        bestDate = date
      }
    })
    
    return bestDate
  }

  private findWorstTradingDay(): string {
    const dailyPnL = new Map<string, number>()
    
    this.trades.forEach(trade => {
      const date = format(parseISO(trade.date), 'yyyy-MM-dd')
      const currentPnL = dailyPnL.get(date) || 0
      dailyPnL.set(date, currentPnL + (trade.pnl || 0))
    })
    
    let worstDate = ''
    let worstPnL = Infinity
    
    dailyPnL.forEach((pnl, date) => {
      if (pnl < worstPnL) {
        worstPnL = pnl
        worstDate = date
      }
    })
    
    return worstDate
  }

  private calculateAverageTradeDuration(): number {
    if (this.trades.length < 2) return 0
    
    const sortedTrades = [...this.trades].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    let totalDuration = 0
    let tradeCount = 0
    
    for (let i = 1; i < sortedTrades.length; i++) {
      const prevTrade = sortedTrades[i - 1]
      const currentTrade = sortedTrades[i]
      
      if (prevTrade.asset === currentTrade.asset) {
        const duration = differenceInDays(parseISO(currentTrade.date), parseISO(prevTrade.date))
        totalDuration += duration
        tradeCount++
      }
    }
    
    return tradeCount > 0 ? totalDuration / tradeCount : 0
  }

  private calculateRiskScore(): number {
    const volatility = this.calculateVolatility(this.calculateDailyReturns())
    const maxDrawdown = this.calculateMaxDrawdown(this.calculateDailyReturns())
    const concentrationRisk = this.calculateConcentrationRisk()
    
    // Score de 0 à 100 (100 = très risqué)
    return Math.min(100, (volatility * 10 + maxDrawdown * 5 + concentrationRisk * 2))
  }

  private calculateDiversificationScore(): number {
    // const assetCount = Object.keys(this.analysis.tradesByAsset).length
    const totalTrades = this.analysis.totalTrades
    
    if (totalTrades === 0) return 0
    
    // Calcul de l'indice de Herfindahl
    let hhi = 0
    Object.values(this.analysis.tradesByAsset).forEach(assetStats => {
      const share = assetStats.totalTrades / totalTrades
      hhi += share * share
    })
    
    // Score de diversification (0-100, 100 = parfaitement diversifié)
    return Math.max(0, 100 - (hhi * 100))
  }

  private calculateConcentrationRisk(): number {
    const assetVolumes = Object.values(this.analysis.tradesByAsset).map(asset => asset.totalVolume)
    const totalVolume = assetVolumes.reduce((sum, vol) => sum + vol, 0)
    
    if (totalVolume === 0) return 0
    
    // Calcul de l'indice de concentration
    let concentration = 0
    assetVolumes.forEach(volume => {
      const share = volume / totalVolume
      concentration += share * share
    })
    
    return concentration * 100
  }

  private analyzeTrend(): 'bullish' | 'bearish' | 'neutral' {
    // const monthlyReturns = this.calculateMonthlyReturns()
    
    // if (monthlyReturns.length < 2) return 'neutral'
    
    // const recentReturns = monthlyReturns.slice(-3) // 3 derniers mois
    // const avgRecent = recentReturns.reduce((sum: any, ret: any) => sum + ret, 0) / recentReturns.length
    
    // if (avgRecent > 0.1) return 'bullish'
    // if (avgRecent < -0.1) return 'bearish'
    return 'neutral'
  }

  private calculateMomentumScore(): number {
    const dailyReturns = this.calculateDailyReturns()
    
    if (dailyReturns.length < 10) return 0
    
    const recent = dailyReturns.slice(-10)
    const older = dailyReturns.slice(-20, -10)
    
    const recentAvg = recent.reduce((sum, ret) => sum + ret, 0) / recent.length
    const olderAvg = older.reduce((sum, ret) => sum + ret, 0) / older.length
    
    return recentAvg - olderAvg
  }

  private forecastVolatility(dailyReturns: number[]): number {
    if (dailyReturns.length < 10) return 0
    
    // Utilisation d'un modèle GARCH simplifié
    const recent = dailyReturns.slice(-10)
    const variance = recent.reduce((sum, ret) => sum + ret * ret, 0) / recent.length
    
    return Math.sqrt(variance)
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const insights = this.generateAdvancedInsights()
    
    if (insights.diversificationScore < 50) {
      recommendations.push('Considérez diversifier votre portefeuille avec plus d\'actifs')
    }
    
    if (insights.riskScore > 70) {
      recommendations.push('Réduisez la taille de vos positions pour diminuer le risque')
    }
    
    // if (insights.winRate < 40) {
    //   recommendations.push('Améliorez votre stratégie d\'entrée et de sortie')
    // }
    
    if (insights.maxDrawdown > this.analysis.totalVolume * 0.2) {
      recommendations.push('Implémentez des stop-loss pour limiter les pertes')
    }
    
    if (insights.sharpeRatio < 1) {
      recommendations.push('Optimisez le ratio risque/rendement de vos trades')
    }
    
    return recommendations
  }

  private generateRiskWarnings(): string[] {
    const warnings: string[] = []
    const insights = this.generateAdvancedInsights()
    
    if (insights.var95 > this.analysis.totalVolume * 0.1) {
      warnings.push('Risque de perte élevé : 5% de chance de perdre plus de 10% du capital')
    }
    
    if (insights.maxDrawdown > this.analysis.totalVolume * 0.3) {
      warnings.push('Drawdown maximum très élevé détecté')
    }
    
    if (insights.concentrationRisk > 80) {
      warnings.push('Concentration excessive sur un ou plusieurs actifs')
    }
    
    if (insights.volatility > this.analysis.totalVolume * 0.05) {
      warnings.push('Volatilité élevée du portefeuille')
    }
    
    return warnings
  }

  private calculateCalmarRatio(dailyReturns: number[]): number {
    const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
    const maxDrawdown = this.calculateMaxDrawdown(dailyReturns)
    
    if (maxDrawdown === 0) return 0
    return avgReturn / maxDrawdown
  }

  private calculateSortinoRatio(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0
    
    const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
    const negativeReturns = dailyReturns.filter(ret => ret < 0)
    
    if (negativeReturns.length === 0) return avgReturn
    
    const downsideVariance = negativeReturns.reduce((sum, ret) => sum + ret * ret, 0) / negativeReturns.length
    const downsideDeviation = Math.sqrt(downsideVariance)
    
    if (downsideDeviation === 0) return 0
    return avgReturn / downsideDeviation
  }

  private calculateVaR(dailyReturns: number[], confidence: number): number {
    if (dailyReturns.length === 0) return 0
    
    const sortedReturns = [...dailyReturns].sort((a, b) => a - b)
    const index = Math.floor((1 - confidence) * sortedReturns.length)
    
    return Math.abs(sortedReturns[index] || 0)
  }

  private calculateExpectedShortfall(dailyReturns: number[], confidence: number): number {
    const var95 = this.calculateVaR(dailyReturns, confidence)
    const tailReturns = dailyReturns.filter(ret => ret <= -var95)
    
    if (tailReturns.length === 0) return 0
    
    return Math.abs(tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length)
  }

  private generateMonthlyPerformance(): MonthlyPerformance[] {
    const monthlyData = new Map<string, {
      trades: number
      pnl: number
      volume: number
      returns: number[]
    }>()
    
    this.trades.forEach(trade => {
      const month = format(parseISO(trade.date), 'yyyy-MM')
      const current = monthlyData.get(month) || { trades: 0, pnl: 0, volume: 0, returns: [] }
      
      current.trades++
      current.pnl += trade.pnl || 0
      current.volume += trade.total || 0
      current.returns.push(trade.pnl || 0)
      
      monthlyData.set(month, current)
    })
    
    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      trades: data.trades,
      pnl: data.pnl,
      volume: data.volume,
      winRate: (data.returns.filter(r => r > 0).length / data.returns.length) * 100,
      sharpeRatio: this.calculateSharpeRatio(data.returns),
      maxDrawdown: this.calculateMaxDrawdown(data.returns)
    })).sort((a, b) => a.month.localeCompare(b.month))
  }

  private generateAssetPerformance(): AssetPerformance[] {
    return Object.entries(this.analysis.tradesByAsset).map(([asset, stats]) => {
      const assetTrades = this.trades.filter(trade => trade.asset === asset)
      const returns = assetTrades.map(trade => trade.pnl || 0)
      
      return {
        asset,
        totalTrades: stats.totalTrades,
        totalPnL: stats.totalPnL,
        winRate: stats.winRate,
        avgReturn: returns.reduce((sum, ret) => sum + ret, 0) / returns.length,
        volatility: this.calculateVolatility(returns),
        sharpeRatio: this.calculateSharpeRatio(returns),
        maxDrawdown: this.calculateMaxDrawdown(returns),
        correlation: this.calculateAssetCorrelation(asset)
      }
    })
  }

  private calculateAssetCorrelation(asset: string): number {
    // Calcul simplifié de corrélation avec le portefeuille
    const assetTrades = this.trades.filter(trade => trade.asset === asset)
    const portfolioReturns = this.calculateDailyReturns()
    
    if (assetTrades.length === 0 || portfolioReturns.length === 0) return 0
    
    const assetReturns = assetTrades.map(trade => trade.pnl || 0)
    
    // Corrélation simplifiée
    const avgAsset = assetReturns.reduce((sum, ret) => sum + ret, 0) / assetReturns.length
    const avgPortfolio = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length
    
    let covariance = 0
    for (let i = 0; i < Math.min(assetReturns.length, portfolioReturns.length); i++) {
      covariance += (assetReturns[i] - avgAsset) * (portfolioReturns[i] - avgPortfolio)
    }
    covariance /= Math.min(assetReturns.length, portfolioReturns.length)
    
    const assetVariance = assetReturns.reduce((sum, ret) => sum + Math.pow(ret - avgAsset, 2), 0) / assetReturns.length
    const portfolioVariance = portfolioReturns.reduce((sum, ret) => sum + Math.pow(ret - avgPortfolio, 2), 0) / portfolioReturns.length
    
    const correlation = covariance / Math.sqrt(assetVariance * portfolioVariance)
    return isNaN(correlation) ? 0 : correlation
  }

  private generateRiskMetrics(): RiskMetrics {
    const dailyReturns = this.calculateDailyReturns()
    
    return {
      portfolio: {
        var95: this.calculateVaR(dailyReturns, 0.95),
        expectedShortfall: this.calculateExpectedShortfall(dailyReturns, 0.95),
        maxDrawdown: this.calculateMaxDrawdown(dailyReturns),
        volatility: this.calculateVolatility(dailyReturns),
        sharpeRatio: this.calculateSharpeRatio(dailyReturns)
      },
      assets: Object.keys(this.analysis.tradesByAsset).reduce((acc, asset) => {
        const assetTrades = this.trades.filter(trade => trade.asset === asset)
        const assetReturns = assetTrades.map(trade => trade.pnl || 0)
        
        acc[asset] = {
          var95: this.calculateVaR(assetReturns, 0.95),
          volatility: this.calculateVolatility(assetReturns),
          beta: this.calculateAssetCorrelation(asset)
        }
        
        return acc
      }, {} as { [asset: string]: { var95: number; volatility: number; beta: number } })
    }
  }
}
