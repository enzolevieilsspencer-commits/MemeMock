import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { motion } from 'framer-motion'

interface PnLDataPoint {
  date: string
  timestamp: number
  pnl: number
  cumulativePnl: number
  // Propriétés supplémentaires pour MockApe
  tokenName?: string
  solInvested?: number
  solReceived?: number
  // Propriétés supplémentaires pour trades standard
  asset?: string
  side?: 'buy' | 'sell'
  quantity?: number
  price?: number
}

interface PnLChartProps {
  data: PnLDataPoint[]
  title?: string
  solPriceUsd?: number
}

type TimeFilter = '1d' | '1w' | '1m' | 'all'

export function PnLChart({ data, title = "Realized PNL", solPriceUsd }: PnLChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    let filtered: PnLDataPoint[] = []
    
    switch (timeFilter) {
      case '1d':
        // Filtrer uniquement les trades du jour actuel
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime()
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime()
        
        filtered = data.filter(point => {
          const tradeDate = new Date(point.timestamp)
          const tradeDateStart = new Date(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate(), 0, 0, 0, 0).getTime()
          return tradeDateStart >= todayStart && tradeDateStart <= todayEnd
        })
        break
        
      case '1w':
        const now = Date.now()
        const weekCutoff = now - (7 * 24 * 60 * 60 * 1000)
        filtered = data.filter(point => point.timestamp >= weekCutoff)
        break
        
      case '1m':
        const nowMonth = Date.now()
        const monthCutoff = nowMonth - (30 * 24 * 60 * 60 * 1000)
        filtered = data.filter(point => point.timestamp >= monthCutoff)
        break
        
      default:
        filtered = data
    }
    
    // Trier par timestamp croissant (plus ancien en premier) pour les graphiques
    return filtered.sort((a, b) => a.timestamp - b.timestamp)
  }, [data, timeFilter])

  // Recalculate cumulative PnL for the selected period
  const recalculatedData = useMemo(() => {
    if (filteredData.length === 0) return []
    
    // If it's "1 Day", reset each day
    if (timeFilter === '1d') {
      // Group data by day
      const dailyGroups: { [key: string]: PnLDataPoint[] } = {}
      
      filteredData.forEach((point) => {
        const date = new Date(point.timestamp)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        
        if (!dailyGroups[dateKey]) {
          dailyGroups[dateKey] = []
        }
        dailyGroups[dateKey].push(point)
      })
      
      // Recalculate cumulative PnL by resetting each day
      const result: PnLDataPoint[] = []
      const sortedDays = Object.keys(dailyGroups).sort()
      
      sortedDays.forEach((dayKey) => {
        const dayTrades = dailyGroups[dayKey].sort((a, b) => a.timestamp - b.timestamp)
        let dailyCumulativePnlSol = 0
        
        dayTrades.forEach((point) => {
          dailyCumulativePnlSol += point.pnl // pnl is in SOL for MockApe
          result.push({
            ...point,
            cumulativePnl: dailyCumulativePnlSol * (solPriceUsd || 1) // Convert to USD
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
          cumulativePnl: cumulativePnlSol * (solPriceUsd || 1) // Convert to USD
        }
      })
    }
  }, [filteredData, timeFilter, solPriceUsd])

  // Create data that always starts from zero with equal spacing
  const chartData = useMemo(() => {
    if (recalculatedData.length === 0) return []
    
    // If it's "1 Day", handle daily reset
    if (timeFilter === '1d') {
      // Group by day to add reset points
      const dailyGroups: { [key: string]: PnLDataPoint[] } = {}
      
      recalculatedData.forEach((point) => {
        const date = new Date(point.timestamp)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        
        if (!dailyGroups[dateKey]) {
          dailyGroups[dateKey] = []
        }
        dailyGroups[dateKey].push(point)
      })
      
      // Create data with daily reset
      const result: any[] = []
      const sortedDays = Object.keys(dailyGroups).sort()
      let displayIndex = 0
      
      sortedDays.forEach((dayKey, dayIndex) => {
        const dayTrades = dailyGroups[dayKey].sort((a, b) => a.timestamp - b.timestamp)
        
        // Ajouter un point de départ à zéro pour chaque jour (sauf le premier)
        if (dayIndex > 0) {
          result.push({
            date: new Date(dayTrades[0].timestamp - 1000).toISOString(),
            timestamp: dayTrades[0].timestamp - 1000,
            displayTimestamp: displayIndex++,
            originalTimestamp: dayTrades[0].timestamp - 1000,
            pnl: 0,
            cumulativePnl: 0,
            isDayStart: true
          })
        }
        
        // Ajouter les trades du jour
        dayTrades.forEach((point) => {
          result.push({
            ...point,
            displayTimestamp: displayIndex++,
            originalTimestamp: point.timestamp
          })
        })
      })
      
      // Ajouter un point de départ initial si nécessaire
      if (result.length > 0) {
        const startPoint = {
          date: new Date(result[0].originalTimestamp - 1000).toISOString(),
          timestamp: -1,
          displayTimestamp: -1,
          originalTimestamp: result[0].originalTimestamp - 1000,
          pnl: 0,
          cumulativePnl: 0,
          isDayStart: true
        }
        return [startPoint, ...result]
      }
      
      return result
    } else {
      // For other periods, no reset - simple equal spacing
      const dataWithEqualSpacing = recalculatedData.map((point, index) => ({
        ...point,
        displayTimestamp: index,
        originalTimestamp: point.timestamp
      }))
      
      // Commencer par un point à zéro
      const startPoint = {
        date: new Date(recalculatedData[0].timestamp - 1000).toISOString(),
        timestamp: -1,
        displayTimestamp: -1,
        originalTimestamp: recalculatedData[0].timestamp - 1000,
        pnl: 0,
        cumulativePnl: 0
      }
      
      return [startPoint, ...dataWithEqualSpacing]
    }
  }, [recalculatedData, timeFilter])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // const formatXAxisTick = (index: number) => {
  //   // Afficher simplement le numéro du trade
  //   if (index === -1) return 'Début'
  //   return `Trade ${index + 1}`
  // }

  const formatTooltipValue = (value: number) => {
    return `${value >= 0 ? '+' : ''}$${value.toFixed(2)}`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isMockApe = !!data.tokenName
      const isDayStart = !!data.isDayStart
      
      return (
        <div className="bg-gray-800/90 border border-white/20 rounded-lg p-3 shadow-xl min-w-[200px]">
          {isDayStart ? (
            <div>
              <p className="text-white font-medium text-center">
                🌅 Nouvelle journée
              </p>
              <p className="text-white/70 text-sm text-center">
                PnL reset to $0.00
              </p>
              <p className="text-white/60 text-xs text-center">
                {formatDate(data.originalTimestamp || data.timestamp)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-white font-medium text-center mb-2">
                💰 Trade Details
              </p>
              
              {/* Nom du token/asset */}
              <p className="text-white/90 text-sm font-semibold">
                {isMockApe ? data.tokenName : data.asset}
              </p>
              
              {/* Prix */}
              {data.price && (
                <p className="text-white/70 text-xs">
                  Price: ${data.price.toFixed(6)}
                </p>
              )}
              
              {/* Quantité */}
              {data.quantity && (
                <p className="text-white/70 text-xs">
                  Quantity: {data.quantity.toFixed(4)}
                </p>
              )}
              
              {/* Invested/received amount */}
              {isMockApe && data.solInvested && data.solReceived && (
                <div className="my-2 p-2 bg-gray-700/50 rounded">
                  <p className="text-white/80 text-xs">
                    SOL Invested: {data.solInvested.toFixed(4)}
                  </p>
                  <p className="text-white/80 text-xs">
                    SOL Received: {data.solReceived.toFixed(4)}
                  </p>
                </div>
              )}
              
              {/* Trade side */}
              {data.side && (
                <p className="text-white/70 text-xs">
                  Type: {data.side === 'buy' ? '🟢 Buy' : '🔴 Sell'}
                </p>
              )}
              
              {/* Trade PnL */}
              <div className="mt-2 p-2 bg-gray-700/50 rounded">
                <p className="text-white/90 text-sm font-semibold">
                  PnL Trade: {formatTooltipValue(isMockApe ? data.pnl * (solPriceUsd || 1) : data.pnl)}
                </p>
                {isMockApe && (
                  <p className="text-white/70 text-xs">
                    ({data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(4)} SOL)
                  </p>
                )}
              </div>
              
              {/* Cumulative PnL */}
              <p className="text-white/90 text-sm font-semibold mt-2">
                Cumulative PnL: {formatTooltipValue(data.cumulativePnl)}
              </p>
              
              {/* Date */}
              <p className="text-white/60 text-xs mt-2 text-center">
                {formatDate(data.originalTimestamp || data.timestamp)}
              </p>
            </div>
          )}
        </div>
      )
    }
    return null
  }


  const timeFilters = [
    { key: '1d', label: '1 Day' },
    { key: '1w', label: '1 Week' },
    { key: '1m', label: '1 Month' },
    { key: 'all', label: 'All' }
  ] as const

  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <div className="text-center py-12">
          <div className="text-6xl mb-6">📈</div>
          <h3 className="text-xl font-semibold mb-2">No PnL Data</h3>
          <p className="text-white/70">Import your data to see the PnL chart</p>
        </div>
      </div>
    )
  }

  // Vérification supplémentaire pour éviter les erreurs
  if (filteredData.length === 0) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
        <div className="text-center py-12">
          <div className="text-6xl mb-6">📅</div>
          <h3 className="text-xl font-semibold mb-2">No data for this period</h3>
          <p className="text-white/70">
            No trades found for the selected period: {timeFilters.find(f => f.key === timeFilter)?.label || 'All periods'}
          </p>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-3xl bg-white/5 p-6 border border-white/10"
    >
      {/* Header avec titre et filtres */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {solPriceUsd && (
            <p className="text-sm text-white/60 mt-1">
              Valeurs en USD (SOL: ${solPriceUsd.toFixed(2)})
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {timeFilters.map((filter, index) => (
            <motion.button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key)}
              className={`px-3 py-1.5 text-sm rounded-lg chart-fast-transition ${
                timeFilter === filter.key
                  ? 'bg-[#06B6D4] text-white'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01, duration: 0.15 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <motion.div
          key={timeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-full w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="displayTimestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              hide={true}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeDasharray="2 2" />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Ligne bleue simple */}
            <Line
              type="monotone"
              dataKey="cumulativePnl"
              stroke="#06B6D4"
              strokeWidth={3}
              dot={{ 
                r: 4, 
                fill: '#06B6D4',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
              activeDot={{ 
                r: 6, 
                fill: '#06B6D4',
                stroke: '#ffffff',
                strokeWidth: 3
              }}
            />
              </LineChart>
            </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick statistics */}
      <div className="mt-6">
        <div className="text-center mb-4">
          <h4 className="text-lg font-semibold text-white">
            📊 Statistics - {timeFilters.find(f => f.key === timeFilter)?.label || 'All periods'}
          </h4>
        </div>
        
        {/* Calculate real statistics based on filtered data */}
        {(() => {
          // Calculate total PnL for the period
          const totalPnL = filteredData.reduce((sum, point) => {
            // For MockApe, point.pnl is already in SOL, so we convert to USD
            // For standard trades, point.pnl is already in USD
            const pnlUsd = point.tokenName ? point.pnl * (solPriceUsd || 1) : point.pnl
            return sum + pnlUsd
          }, 0)
          
          // Calculate total volume
          const totalVolume = filteredData.reduce((sum, point) => {
            const volumeUsd = point.tokenName ? Math.abs(point.pnl * (solPriceUsd || 1)) : Math.abs(point.pnl)
            return sum + volumeUsd
          }, 0)
          
          // Calculer les pics et creux quotidiens
          const dailyPnL: { [key: string]: number } = {}
          filteredData.forEach((point) => {
            const date = new Date(point.timestamp)
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            const pnlUsd = point.tokenName ? point.pnl * (solPriceUsd || 1) : point.pnl
            
            if (!dailyPnL[dateKey]) {
              dailyPnL[dateKey] = 0
            }
            dailyPnL[dateKey] += pnlUsd
          })
          
          const dailyValues = Object.values(dailyPnL)
          const bestDay = dailyValues.length > 0 ? Math.max(...dailyValues) : 0
          const worstDay = dailyValues.length > 0 ? Math.min(...dailyValues) : 0
          
          return (
            <motion.div
              key={timeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div 
                      className={`text-2xl font-bold ${
                        totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      ${totalPnL.toFixed(2)}
                    </div>
                    <div className="text-sm text-white/60">Total PnL</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      ${bestDay.toFixed(2)}
                    </div>
                    <div className="text-sm text-white/60">Best Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      ${worstDay.toFixed(2)}
                    </div>
                    <div className="text-sm text-white/60">Worst Day</div>
                  </div>
                </div>
                
                {/* Additional statistics */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">
                      {filteredData.length}
                    </div>
                    <div className="text-sm text-white/60">Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">
                      ${totalVolume.toFixed(2)}
                    </div>
                    <div className="text-sm text-white/60">Volume</div>
                  </div>
                </div>
            </motion.div>
          )
        })()}
      </div>
    </motion.div>
  )
}