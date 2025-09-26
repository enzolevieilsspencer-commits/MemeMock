import { useMemo, useState } from 'react'
import { convertJsonToPnLData } from '../utils/pnlDataConverter'

interface PnLTableProps {
  jsonData: string | null
  solPriceUsd?: number
  timeFilter?: '1d' | '1w' | '1m' | 'all'
}

export function PnLTable({ jsonData, solPriceUsd, timeFilter: initialTimeFilter = 'all' }: PnLTableProps) {
  const [timeFilter, setTimeFilter] = useState<'1d' | '1w' | '1m' | 'all'>(initialTimeFilter)
  // Use exactly the same data as the chart
  const allData = useMemo(() => {
    if (!jsonData) return []
    return convertJsonToPnLData(jsonData, solPriceUsd || 1)
  }, [jsonData, solPriceUsd])

  // Apply the same time filter as the chart
  const filteredData = useMemo(() => {
    if (allData.length === 0) return []
    
    let filtered: any[] = []
    
    switch (timeFilter) {
      case '1d':
        // Filter only trades from the current day
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime()
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime()
        
        filtered = allData.filter(point => {
          const tradeDate = new Date(point.timestamp)
          const tradeDateStart = new Date(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate(), 0, 0, 0, 0).getTime()
          return tradeDateStart >= todayStart && tradeDateStart <= todayEnd
        })
        break
        
      case '1w':
        const now = Date.now()
        const weekCutoff = now - (7 * 24 * 60 * 60 * 1000)
        filtered = allData.filter(point => point.timestamp >= weekCutoff)
        break
        
      case '1m':
        const nowMonth = Date.now()
        const monthCutoff = nowMonth - (30 * 24 * 60 * 60 * 1000)
        filtered = allData.filter(point => point.timestamp >= monthCutoff)
        break
        
      default:
        filtered = allData
    }
    
    // S'assurer que les données sont triées par timestamp décroissant (plus récent en premier pour les tableaux)
    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }, [allData, timeFilter])

  // Recalculate cumulative PnL exactly like in the chart
  const pnlData = useMemo(() => {
    if (filteredData.length === 0) return []
    
    // If it's "1 Day", reset each day
    if (timeFilter === '1d') {
      // Group data by day
      const dailyGroups: { [key: string]: any[] } = {}
      
      filteredData.forEach((point) => {
        const date = new Date(point.timestamp)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        
        if (!dailyGroups[dateKey]) {
          dailyGroups[dateKey] = []
        }
        dailyGroups[dateKey].push(point)
      })
      
      // Recalculate cumulative PnL by resetting each day
      const result: any[] = []
      const sortedDays = Object.keys(dailyGroups).sort()
      
      sortedDays.forEach((dayKey) => {
        const dayTrades = dailyGroups[dayKey].sort((a, b) => b.timestamp - a.timestamp)
        let dailyCumulativePnlSol = 0
        
        dayTrades.forEach((point) => {
          dailyCumulativePnlSol += point.pnl // pnl is in SOL for MockApe
          result.push({
            ...point,
            cumulativePnl: dailyCumulativePnlSol * (solPriceUsd || 1) // Convertir en USD
          })
        })
      })
      
      return result
    } else {
      // For other periods (week, month, all), no reset
      let cumulativePnlSol = 0
      return filteredData.map((point) => {
        cumulativePnlSol += point.pnl // pnl is in SOL for MockApe
        return {
          ...point,
          cumulativePnl: cumulativePnlSol * (solPriceUsd || 1) // Convertir en USD
        }
      })
    }
  }, [filteredData, timeFilter, solPriceUsd])

  // Group data by token/asset
  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {}
    
    pnlData.forEach(point => {
      const key = point.tokenName || point.asset || 'UNKNOWN'
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(point)
    })
    
    return groups
  }, [pnlData])

  // Calculer les statistiques par token
  const tokenStats = useMemo(() => {
    const stats: { [key: string]: any } = {}
    
    Object.entries(groupedData).forEach(([token, trades]) => {
      let totalSolInvested = 0
      let totalSolReceived = 0
      let totalPnLSol = 0
      let totalPnLUsd = 0
      let tradeCount = trades.length
      
      trades.forEach(trade => {
        // Pour MockApe
        if (trade.tokenName) {
          totalSolInvested += trade.solInvested || 0
          totalSolReceived += trade.solReceived || 0
          totalPnLSol += trade.pnl // already in SOL
          totalPnLUsd += trade.pnl * (solPriceUsd || 1)
        } else {
          // Pour trades standard
          const tradeValue = (trade.quantity || 0) * (trade.price || 0)
          if (trade.side === 'sell') {
            totalSolReceived += tradeValue
            totalPnLSol += trade.pnl
            totalPnLUsd += trade.pnl
          } else {
            totalSolInvested += tradeValue
            totalPnLSol += trade.pnl
            totalPnLUsd += trade.pnl
          }
        }
      })
      
      const pnlPercentage = totalSolInvested > 0 ? (totalPnLSol / totalSolInvested) * 100 : 0
      
      stats[token] = {
        totalSolInvested,
        totalSolReceived,
        totalPnLSol,
        totalPnLUsd,
        pnlPercentage,
        tradeCount
      }
    })
    
    return stats
  }, [groupedData, solPriceUsd])

  if (pnlData.length === 0) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-white/80">No data to display for this period</p>
          <div className="mt-4">
            <button
              onClick={() => setTimeFilter('all')}
              className="px-4 py-2 rounded-lg bg-[#06B6D4] text-white hover:bg-[#0891B2] transition-colors"
            >
              View all data
            </button>
          </div>
        </div>
      </div>
    )
  }

  const timeFilters = [
    { key: '1d', label: '1 Day' },
    { key: '1w', label: '1 Week' },
    { key: '1m', label: '1 Month' },
    { key: 'all', label: 'All periods' },
  ]

  return (
    <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📋 Details by Token (Chart Data)</h2>
        <div className="flex gap-2">
          {timeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key as any)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                timeFilter === filter.key
                  ? 'bg-[#06B6D4] text-white'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/80">Token</th>
              <th className="text-right py-3 px-4 text-white/80">Trades</th>
              <th className="text-right py-3 px-4 text-white/80">SOL Invested</th>
              <th className="text-right py-3 px-4 text-white/80">SOL Received</th>
              <th className="text-right py-3 px-4 text-white/80">PnL (SOL)</th>
              <th className="text-right py-3 px-4 text-white/80">PnL ($)</th>
              <th className="text-right py-3 px-4 text-white/80">PnL (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tokenStats).map(([token, stats]) => (
              <tr key={token} className="border-b border-white/5">
                <td className="py-3 px-4 font-medium text-white">{token}</td>
                <td className="py-3 px-4 text-right text-white/80">
                  {stats.tradeCount}
                </td>
                <td className="py-3 px-4 text-right text-white/80">
                  {stats.totalSolInvested.toFixed(3)}
                </td>
                <td className="py-3 px-4 text-right text-white/80">
                  {stats.totalSolReceived.toFixed(3)}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${stats.totalPnLSol >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalPnLSol >= 0 ? '+' : ''}{stats.totalPnLSol.toFixed(3)}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${stats.totalPnLUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalPnLUsd >= 0 ? '+' : ''}${stats.totalPnLUsd.toFixed(2)}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${stats.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.pnlPercentage >= 0 ? '+' : ''}{stats.pnlPercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Global statistics */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="text-center mb-4">
          <h4 className="text-lg font-semibold text-white">
            📊 Statistics - {timeFilters.find(f => f.key === timeFilter)?.label || 'All periods'}
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{pnlData.length}</div>
            <div className="text-sm text-white/60">Total Trades</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              pnlData.reduce((sum, p) => sum + p.pnl, 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {pnlData.reduce((sum, p) => sum + p.pnl, 0).toFixed(3)}
            </div>
            <div className="text-sm text-white/60">Total PnL (SOL)</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              pnlData.reduce((sum, p) => sum + (p.pnl * (p.tokenName ? (solPriceUsd || 1) : 1)), 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${pnlData.reduce((sum, p) => sum + (p.pnl * (p.tokenName ? (solPriceUsd || 1) : 1)), 0).toFixed(2)}
            </div>
            <div className="text-sm text-white/60">Total PnL ($)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Object.keys(tokenStats).length}</div>
            <div className="text-sm text-white/60">Tokens</div>
          </div>
        </div>
      </div>
    </div>
  )
}
