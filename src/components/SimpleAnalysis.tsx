import { SimpleAnalysis as SimpleAnalysisType } from '../utils/simpleAnalyzer'

interface SimpleAnalysisProps {
  analysis: SimpleAnalysisType
  onExport?: () => void
  solPriceUsd?: number
}

export function SimpleAnalysis({ analysis, onExport, solPriceUsd }: SimpleAnalysisProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-green-400'
      default: return 'text-white/70'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'HIGH': return '🔴'
      case 'MEDIUM': return '🟡'
      case 'LOW': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main statistics */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">📊 Main Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Total Trades</div>
            <div className="text-2xl font-bold text-white">{analysis.totalTrades}</div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Total PnL</div>
            <div className={`text-2xl font-bold ${analysis.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {analysis.totalPnL.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Total Volume</div>
            <div className="text-2xl font-bold text-white">
              {analysis.totalVolume.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-white">
              {analysis.winRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">📈 Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Average Win</div>
            <div className="text-xl font-bold text-green-400">
              {analysis.avgWin.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Average Loss</div>
            <div className="text-xl font-bold text-red-400">
              {analysis.avgLoss.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Best Trade</div>
            <div className="text-xl font-bold text-green-400">
              {analysis.maxWin.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Worst Trade</div>
            <div className="text-xl font-bold text-red-400">
              {analysis.maxLoss.toFixed(4)} SOL
            </div>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">🎯 Performance by Asset</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Best Asset</div>
            <div className="text-xl font-bold text-green-400">{analysis.bestAsset}</div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Worst Asset</div>
            <div className="text-xl font-bold text-red-400">{analysis.worstAsset}</div>
          </div>
        </div>
      </div>

      {/* Risk and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level */}
        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">⚠️ Risk Level</h2>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getRiskIcon(analysis.riskLevel)}</span>
            <div>
              <div className={`text-2xl font-bold ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel}
              </div>
              <div className="text-sm text-white/60">
                {analysis.riskLevel === 'LOW' && 'Low risk - Stable strategy'}
                {analysis.riskLevel === 'MEDIUM' && 'Moderate risk - Monitoring recommended'}
                {analysis.riskLevel === 'HIGH' && 'High risk - Action required'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">💡 AI Recommendations</h2>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-green-400 text-lg">💡</span>
                <span className="text-white/80 text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail by Asset */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">📋 Detail by Asset</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/80">Token</th>
                <th className="text-right py-3 px-4 text-white/80">SOL Invested</th>
                <th className="text-right py-3 px-4 text-white/80">SOL Received</th>
                <th className="text-right py-3 px-4 text-white/80">PnL (SOL)</th>
                <th className="text-right py-3 px-4 text-white/80">PnL ($)</th>
                <th className="text-right py-3 px-4 text-white/80">PnL (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analysis.tradesByAsset).map(([asset, stats]) => {
                // Use real MockApe data if available, otherwise calculate
                const solInvested = stats.totalSolInvested || (stats.totalVolume / 2)
                const solReceived = stats.totalSolReceived || (solInvested + stats.totalPnL)
                const pnlPercentage = solInvested > 0 ? (stats.totalPnL / solInvested) * 100 : 0
                const pnlUsd = solPriceUsd ? stats.totalPnL * solPriceUsd : 0
                
                return (
                  <tr key={asset} className="border-b border-white/5">
                    <td className="py-3 px-4 font-medium text-white">{asset}</td>
                    <td className="py-3 px-4 text-right text-white/80">
                      {solInvested.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-right text-white/80">
                      {solReceived.toFixed(3)}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(3)}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${pnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlUsd >= 0 ? '+' : ''}${pnlUsd.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)} %
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export button */}
      {onExport && (
        <div className="flex justify-center">
          <button
            onClick={onExport}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#14F195] to-[#00D18C] text-black font-semibold hover:from-[#12D885] hover:to-[#00C47A] transition-colors"
          >
            📊 Export to Table
          </button>
        </div>
      )}
    </div>
  )
}
