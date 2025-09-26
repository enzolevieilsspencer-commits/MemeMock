import { ExportData, MonthlyPerformance, AssetPerformance, RiskMetrics } from './advancedAnalyzer'
import { Trade } from '../types/trades'

export class ExportManager {
  public static exportToCSV(data: ExportData, format: 'trades' | 'summary' | 'insights' | 'monthly' | 'assets' | 'risk'): string {
    switch (format) {
      case 'trades':
        return this.exportTradesToCSV(data.trades)
      case 'summary':
        return this.exportSummaryToCSV(data.summary)
      case 'insights':
        return this.exportInsightsToCSV(data.insights)
      case 'monthly':
        return this.exportMonthlyToCSV(data.monthlyData)
      case 'assets':
        return this.exportAssetsToCSV(data.assetData)
      case 'risk':
        return this.exportRiskToCSV(data.riskMetrics)
      default:
        return this.exportAllToCSV(data)
    }
  }

  public static exportToJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2)
  }

  public static exportToExcel(data: ExportData): Blob {
    // Pour Excel, nous créons un fichier CSV multi-feuilles
    const csvContent = this.createMultiSheetCSV(data)
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }

  private static exportTradesToCSV(trades: Trade[]): string {
    const headers = [
      'Date',
      'Asset',
      'Side',
      'Quantity',
      'Price',
      'Total',
      'Fees',
      'PnL',
      'Symbol'
    ]

    const rows = trades.map(trade => [
      trade.date,
      trade.asset,
      trade.side,
      trade.quantity.toString(),
      trade.price.toString(),
      (trade.total || 0).toString(),
      trade.fees.toString(),
      (trade.pnl || 0).toString(),
      trade.symbol || trade.asset
    ])

    return this.createCSV([headers, ...rows])
  }

  private static exportSummaryToCSV(summary: any): string {
    const data = [
      ['Métrique', 'Valeur'],
      ['Total Trades', summary.totalTrades.toString()],
      ['Volume Total', summary.totalVolume.toString()],
      ['Fees Total', summary.totalFees.toString()],
      ['PnL Total', summary.totalPnL.toString()],
      ['Taux de Réussite (%)', summary.winRate.toFixed(2)],
      ['Gain Moyen', summary.avgWin.toFixed(2)],
      ['Perte Moyenne', summary.avgLoss.toFixed(2)],
      ['Gain Maximum', summary.maxWin.toFixed(2)],
      ['Perte Maximum', summary.maxLoss.toFixed(2)],
      ['Meilleur Actif', summary.bestAsset],
      ['Pire Actif', summary.worstAsset]
    ]

    return this.createCSV(data)
  }

  private static exportInsightsToCSV(insights: any): string {
    const data = [
      ['Métrique Avancée', 'Valeur'],
      ['Ratio de Sharpe', insights.sharpeRatio.toFixed(4)],
      ['Drawdown Maximum', insights.maxDrawdown.toFixed(2)],
      ['Volatilité', insights.volatility.toFixed(4)],
      ['Série de Gains', insights.winStreak.toString()],
      ['Série de Pertes', insights.lossStreak.toString()],
      ['Meilleur Jour', insights.bestTradingDay],
      ['Pire Jour', insights.worstTradingDay],
      ['Durée Moyenne des Trades', insights.averageTradeDuration.toFixed(2)],
      ['Score de Risque', insights.riskScore.toFixed(2)],
      ['Score de Diversification', insights.diversificationScore.toFixed(2)],
      ['Risque de Concentration', insights.concentrationRisk.toFixed(2)],
      ['Direction de Tendance', insights.trendDirection],
      ['Score de Momentum', insights.momentumScore.toFixed(4)],
      ['Prévision Volatilité', insights.volatilityForecast.toFixed(4)],
      ['Ratio Calmar', insights.calmarRatio.toFixed(4)],
      ['Ratio Sortino', insights.sortinoRatio.toFixed(4)],
      ['VaR 95%', insights.var95.toFixed(2)],
      ['Expected Shortfall', insights.expectedShortfall.toFixed(2)]
    ]

    // Ajouter les recommandations
    data.push(['', ''])
    data.push(['Recommandations', ''])
    insights.recommendations.forEach((rec: string, index: number) => {
      data.push([`Recommandation ${index + 1}`, rec])
    })

    // Ajouter les avertissements
    data.push(['', ''])
    data.push(['Avertissements de Risque', ''])
    insights.riskWarnings.forEach((warning: string, index: number) => {
      data.push([`Avertissement ${index + 1}`, warning])
    })

    return this.createCSV(data)
  }

  private static exportMonthlyToCSV(monthlyData: MonthlyPerformance[]): string {
    const headers = [
      'Mois',
      'Trades',
      'PnL',
      'Volume',
      'Taux de Réussite (%)',
      'Ratio de Sharpe',
      'Drawdown Maximum'
    ]

    const rows = monthlyData.map(month => [
      month.month,
      month.trades.toString(),
      month.pnl.toFixed(2),
      month.volume.toFixed(2),
      month.winRate.toFixed(2),
      month.sharpeRatio.toFixed(4),
      month.maxDrawdown.toFixed(2)
    ])

    return this.createCSV([headers, ...rows])
  }

  private static exportAssetsToCSV(assetData: AssetPerformance[]): string {
    const headers = [
      'Actif',
      'Total Trades',
      'PnL Total',
      'Taux de Réussite (%)',
      'Rendement Moyen',
      'Volatilité',
      'Ratio de Sharpe',
      'Drawdown Maximum',
      'Corrélation'
    ]

    const rows = assetData.map(asset => [
      asset.asset,
      asset.totalTrades.toString(),
      asset.totalPnL.toFixed(2),
      asset.winRate.toFixed(2),
      asset.avgReturn.toFixed(4),
      asset.volatility.toFixed(4),
      asset.sharpeRatio.toFixed(4),
      asset.maxDrawdown.toFixed(2),
      asset.correlation.toFixed(4)
    ])

    return this.createCSV([headers, ...rows])
  }

  private static exportRiskToCSV(riskMetrics: RiskMetrics): string {
    const data = [
      ['Métrique de Risque', 'Valeur'],
      ['', ''],
      ['PORTEFEUILLE', ''],
      ['VaR 95%', riskMetrics.portfolio.var95.toFixed(2)],
      ['Expected Shortfall', riskMetrics.portfolio.expectedShortfall.toFixed(2)],
      ['Drawdown Maximum', riskMetrics.portfolio.maxDrawdown.toFixed(2)],
      ['Volatilité', riskMetrics.portfolio.volatility.toFixed(4)],
      ['Ratio de Sharpe', riskMetrics.portfolio.sharpeRatio.toFixed(4)],
      ['', ''],
      ['ACTIFS', ''],
      ['Actif', 'VaR 95%', 'Volatilité', 'Beta']
    ]

    Object.entries(riskMetrics.assets).forEach(([asset, metrics]) => {
      data.push([
        asset,
        metrics.var95.toFixed(2),
        metrics.volatility.toFixed(4),
        metrics.beta.toFixed(4)
      ])
    })

    return this.createCSV(data)
  }

  private static exportAllToCSV(data: ExportData): string {
    const sections = [
      { title: '=== RÉSUMÉ GÉNÉRAL ===', content: this.exportSummaryToCSV(data.summary) },
      { title: '=== INSIGHTS AVANCÉS ===', content: this.exportInsightsToCSV(data.insights) },
      { title: '=== PERFORMANCE MENSUELLE ===', content: this.exportMonthlyToCSV(data.monthlyData) },
      { title: '=== PERFORMANCE PAR ACTIF ===', content: this.exportAssetsToCSV(data.assetData) },
      { title: '=== MÉTRIQUES DE RISQUE ===', content: this.exportRiskToCSV(data.riskMetrics) },
      { title: '=== DÉTAIL DES TRADES ===', content: this.exportTradesToCSV(data.trades) }
    ]

    return sections.map(section => 
      `${section.title}\n${section.content}\n\n`
    ).join('')
  }

  private static createMultiSheetCSV(data: ExportData): string {
    // Création d'un CSV multi-feuilles avec des séparateurs
    const sheets = [
      { name: 'Résumé', content: this.exportSummaryToCSV(data.summary) },
      { name: 'Insights', content: this.exportInsightsToCSV(data.insights) },
      { name: 'Mensuel', content: this.exportMonthlyToCSV(data.monthlyData) },
      { name: 'Actifs', content: this.exportAssetsToCSV(data.assetData) },
      { name: 'Risque', content: this.exportRiskToCSV(data.riskMetrics) },
      { name: 'Trades', content: this.exportTradesToCSV(data.trades) }
    ]

    return sheets.map(sheet => 
      `=== ${sheet.name.toUpperCase()} ===\n${sheet.content}\n\n`
    ).join('')
  }

  private static createCSV(rows: string[][]): string {
    return rows.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }

  public static downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  public static generateReport(data: ExportData): string {
    const insights = data.insights
    const summary = data.summary
    
    return `
# MOCKAPE TRADE ANALYSIS REPORT

## 📊 EXECUTIVE SUMMARY

- **Total PnL**: ${summary.totalPnL.toFixed(2)} SOL
- **Total Volume**: ${summary.totalVolume.toFixed(2)} SOL
- **Trades**: ${summary.totalTrades}
- **Win Rate**: ${summary.winRate.toFixed(1)}%
- **Sharpe Ratio**: ${insights.sharpeRatio.toFixed(3)}
- **Maximum Drawdown**: ${insights.maxDrawdown.toFixed(2)} SOL

## 🎯 PERFORMANCE

### Key Metrics
- **Average Win**: ${summary.avgWin.toFixed(2)} SOL
- **Average Loss**: ${summary.avgLoss.toFixed(2)} SOL
- **Best Trade**: ${summary.maxWin.toFixed(2)} SOL
- **Worst Trade**: ${summary.maxLoss.toFixed(2)} SOL

### Sequences
- **Win Streak**: ${insights.winStreak} trades
- **Loss Streak**: ${insights.lossStreak} trades

## ⚠️ RISK ANALYSIS

### Risk Score: ${insights.riskScore.toFixed(1)}/100
${insights.riskScore > 70 ? '🔴 HIGH RISK' : insights.riskScore > 40 ? '🟡 MODERATE RISK' : '🟢 LOW RISK'}

### Diversification: ${insights.diversificationScore.toFixed(1)}/100
${insights.diversificationScore < 50 ? '⚠️ Insufficient diversification' : '✅ Good diversification'}

### Concentration: ${insights.concentrationRisk.toFixed(1)}%
${insights.concentrationRisk > 80 ? '⚠️ Excessive concentration' : '✅ Acceptable concentration'}

## 📈 TRENDS

- **Direction**: ${insights.trendDirection === 'bullish' ? '📈 Bullish' : insights.trendDirection === 'bearish' ? '📉 Bearish' : '➡️ Neutral'}
- **Momentum**: ${insights.momentumScore > 0 ? '📈 Positive' : '📉 Negative'}
- **Forecasted Volatility**: ${insights.volatilityForecast.toFixed(4)}

## 💡 RECOMMENDATIONS

${insights.recommendations.map(rec => `- ${rec}`).join('\n')}

## ⚠️ WARNINGS

${insights.riskWarnings.map(warning => `- ${warning}`).join('\n')}

## 📋 ADVANCED METRICS

- **Ratio Calmar**: ${insights.calmarRatio.toFixed(3)}
- **Ratio Sortino**: ${insights.sortinoRatio.toFixed(3)}
- **VaR 95%**: ${insights.var95.toFixed(2)} SOL
- **Expected Shortfall**: ${insights.expectedShortfall.toFixed(2)} SOL

---
*Report generated on ${new Date().toLocaleDateString('en-US')} by MockApe Analytics*
    `.trim()
  }
}
