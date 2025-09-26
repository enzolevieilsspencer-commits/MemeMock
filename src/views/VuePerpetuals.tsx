import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FixedTopTaskbar } from '../components/FixedTopTaskbar'
import { FixedTaskbar } from '../components/FixedTaskbar'
import { TabKey } from '../components/Tabs'
import { useCryptoPrices } from '../hooks/useCryptoPrices'
import { useOrderBook } from '../hooks/useOrderBook'

// Déclaration TypeScript pour TradingView
declare global {
  interface Window {
    TradingView: any
  }
}

interface VuePerpetualsProps {
  onTabChange?: (key: TabKey) => void
  onAccountClick?: () => void
  onLogout?: () => void
  onSettings?: () => void
  onLogoClick?: () => void
  onLoadSession?: (data: string) => void
  onNewSession?: () => void
  onCloseSession?: () => void
  onDeleteSession?: (sessionId: string) => void
  isAuthenticated?: boolean
  userEmail?: string
  userPseudo?: string
  userAvatar?: string
  userId?: string
}

export function VuePerpetuals({
  onTabChange,
  onAccountClick,
  onLogout,
  onSettings,
  onLogoClick,
  onLoadSession,
  onNewSession,
  onCloseSession,
  onDeleteSession,
  isAuthenticated,
  userEmail,
  userPseudo,
  userAvatar,
  userId
}: VuePerpetualsProps) {
  const navigate = useNavigate()
  const { prices } = useCryptoPrices()
  const [selectedCrypto] = useState<'BTC' | 'ETH' | 'SOL'>('BTC')
  const { orderBook } = useOrderBook(selectedCrypto, prices[selectedCrypto].price)
  const [balance, setBalance] = useState(10000) // Balance fictive de départ
  const [positions, setPositions] = useState<Array<{
    id: string
    symbol: string
    side: 'long' | 'short'
    size: number
    entryPrice: number
    currentPrice: number
    leverage: number
    pnl: number
    timestamp: Date
  }>>([])
  const [orderType] = useState<'market' | 'limit'>('market')
  const [side] = useState<'long' | 'short'>('long')
  const [size] = useState('')
  const [leverage] = useState(1)

  // Données des perpétuels basées sur les prix en temps réel
  const perpetualsData = {
    BTC: {
      symbol: 'BTC-PERP',
      price: prices.BTC.price,
      change24h: prices.BTC.change24h,
      volume24h: prices.BTC.volume24h,
      openInterest: 12500000000,
      fundingRate: 0.00125,
      nextFunding: '00:01:06'
    },
    ETH: {
      symbol: 'ETH-PERP',
      price: prices.ETH.price,
      change24h: prices.ETH.change24h,
      volume24h: prices.ETH.volume24h,
      openInterest: 8500000000,
      fundingRate: 0.00089,
      nextFunding: '00:01:06'
    },
    SOL: {
      symbol: 'SOL-PERP',
      price: prices.SOL.price,
      change24h: prices.SOL.change24h,
      volume24h: prices.SOL.volume24h,
      openInterest: 3200000000,
      fundingRate: 0.00045,
      nextFunding: '00:01:06'
    }
  }

  const currentData = perpetualsData[selectedCrypto]

  // const formatNumber = (num: number) => {
  //   if (num >= 1000000000) {
  //     return `$${(num / 1000000000).toFixed(1)}B`
  //   } else if (num >= 1000000) {
  //     return `$${(num / 1000000).toFixed(1)}M`
  //   } else if (num >= 1000) {
  //     return `$${(num / 1000).toFixed(1)}K`
  //   }
  //   return `$${num.toFixed(2)}`
  // }


  // Charger le widget TradingView pour BTC
  useEffect(() => {
    // Nettoyer les anciens widgets
    const existingWidgets = document.querySelectorAll('.tradingview-widget-container')
    existingWidgets.forEach(widget => widget.remove())
    
    // Nettoyer les anciens scripts
    const existingScripts = document.querySelectorAll('script[src*="tv.js"]')
    existingScripts.forEach(script => script.remove())
    
    const widgetContainer = document.getElementById('tradingview-widget-perpetuals')
    if (widgetContainer) {
      widgetContainer.innerHTML = `
        <div class="tradingview-widget-container" style="height: 100%; width: 100%;">
          <div id="tradingview_btc_perpetuals" style="height: 100%; width: 100%;"></div>
          <div class="tradingview-widget-copyright">
            <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
              <span class="blue-text">Track all markets on TradingView</span>
            </a>
          </div>
        </div>
      `

      // Charger le script TradingView
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            autosize: true,
            symbol: 'BINANCE:BTCUSDT',
            interval: '15',
            timezone: 'Europe/Paris',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#1e1e1e',
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: true,
            container_id: 'tradingview_btc_perpetuals',
            support_host: 'https://www.tradingview.com',
            // Tous les outils de dessin TradingView natifs activés
            drawing_tools: {
              enabled: true,
              default_tool: 'crosshair'
            },
            // Barre d'outils de dessin visible
            toolbar: {
              enabled: true,
              position: 'left'
            },
            // Pas d'indicateurs par défaut
            studies: [],
            // Interface complète TradingView
            overrides: {
              'paneProperties.background': '#0d1117',
              'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.1)',
              'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.1)',
              'scalesProperties.textColor': '#ffffff',
              'mainSeriesProperties.candleStyle.upColor': '#26a69a',
              'mainSeriesProperties.candleStyle.downColor': '#ef5350',
              'mainSeriesProperties.candleStyle.drawWick': true,
              'mainSeriesProperties.candleStyle.drawBorder': true,
              'mainSeriesProperties.candleStyle.borderColor': '#ffffff',
              'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
              'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
              'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
              'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350'
            },
            // Fonctionnalités avancées
            enabled_features: [
              'side_toolbar_in_fullscreen_mode',
              'header_in_fullscreen_mode',
              'use_localstorage_for_settings'
            ],
            disabled_features: [
              'volume_force_overlay',
              'create_volume_indicator_by_default'
            ]
          })
        }
      }
      script.onerror = () => {
        console.error('Failed to load TradingView script.')
      }
      document.head.appendChild(script)
    }

    return () => {
      // Nettoyage
      const scripts = document.querySelectorAll('script[src*="tv.js"]')
      scripts.forEach(script => script.remove())
    }
  }, [])

  // Calculer le PnL total
  // const totalPnL = positions.reduce((sum, position) => {
  //   const priceChange = position.side === 'long' 
  //     ? (currentData.price - position.entryPrice) / position.entryPrice
  //     : (position.entryPrice - currentData.price) / position.entryPrice
    
  //   return sum + (position.size * position.leverage * priceChange)
  // }, 0)

  // const handlePlaceOrder = () => {
  //   if (!size || parseFloat(size) <= 0) return

  //   const orderSize = parseFloat(size)
  //   const requiredMargin = (orderSize * currentData.price) / leverage

  //   if (requiredMargin > balance) {
  //     alert('Balance insuffisante pour cette position')
  //     return
  //   }

  //   const newPosition = {
  //     id: Date.now().toString(),
  //     symbol: currentData.symbol,
  //     side,
  //     size: orderSize,
  //     entryPrice: currentData.price,
  //     currentPrice: currentData.price,
  //     leverage,
  //     pnl: 0,
  //     timestamp: new Date()
  //   }

  //   setPositions(prev => [...prev, newPosition])
  //   setBalance(prev => prev - requiredMargin)
  //   setSize('')
  // }

  // const handleClosePosition = (positionId: string) => {
  //   const position = positions.find(p => p.id === positionId)
  //   if (!position) return

  //   const priceChange = position.side === 'long' 
  //     ? (currentData.price - position.entryPrice) / position.entryPrice
  //     : (position.entryPrice - currentData.price) / position.entryPrice
    
  //   const pnl = position.size * position.leverage * priceChange
  //   const marginReturn = (position.size * position.entryPrice) / position.leverage

  //   setBalance(prev => prev + marginReturn + pnl)
  //   setPositions(prev => prev.filter(p => p.id !== positionId))
  // }

  const handleCryptoClick = (symbol: 'BTC' | 'ETH' | 'SOL') => {
    navigate(`/crypto/${symbol.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Fixed Top Taskbar */}
      <FixedTopTaskbar 
        active="perpetuals" 
        onChange={onTabChange || (() => {})}
        onAccountClick={onAccountClick || (() => {})}
        onLogout={onLogout || (() => {})}
        onSettings={onSettings || (() => {})}
        onLogoClick={onLogoClick || (() => {})}
        onLoadSession={onLoadSession}
        onNewSession={onNewSession || (() => {})}
        onCloseSession={onCloseSession || (() => {})}
        onDeleteSession={onDeleteSession}
        isAuthenticated={isAuthenticated || false}
        userEmail={userEmail}
        userPseudo={userPseudo}
        userAvatar={userAvatar}
        userId={userId}
      />
      
      <main className="relative h-[calc(100vh-80px)] mt-12 flex flex-col">


      {/* Main Content Area */}
      <div className="flex-1 flex">

        {/* Main Chart Area - Fixed Width */}
        <div className="w-[60rem] flex flex-col pt-16">

          {/* TradingView Chart */}
          <div className="h-[32rem] relative">
            <div id="tradingview-widget-perpetuals" className="w-full h-full"></div>
          </div>

        </div>

        {/* Right Panel - Order Book - Fixed Width */}
        <div className="w-64 bg-gray-800/30 border-l border-white/5 flex flex-col h-[calc(100vh-80px)]">
          {/* Order Book Header */}
          <div className="p-4 border-b border-white/10">
            <div className="text-white font-semibold">Order Book</div>
          </div>

          {/* Order Book Content */}
          <div className="flex-1 p-2 overflow-hidden">
            <div className="text-white/60 text-[10px] mb-2 flex justify-between">
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
            </div>
            
            {/* Sell Orders */}
            <div className="space-y-0 mb-1">
              {orderBook.asks.slice(0, 12).map((ask, index) => (
                <div key={`ask-${index}`} className="flex items-center justify-between text-[10px] py-0.5 px-1 hover:bg-red-500/10 transition-colors relative">
                  <span className="text-red-400">
                    {selectedCrypto === 'BTC' ? ask.price.toFixed(0) : 
                     selectedCrypto === 'ETH' ? ask.price.toFixed(0) : 
                     ask.price.toFixed(2)}
                  </span>
                  <span className="text-white/70">
                    {ask.amount.toFixed(0)}
                  </span>
                  <span className="text-white/50">
                    {ask.total.toFixed(0)}
                  </span>
                  <div className="absolute left-0 top-0 bottom-0 bg-red-500/20 opacity-30" style={{ width: `${(ask.amount / Math.max(...orderBook.asks.map(a => a.amount))) * 100}%` }}></div>
                </div>
              ))}
            </div>

            {/* Current Price */}
            <div className="text-center py-1 border-y border-white/10 bg-white/5">
              <div className="text-white font-semibold text-xs">
                {selectedCrypto === 'BTC' ? prices.BTC.price.toFixed(0) : 
                 selectedCrypto === 'ETH' ? prices.ETH.price.toFixed(0) : 
                 prices.SOL.price.toFixed(2)}
              </div>
              <div className="text-white/60 text-[9px]">
                Spread: {selectedCrypto === 'BTC' ? orderBook.spread.toFixed(0) : 
                        selectedCrypto === 'ETH' ? orderBook.spread.toFixed(0) : 
                        orderBook.spread.toFixed(2)} ({orderBook.spreadPercentage.toFixed(3)}%)
              </div>
            </div>

            {/* Buy Orders */}
            <div className="space-y-0 mt-1">
              {orderBook.bids.slice(0, 12).map((bid, index) => (
                <div key={`bid-${index}`} className="flex items-center justify-between text-[10px] py-0.5 px-1 hover:bg-green-500/10 transition-colors relative">
                  <span className="text-green-400">
                    {selectedCrypto === 'BTC' ? bid.price.toFixed(0) : 
                     selectedCrypto === 'ETH' ? bid.price.toFixed(0) : 
                     bid.price.toFixed(2)}
                  </span>
                  <span className="text-white/70">
                    {bid.amount.toFixed(0)}
                  </span>
                  <span className="text-white/50">
                    {bid.total.toFixed(0)}
                  </span>
                  <div className="absolute left-0 top-0 bottom-0 bg-green-500/20 opacity-30" style={{ width: `${(bid.amount / Math.max(...orderBook.bids.map(b => b.amount))) * 100}%` }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Fixed taskbar */}
      <FixedTaskbar onCryptoClick={handleCryptoClick} />
    </div>
  )
}
