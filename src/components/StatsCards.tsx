import { TradeAnalysis } from '../types/trades'

interface StatsCardsProps {
  analysis: TradeAnalysis
}

export function StatsCards({ analysis }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getPnLColor = (value: number) => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-white/70'
  }

  const getPnLIcon = (value: number) => {
    if (value > 0) return '↗'
    if (value < 0) return '↘'
    return '→'
  }

  const stats = [
    {
      title: 'Total PnL',
      value: formatCurrency(analysis.totalPnL),
      color: getPnLColor(analysis.totalPnL),
      icon: getPnLIcon(analysis.totalPnL),
      subtitle: analysis.totalPnL > 0 ? 'Profit' : analysis.totalPnL < 0 ? 'Loss' : 'Balanced'
    },
    {
      title: 'Total Volume',
      value: formatCurrency(analysis.totalVolume),
      color: 'text-white',
      icon: '💰',
      subtitle: `${analysis.totalTrades} trades`
    },
    {
      title: 'Win Rate',
      value: formatPercentage(analysis.winRate),
      color: analysis.winRate >= 50 ? 'text-green-400' : 'text-red-400',
      icon: analysis.winRate >= 50 ? '🎯' : '📉',
      subtitle: `${analysis.totalTrades} trades`
    },
    {
      title: 'Total Fees',
      value: formatCurrency(analysis.totalFees),
      color: 'text-yellow-400',
      icon: '⚡',
      subtitle: `${((analysis.totalFees / analysis.totalVolume) * 100).toFixed(2)}% of volume`
    },
    {
      title: 'Average Win',
      value: formatCurrency(analysis.avgWin),
      color: 'text-green-400',
      icon: '📈',
      subtitle: 'Per winning trade'
    },
    {
      title: 'Average Loss',
      value: formatCurrency(analysis.avgLoss),
      color: 'text-red-400',
      icon: '📉',
      subtitle: 'Per losing trade'
    },
    {
      title: 'Best Asset',
      value: analysis.bestAsset || 'N/A',
      color: 'text-green-400',
      icon: '🏆',
      subtitle: analysis.bestAsset ? formatCurrency(analysis.tradesByAsset[analysis.bestAsset]?.totalPnL || 0) : ''
    },
    {
      title: 'Pire Actif',
      value: analysis.worstAsset || 'N/A',
      color: 'text-red-400',
      icon: '⚠️',
      subtitle: analysis.worstAsset ? formatCurrency(analysis.tradesByAsset[analysis.worstAsset]?.totalPnL || 0) : ''
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-2xl bg-white/5 p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/80">{stat.title}</h3>
            <span className="text-lg">{stat.icon}</span>
          </div>
          <div className={`text-xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
          {stat.subtitle && (
            <div className="text-xs text-white/60 mt-1">
              {stat.subtitle}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
