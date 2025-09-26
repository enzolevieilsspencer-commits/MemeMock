import { useMemo } from 'react'
import { useCryptoPrices } from '../hooks/useCryptoPrices'
import { PnLTable } from '../components/PnLTable'
import { convertJsonToPnLData } from '../utils/pnlDataConverter'

interface VueAnalyseProps {
  jsonData?: string | null
}

export function VueAnalyse({ jsonData }: VueAnalyseProps) {
  const { prices } = useCryptoPrices()

  // Calculate detailed statistics
  const analysisStats = useMemo(() => {
    if (!jsonData) return null
    
    const allData = convertJsonToPnLData(jsonData, prices.SOL.price || 1)
    
    if (allData.length === 0) return null

    // Calculate win rate and other metrics
    const totalTrades = allData.length
    const winningTrades = allData.filter(trade => trade.pnl > 0).length
    const losingTrades = allData.filter(trade => trade.pnl < 0).length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    // Calculate PnL statistics
    const totalPnLSol = allData.reduce((sum, trade) => sum + trade.pnl, 0)
    const totalPnLUsd = allData.reduce((sum, trade) => {
      const pnlUsd = trade.tokenName ? trade.pnl * (prices.SOL.price || 1) : trade.pnl
      return sum + pnlUsd
    }, 0)

    // Calculate average win/loss
    const winningTradesData = allData.filter(trade => trade.pnl > 0)
    const losingTradesData = allData.filter(trade => trade.pnl < 0)
    const avgWin = winningTradesData.length > 0 ? 
      winningTradesData.reduce((sum, trade) => sum + trade.pnl, 0) / winningTradesData.length : 0
    const avgLoss = losingTradesData.length > 0 ? 
      losingTradesData.reduce((sum, trade) => sum + trade.pnl, 0) / losingTradesData.length : 0

    // Calculate best and worst trades
    const bestTrade = Math.max(...allData.map(trade => trade.pnl))
    const worstTrade = Math.min(...allData.map(trade => trade.pnl))

    // Calculate volume statistics
    const totalVolumeSol = allData.reduce((sum, trade) => {
      return sum + Math.abs(trade.pnl)
    }, 0)
    const totalVolumeUsd = totalVolumeSol * (prices.SOL.price || 1)

    // Calculate fees (if available)
    const totalFees = allData.reduce((sum, trade) => sum + (trade.fees || 0), 0)

    // Group by token for asset analysis
    const tokenGroups: { [key: string]: any[] } = {}
    allData.forEach(trade => {
      const token = trade.tokenName || trade.asset || 'UNKNOWN'
      if (!tokenGroups[token]) {
        tokenGroups[token] = []
      }
      tokenGroups[token].push(trade)
    })

    // Find best and worst performing assets
    const assetStats = Object.entries(tokenGroups).map(([token, trades]) => {
      const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0)
      const tradeCount = trades.length
      const winRate = trades.filter(t => t.pnl > 0).length / tradeCount * 100
      return { token, totalPnL, tradeCount, winRate }
    })

    const bestAsset = assetStats.reduce((best, current) => 
      current.totalPnL > best.totalPnL ? current : best, assetStats[0] || { token: 'N/A', totalPnL: 0 })
    const worstAsset = assetStats.reduce((worst, current) => 
      current.totalPnL < worst.totalPnL ? current : worst, assetStats[0] || { token: 'N/A', totalPnL: 0 })

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnLSol,
      totalPnLUsd,
      avgWin,
      avgLoss,
      bestTrade,
      worstTrade,
      totalVolumeSol,
      totalVolumeUsd,
      totalFees,
      bestAsset: bestAsset.token,
      worstAsset: worstAsset.token,
      uniqueTokens: Object.keys(tokenGroups).length
    }
  }, [jsonData, prices.SOL.price])

  if (!jsonData) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#14F195]">📊 Analysis Report</h2>
        <div className="text-sm text-white/60">
          Data analyzed successfully
        </div>
      </div>
      
      {/* Main Statistics Cards */}
      {analysisStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Win Rate Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-md border border-white/10 p-6 overflow-hidden">
            {/* Cyberpunk grid overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#14F195]/50 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl animate-float">🎯</div>
                <div className={`text-2xl font-bold ${analysisStats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {analysisStats.winRate.toFixed(1)}%
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Win Rate</h3>
              <p className="text-sm text-white/70">
                {analysisStats.winningTrades} winning trades out of {analysisStats.totalTrades} total
              </p>
            </div>
            
            {/* Hover effect */}
          </div>

          {/* Total PnL Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-md border border-white/10 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#06B6D4]/50 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl animate-float">💰</div>
                <div className={`text-2xl font-bold ${analysisStats.totalPnLUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${analysisStats.totalPnLUsd.toFixed(2)}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Total PnL</h3>
              <p className="text-sm text-white/70">
                {analysisStats.totalPnLSol.toFixed(4)} SOL
              </p>
            </div>
            
          </div>

          {/* Average Win Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-md border border-white/10 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#14F195]/50 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl animate-float">📈</div>
                <div className="text-2xl font-bold text-green-400">
                  {analysisStats.avgWin.toFixed(4)} SOL
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Average Win</h3>
              <p className="text-sm text-white/70">
                Per winning trade
              </p>
            </div>
            
          </div>

          {/* Average Loss Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-md border border-white/10 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#9945FF]/50 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl animate-float">📉</div>
                <div className="text-2xl font-bold text-red-400">
                  {analysisStats.avgLoss.toFixed(4)} SOL
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Average Loss</h3>
              <p className="text-sm text-white/70">
                Per losing trade
              </p>
            </div>
            
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {analysisStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best & Worst Trades */}
          <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">🏆 Best & Worst Trades</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-400/10 rounded-xl border border-green-400/20">
                <div>
                  <div className="text-sm text-white/70">Best Trade</div>
                  <div className="text-lg font-bold text-green-400">
                    +{analysisStats.bestTrade.toFixed(4)} SOL
                  </div>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-400/10 rounded-xl border border-red-400/20">
                <div>
                  <div className="text-sm text-white/70">Worst Trade</div>
                  <div className="text-lg font-bold text-red-400">
                    {analysisStats.worstTrade.toFixed(4)} SOL
                  </div>
                </div>
                <div className="text-2xl">⚠️</div>
              </div>
            </div>
          </div>

          {/* Asset Performance */}
          <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">🎯 Asset Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-400/10 rounded-xl border border-green-400/20">
                <div>
                  <div className="text-sm text-white/70">Best Asset</div>
                  <div className="text-lg font-bold text-green-400">
                    {analysisStats.bestAsset}
                  </div>
                </div>
                <div className="text-2xl">🚀</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-400/10 rounded-xl border border-red-400/20">
                <div>
                  <div className="text-sm text-white/70">Worst Asset</div>
                  <div className="text-lg font-bold text-red-400">
                    {analysisStats.worstAsset}
                  </div>
                </div>
                <div className="text-2xl">📉</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volume & Fees Statistics */}
      {analysisStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl bg-white/5 p-6 text-center border border-white/10">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white mb-1">
              {analysisStats.totalVolumeSol.toFixed(2)} SOL
            </div>
            <div className="text-sm text-white/70">Total Volume</div>
            <div className="text-xs text-white/50 mt-1">
              ${analysisStats.totalVolumeUsd.toFixed(2)} USD
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 text-center border border-white/10">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {analysisStats.totalFees.toFixed(4)} SOL
            </div>
            <div className="text-sm text-white/70">Total Fees</div>
            <div className="text-xs text-white/50 mt-1">
              ${(analysisStats.totalFees * (prices.SOL.price || 1)).toFixed(2)} USD
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 text-center border border-white/10">
            <div className="text-3xl mb-2">🪙</div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {analysisStats.uniqueTokens}
            </div>
            <div className="text-sm text-white/70">Unique Tokens</div>
            <div className="text-xs text-white/50 mt-1">
              Traded
            </div>
          </div>
        </div>
      )}
      
      {/* Detailed Table */}
      <PnLTable jsonData={jsonData} solPriceUsd={prices.SOL.price} />
    </section>
  )
}
