import { useState, useMemo } from 'react'
import { useCryptoPrices } from '../hooks/useCryptoPrices'
import { convertJsonToPnLData, detectDataFormat } from '../utils/pnlDataConverter'

interface VueCalendrierProps {
  jsonData?: string | null
  onShowImport?: () => void
  isModal?: boolean
}

interface DayPnL {
  date: number
  pnl: number
  isCurrentMonth: boolean
  isToday: boolean
  dateKey: string
}

export function VueCalendrier({ jsonData, onShowImport, isModal = false }: VueCalendrierProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currency, setCurrency] = useState<'SOL' | 'USD'>('SOL')
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [detailsCurrency, setDetailsCurrency] = useState<'SOL' | 'USD'>('SOL')
  const { prices } = useCryptoPrices()

  // Calculate daily PnL data based on actual trade dates
  const dailyPnL = useMemo(() => {
    if (!jsonData) return {}
    
    try {
      const data = JSON.parse(jsonData)
      const dailyData: { [key: string]: number } = {}
      
      // Detect data format
      const format = detectDataFormat(jsonData)
      
      if (format === 'mockape') {
        // MockApe format: each entry is a trade with timestamp
        data.forEach((entry: any) => {
          const date = new Date(entry.timestamp)
          const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = 0
          }
          
          // Add this trade's PnL to the day total (in SOL)
          dailyData[dateKey] += entry.pnlSol
        })
      } else if (format === 'trades') {
        // Standard trades format: each entry has a date
        data.forEach((trade: any) => {
          const date = new Date(trade.date)
          const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = 0
          }
          
          // Calculate this trade's PnL (in USD for standard trades)
          const tradeValue = trade.quantity * trade.price
          let pnl = 0
          if (trade.side === 'sell') {
            pnl = tradeValue - (trade.fees || 0)
          } else {
            pnl = -(tradeValue + (trade.fees || 0))
          }
          
          dailyData[dateKey] += pnl
        })
      }
      
      return dailyData
    } catch (error) {
      console.error('Error parsing JSON data:', error)
      return {}
    }
  }, [jsonData, prices.SOL.price]) // Recalculate when SOL price changes

  // Generate calendar (only days of current month)
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: DayPnL[] = []
    const today = new Date()
    
    // Générer seulement 35 jours (5 semaines) au lieu de 42 (6 semaines)
    for (let i = 0; i < 35; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      // Ne pas afficher les jours d'octobre (ou du mois suivant)
      if (date.getMonth() > month) {
        continue
      }
      
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const pnl = dailyPnL[dateKey] || 0
      
      days.push({
        date: date.getDate(),
        pnl: currency === 'USD' ? pnl * (prices.SOL.price || 1) : pnl,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        dateKey: dateKey
      })
    }
    
    return days
  }, [currentDate, dailyPnL, currency, prices.SOL.price])

  // Calculer les détails d'un jour spécifique
  const dayDetails = useMemo(() => {
    if (!selectedDay || !jsonData) return null

    try {
      const data = JSON.parse(jsonData)
      const format = detectDataFormat(jsonData)
      
      let dayTrades: any[] = []
      
      if (format === 'mockape') {
        dayTrades = data.filter((entry: any) => {
          const date = new Date(entry.timestamp)
          const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          return dateKey === selectedDay
        })
      } else if (format === 'trades') {
        dayTrades = data.filter((trade: any) => {
          const date = new Date(trade.date)
          const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          return dateKey === selectedDay
        })
      }

      if (dayTrades.length === 0) return null

      let buyCount = 0
      let sellCount = 0
      let bestTrade = 0
      let worstTrade = 0

      if (format === 'mockape') {
        // Pour MockApe, chaque entrée représente un trade complet (round-trip)
        // Display winning trades as "sales" and losing trades as "purchases"
        buyCount = dayTrades.filter((t: any) => t.pnlSol < 0).length // Losing trades
        sellCount = dayTrades.filter((t: any) => t.pnlSol > 0).length // Winning trades
        bestTrade = Math.max(...dayTrades.map((t: any) => t.pnlSol))
        worstTrade = Math.min(...dayTrades.map((t: any) => t.pnlSol))
      } else if (format === 'trades') {
        buyCount = dayTrades.filter((t: any) => t.side === 'buy').length
        sellCount = dayTrades.filter((t: any) => t.side === 'sell').length
        
        const tradePnLs = dayTrades.map((trade: any) => {
          const tradeValue = trade.quantity * trade.price
          if (trade.side === 'sell') {
            return tradeValue - (trade.fees || 0)
          } else {
            return -(tradeValue + (trade.fees || 0))
          }
        })
        
        bestTrade = Math.max(...tradePnLs)
        worstTrade = Math.min(...tradePnLs)
      }

      return {
        date: selectedDay,
        totalTrades: dayTrades.length,
        buyCount,
        sellCount,
        bestTrade: detailsCurrency === 'USD' ? bestTrade * (prices.SOL.price || 1) : bestTrade,
        worstTrade: detailsCurrency === 'USD' ? worstTrade * (prices.SOL.price || 1) : worstTrade,
        trades: dayTrades,
        format: format
      }
    } catch (error) {
      console.error('Erreur lors du calcul des détails du jour:', error)
      return null
    }
  }, [selectedDay, jsonData, detailsCurrency, prices.SOL.price])

  // Calculer les statistiques du mois
  const monthStats = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    let totalPnL = 0
    let positiveDays = 0
    let negativeDays = 0
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    
    // Parcourir les jours du mois
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const pnl = dailyPnL[dateKey] || 0
      const pnlValue = currency === 'USD' ? pnl * (prices.SOL.price || 1) : pnl
      
      totalPnL += pnlValue
      
      if (pnlValue > 0) {
        positiveDays++
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else if (pnlValue < 0) {
        negativeDays++
        tempStreak = 0
      }
    }
    
    // Calculate current streak (from end of month)
    tempStreak = 0
    for (let day = new Date(year, month + 1, 0).getDate(); day >= 1; day--) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const pnl = dailyPnL[dateKey] || 0
      const pnlValue = currency === 'USD' ? pnl * (prices.SOL.price || 1) : pnl
      
      if (pnlValue > 0) {
        tempStreak++
      } else {
        break
      }
    }
    currentStreak = tempStreak
    
    return {
      totalPnL,
      positiveDays,
      negativeDays,
      currentStreak,
      bestStreak
    }
  }, [currentDate, dailyPnL, currency, prices.SOL.price]) // Recalculate when SOL price changes

  const monthNames = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ]

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDayClick = (day: DayPnL) => {
    if (day.pnl !== 0) {
      setSelectedDay(day.dateKey)
      setDetailsCurrency(currency) // Utiliser la même devise que le calendrier
    }
  }

  const closeDetails = () => {
    setSelectedDay(null)
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'bg-green-400/70'
    if (pnl < 0) return 'bg-red-400/70'
    return 'bg-gray-600/50'
  }

  if (!jsonData) {
  return (
      <section className="space-y-6">
        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📅</div>
            <h2 className="text-2xl font-bold mb-4">PnL Calendar</h2>
            <p className="text-white/80 text-lg mb-6">
              Import your JSON data to see your interactive PnL calendar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold mb-2">Daily PnL</h3>
                <p className="text-sm text-white/70">Visualize your gains and losses by day</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Win Streaks</h3>
                <p className="text-sm text-white/70">Track your best sequences</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold mb-2">Multi-Currency</h3>
                <p className="text-sm text-white/70">SOL and USD in one click</p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-xl">
              <p className="text-[#06B6D4] font-medium mb-3">
                💡 Import your JSON data to see the calendar
              </p>
              {onShowImport && (
                <button
                  onClick={onShowImport}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#14F195] to-[#06B6D4] text-black font-semibold hover:from-[#12D885] hover:to-[#0891B2] transition-colors"
                >
                  📊 Import Data
                </button>
              )}
            </div>
          </div>
        </div>
    </section>
  )
}

  return (
    <div className={isModal ? "" : "space-y-4"}>
      {/* Header */}
      <div className={`${isModal ? "bg-white/5" : "rounded-3xl bg-white/5 border border-white/10"} p-4`}>
        <div className="flex items-center justify-between mb-3">
          {!isModal && <h2 className="text-xl font-bold text-white">📅 PnL Calendar</h2>}
          <div className={`flex items-center gap-3 ${isModal ? "ml-auto" : ""}`}>
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
            >
              ←
            </button>
            <span className="text-base font-semibold text-white min-w-[80px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
            >
              →
            </button>
            <button
              onClick={() => setCurrency(currency === 'SOL' ? 'USD' : 'SOL')}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#14F195] to-[#06B6D4] text-black font-semibold hover:from-[#12D885] hover:to-[#0891B2] transition-colors text-sm"
            >
              {currency === 'SOL' ? 'SOL' : '$'}
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/80 text-xs">Total:</span>
            <span className={`text-xs font-bold ${monthStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {monthStats.totalPnL >= 0 ? '+' : ''}{monthStats.totalPnL.toFixed(currency === 'USD' ? 2 : 3)} {currency}
            </span>
          </div>
          <div className="flex h-2 bg-gray-700 rounded overflow-hidden">
            {monthStats.positiveDays > 0 && (
              <div 
                className="bg-green-400/70 h-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(monthStats.positiveDays / (monthStats.positiveDays + monthStats.negativeDays)) * 100}%` }}
              >
                {monthStats.positiveDays}
              </div>
            )}
            {monthStats.negativeDays > 0 && (
              <div 
                className="bg-red-400/70 h-full flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(monthStats.negativeDays / (monthStats.positiveDays + monthStats.negativeDays)) * 100}%` }}
              >
                {monthStats.negativeDays}
              </div>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-white/60 text-sm font-medium">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`
                h-20 p-1 rounded flex flex-col items-center justify-center text-sm font-medium transition-all cursor-pointer relative
                ${day.isCurrentMonth ? 'text-white' : 'text-white/40'}
                ${day.isToday ? 'ring-2 ring-[#14F195]' : ''}
                ${day.pnl !== 0 ? getPnLColor(day.pnl) : 'bg-gray-600/30 hover:bg-gray-600/50'}
                ${hoveredDay === day.dateKey ? 'scale-105 shadow-md' : ''}
              `}
              onMouseEnter={() => setHoveredDay(day.dateKey)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => handleDayClick(day)}
              title={day.pnl !== 0 ? `${day.pnl > 0 ? '+' : ''}${day.pnl.toFixed(currency === 'USD' ? 2 : 3)} ${currency}` : 'No trades'}
            >
              <span className="text-sm leading-none font-semibold">{day.date}</span>
              {day.pnl !== 0 && (
                <span className="text-xs font-bold leading-none mt-1">
                  {day.pnl > 0 ? '+' : ''}{day.pnl.toFixed(currency === 'USD' ? 2 : 3)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-2 flex justify-between items-center text-xs text-white/70">
          <div>
            <span>Streak: {monthStats.currentStreak}</span>
            <span className="ml-2">Best: {monthStats.bestStreak}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400">+{monthStats.positiveDays}</span>
            <span className="text-red-400">-{monthStats.negativeDays}</span>
          </div>
        </div>
      </div>

      {/* Day details modal */}
      {selectedDay && dayDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                📊 Details for {new Date(selectedDay).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              <button
                onClick={closeDetails}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Currency toggle */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setDetailsCurrency(detailsCurrency === 'SOL' ? 'USD' : 'SOL')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#14F195] to-[#06B6D4] text-black font-semibold hover:from-[#12D885] hover:to-[#0891B2] transition-colors"
              >
                {detailsCurrency === 'SOL' ? 'SOL' : '$'}
              </button>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              {/* Number of transactions */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-lg font-semibold mb-3 text-white">📈 Transactions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{dayDetails.buyCount}</div>
                    <div className="text-sm text-white/70">
                      {dayDetails.format === 'mockape' ? 'Losing trades' : 'Buys'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{dayDetails.sellCount}</div>
                    <div className="text-sm text-white/70">
                      {dayDetails.format === 'mockape' ? 'Winning trades' : 'Sells'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-lg font-bold text-white">Total: {dayDetails.totalTrades} trades</div>
                </div>
              </div>

              {/* Best and worst trade */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-lg font-semibold mb-3 text-white">🎯 Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">
                      {dayDetails.bestTrade > 0 ? '+' : ''}{dayDetails.bestTrade.toFixed(detailsCurrency === 'USD' ? 2 : 3)}
                    </div>
                    <div className="text-sm text-white/70">Best trade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-400">
                      {dayDetails.worstTrade > 0 ? '+' : ''}{dayDetails.worstTrade.toFixed(detailsCurrency === 'USD' ? 2 : 3)}
                    </div>
                    <div className="text-sm text-white/70">Worst trade</div>
                  </div>
                </div>
                <div className="mt-3 text-center text-sm text-white/60">
                  Values in {detailsCurrency}
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={closeDetails}
                className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}