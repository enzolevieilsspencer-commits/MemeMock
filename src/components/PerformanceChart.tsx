import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TradeAnalysis } from '../types/trades'
import { format, parseISO } from 'date-fns'
import { en } from 'date-fns/locale'

interface PerformanceChartProps {
  analysis: TradeAnalysis
}

const COLORS = ['#14F195', '#9945FF', '#06B6D4', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#F97316']

export function PerformanceChart({ analysis }: PerformanceChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM yyyy', { locale: en })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white/80 text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-white">
              PnL: <span className="font-semibold">{formatCurrency(payload[0].value)}</span>
            </p>
            <p className="text-white/80">
              Volume: <span className="font-semibold">{formatCurrency(payload[1].value)}</span>
            </p>
            <p className="text-white/80">
              Trades: <span className="font-semibold">{payload[2].value}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white font-semibold">{data.asset}</p>
          <p className="text-white/80">
            Volume: <span className="font-semibold">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-white/80">
            PnL: <span className={`font-semibold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(data.pnl)}
            </span>
          </p>
          <p className="text-white/80">
            Trades: <span className="font-semibold">{data.trades}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Prepare data for monthly chart
  const monthlyData = Object.entries(analysis.monthlyStats)
    .map(([month, stats]) => ({
      month: formatDate(month),
      pnl: stats.totalPnL,
      volume: stats.totalVolume,
      trades: stats.totalTrades,
      winRate: stats.winRate
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Prepare data for asset pie chart
  const assetData = Object.entries(analysis.tradesByAsset)
    .map(([asset, stats]) => ({
      asset,
      value: stats.totalVolume,
      pnl: stats.totalPnL,
      trades: stats.totalTrades,
      percentage: (stats.totalVolume / analysis.totalVolume) * 100
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 assets

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly chart */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" fill="#14F195" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset pie chart */}
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Distribution by Asset</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ asset, percentage }) => `${asset} (${percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {assetData.slice(0, 4).map((asset, index) => (
            <div key={asset.asset} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-white/80 truncate">{asset.asset}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
