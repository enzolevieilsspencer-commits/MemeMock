import { SimpleAnalysis } from './simpleAnalyzer'

export class PageExporter {
  public static openAnalysisInNewPage(analysis: SimpleAnalysis): void {
    const html = this.generateAnalysisHTML(analysis)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    // Ouvrir dans une nouvelle fenêtre
    const newWindow = window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    
    if (newWindow) {
      newWindow.document.title = 'MockApe Analytics - Rapport d\'Analyse'
    }
    
    // Nettoyer l'URL après un délai
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  }

  private static generateAnalysisHTML(analysis: SimpleAnalysis): string {
    const timestamp = new Date().toLocaleString('en-US')
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MockApe Analytics - Analysis Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #07080D 0%, #1a1b2e 100%);
            color: #ffffff;
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(45deg, #14F195, #9945FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #a0a0a0;
            font-size: 1.1rem;
        }
        
        .section {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .section h2 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #14F195;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #a0a0a0;
            margin-bottom: 8px;
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-value.positive {
            color: #14F195;
        }
        
        .stat-value.negative {
            color: #ff6b6b;
        }
        
        .stat-value.neutral {
            color: #ffffff;
        }
        
        .stat-description {
            font-size: 0.8rem;
            color: #888;
        }
        
        .table-container {
            overflow-x: auto;
            margin-top: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
            overflow: hidden;
        }
        
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        th {
            background: rgba(255, 255, 255, 0.1);
            font-weight: 600;
            color: #14F195;
        }
        
        tr:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .risk-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
        }
        
        .risk-low {
            background: rgba(20, 241, 149, 0.2);
            color: #14F195;
            border: 1px solid rgba(20, 241, 149, 0.3);
        }
        
        .risk-medium {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
            border: 1px solid rgba(255, 193, 7, 0.3);
        }
        
        .risk-high {
            background: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
            border: 1px solid rgba(255, 107, 107, 0.3);
        }
        
        .recommendations {
            display: grid;
            gap: 15px;
        }
        
        .recommendation {
            background: rgba(20, 241, 149, 0.1);
            border: 1px solid rgba(20, 241, 149, 0.2);
            border-radius: 10px;
            padding: 15px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        
        .recommendation-icon {
            font-size: 1.2rem;
            margin-top: 2px;
        }
        
        .export-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #14F195, #00D18C);
            color: #000;
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .export-buttons {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MockApe Analytics</h1>
            <p>Trade analysis report generated on ${timestamp}</p>
        </div>

        <!-- Statistiques Principales -->
        <div class="section">
            <h2>📊 Main Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Trades</div>
                    <div class="stat-value neutral">${analysis.totalTrades}</div>
                    <div class="stat-description">Total number of transactions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">PnL Total</div>
                    <div class="stat-value ${analysis.totalPnL >= 0 ? 'positive' : 'negative'}">${analysis.totalPnL.toFixed(4)} SOL</div>
                    <div class="stat-description">Profit & Loss total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Volume Total</div>
                    <div class="stat-value neutral">${analysis.totalVolume.toFixed(4)} SOL</div>
                    <div class="stat-description">Total volume traded</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Win Rate</div>
                    <div class="stat-value ${analysis.winRate >= 50 ? 'positive' : 'negative'}">${analysis.winRate.toFixed(1)}%</div>
                    <div class="stat-description">Percentage of winning trades</div>
                </div>
            </div>
        </div>

        <!-- Performance -->
        <div class="section">
            <h2>📈 Detailed Performance</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Average Win</div>
                    <div class="stat-value positive">${analysis.avgWin.toFixed(4)} SOL</div>
                    <div class="stat-description">Average gain per winning trade</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Average Loss</div>
                    <div class="stat-value negative">${analysis.avgLoss.toFixed(4)} SOL</div>
                    <div class="stat-description">Average loss per losing trade</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Best Trade</div>
                    <div class="stat-value positive">${analysis.maxWin.toFixed(4)} SOL</div>
                    <div class="stat-description">Biggest gain achieved</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Worst Trade</div>
                    <div class="stat-value negative">${analysis.maxLoss.toFixed(4)} SOL</div>
                    <div class="stat-description">Biggest loss suffered</div>
                </div>
            </div>
        </div>

        <!-- Risk Analysis -->
        <div class="section">
            <h2>⚠️ Risk Analysis</h2>
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                <div class="risk-indicator risk-${analysis.riskLevel.toLowerCase()}">
                    <span>${this.getRiskIcon(analysis.riskLevel)}</span>
                    <span>Risk Level: ${analysis.riskLevel}</span>
                </div>
                <div>
                    <strong>${this.getRiskDescription(analysis.riskLevel)}</strong>
                </div>
            </div>
        </div>

        <!-- AI Recommendations -->
        <div class="section">
            <h2>💡 AI Recommendations</h2>
            <div class="recommendations">
                ${analysis.recommendations.map(rec => `
                    <div class="recommendation">
                        <span class="recommendation-icon">💡</span>
                        <span>${rec}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Performance by Asset -->
        <div class="section">
            <h2>🎯 Performance by Asset</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Trades</th>
                            <th>Total PnL</th>
                            <th>Volume</th>
                            <th>Win Rate</th>
                            <th>Best Trade</th>
                            <th>Worst Trade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(analysis.tradesByAsset).map(([asset, stats]) => `
                            <tr>
                                <td><strong>${asset}</strong></td>
                                <td>${stats.totalTrades}</td>
                                <td class="${stats.totalPnL >= 0 ? 'positive' : 'negative'}">${stats.totalPnL.toFixed(4)} SOL</td>
                                <td>${stats.totalVolume.toFixed(4)} SOL</td>
                                <td>${stats.totalTrades > 0 ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(1) : 0}%</td>
                                <td class="positive">${stats.maxWin.toFixed(4)} SOL</td>
                                <td class="negative">${stats.maxLoss.toFixed(4)} SOL</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Export buttons -->
        <div class="export-buttons">
            <button class="btn btn-primary" onclick="window.print()">
                🖨️ Print
            </button>
            <button class="btn btn-secondary" onclick="exportToCSV()">
                📊 Export CSV
            </button>
            <button class="btn btn-secondary" onclick="exportToJSON()">
                📄 Export JSON
            </button>
        </div>

        <div class="footer">
            <p>Report generated by MockApe Analytics - ${timestamp}</p>
        </div>
    </div>

    <script>
        const analysisData = ${JSON.stringify(analysis, null, 2)};
        
        function exportToCSV() {
            const csv = generateCSV(analysisData);
            downloadFile(csv, 'mockape-analysis.csv', 'text/csv');
        }
        
        function exportToJSON() {
            const json = JSON.stringify(analysisData, null, 2);
            downloadFile(json, 'mockape-analysis.json', 'application/json');
        }
        
        function generateCSV(data) {
            const rows = [
                ['Metric', 'Value'],
                ['Total Trades', data.totalTrades],
                ['Total PnL', data.totalPnL.toFixed(4) + ' SOL'],
                ['Total Volume', data.totalVolume.toFixed(4) + ' SOL'],
                ['Win Rate', data.winRate.toFixed(1) + '%'],
                ['Average Win', data.avgWin.toFixed(4) + ' SOL'],
                ['Average Loss', data.avgLoss.toFixed(4) + ' SOL'],
                ['Best Trade', data.maxWin.toFixed(4) + ' SOL'],
                ['Worst Trade', data.maxLoss.toFixed(4) + ' SOL'],
                ['Best Asset', data.bestAsset],
                ['Worst Asset', data.worstAsset],
                ['Risk Level', data.riskLevel],
                ['', ''],
                ['Recommendations', ''],
            ];
            
            data.recommendations.forEach((rec, index) => {
                rows.push([\`\${index + 1}.\`, rec]);
            });
            
            return rows.map(row => row.join(',')).join('\\n');
        }
        
        function downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
    `.trim()
  }

  private static getRiskIcon(riskLevel: string): string {
    switch (riskLevel) {
      case 'LOW': return '🟢'
      case 'MEDIUM': return '🟡'
      case 'HIGH': return '🔴'
      default: return '⚪'
    }
  }

  private static getRiskDescription(riskLevel: string): string {
    switch (riskLevel) {
      case 'LOW': return 'Low risk - Stable and performing strategy'
      case 'MEDIUM': return 'Moderate risk - Monitoring recommended'
      case 'HIGH': return 'High risk - Action required to optimize'
      default: return 'Undetermined risk level'
    }
  }
}
