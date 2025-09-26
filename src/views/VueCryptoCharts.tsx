import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Déclaration TypeScript pour TradingView
declare global {
  interface Window {
    TradingView: any
  }
}

interface VueCryptoChartsProps {
  selectedCrypto: 'BTC' | 'ETH' | 'SOL'
}

export function VueCryptoCharts({ selectedCrypto }: VueCryptoChartsProps) {
  const [isChartLoading, setIsChartLoading] = useState(true)
  const navigate = useNavigate()

  const getCryptoInfo = (crypto: 'BTC' | 'ETH' | 'SOL') => {
    switch (crypto) {
      case 'BTC':
        return {
          name: 'Bitcoin',
          symbol: 'BTC',
          logo: '/src/assets/logo-btc.png',
          color: '#F7931A',
          bgColor: '#f7931a'
        }
      case 'ETH':
        return {
          name: 'Ethereum',
          symbol: 'ETH',
          logo: '/src/assets/logo-eth.png',
          color: '#627eea',
          bgColor: '#627eea'
        }
      case 'SOL':
        return {
          name: 'Solana',
          symbol: 'SOL',
          logo: '/src/assets/logo-solana.png',
          color: '#14F195',
          bgColor: '#000000'
        }
    }
  }

  const cryptoInfo = getCryptoInfo(selectedCrypto)

  // Load TradingView widget when component mounts
  useEffect(() => {
    setIsChartLoading(true)
    
    // Clear any existing widgets
    const existingWidgets = document.querySelectorAll('.tradingview-widget-container')
    existingWidgets.forEach(widget => widget.remove())
    
    // Clear existing scripts
    const existingScripts = document.querySelectorAll('script[src*="tv.js"]')
    existingScripts.forEach(script => script.remove())
    
    const widgetContainer = document.getElementById('tradingview-widget')
    if (widgetContainer) {
      widgetContainer.innerHTML = `
        <div class="tradingview-widget-container" style="height: 100%; width: 100%;">
          <div id="tradingview_${selectedCrypto.toLowerCase()}" style="height: 100%; width: 100%;"></div>
          <div class="tradingview-widget-copyright">
            <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
              <span class="blue-text">Track all markets on TradingView</span>
            </a>
          </div>
        </div>
      `

      // Load TradingView script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            autosize: true,
            symbol: `BINANCE:${selectedCrypto}USDT`,
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
            container_id: `tradingview_${selectedCrypto.toLowerCase()}`,
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
          setIsChartLoading(false)
        }
      }
      script.onerror = () => {
        console.error('Failed to load TradingView script.')
        setIsChartLoading(false)
      }
      document.head.appendChild(script)
    }

    return () => {
      // Cleanup
      const scripts = document.querySelectorAll('script[src*="tv.js"]')
      scripts.forEach(script => script.remove())
    }
  }, [selectedCrypto])

  const handleGoBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header with crypto info and controls */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: cryptoInfo.bgColor }}
          >
            <img 
              src={cryptoInfo.logo} 
              alt={cryptoInfo.name}
              className="w-full h-full object-contain p-1"
              style={{
                filter: selectedCrypto === 'SOL' ? 'contrast(1.2) saturate(1.1) brightness(1.3)' : 'none'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = selectedCrypto === 'BTC' ? '₿' : selectedCrypto === 'ETH' ? 'Ξ' : '◎'
                  parent.className = 'w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold'
                  parent.style.color = cryptoInfo.color
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {cryptoInfo.name} ({cryptoInfo.symbol})
            </h1>
            <p className="text-white/60 text-sm">Live Trading Chart</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/20"
          >
            ← Back to Analytics
          </button>
        </div>
      </div>

      {/* Simple Price Info Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-800/30 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Price:</span>
            <span className="text-white font-semibold text-lg">
              {selectedCrypto === 'BTC' ? '$67,234' : selectedCrypto === 'ETH' ? '$3,456' : '$203.97'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">24h Change:</span>
            <span className={`font-semibold ${
              (selectedCrypto === 'BTC' ? '+2.34%' : selectedCrypto === 'ETH' ? '+1.56%' : '-3.13%').startsWith('+') 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {selectedCrypto === 'BTC' ? '+2.34%' : selectedCrypto === 'ETH' ? '+1.56%' : '-3.13%'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">24h Volume:</span>
            <span className="text-white font-semibold">
              {selectedCrypto === 'BTC' ? '$45.2B' : selectedCrypto === 'ETH' ? '$12.8B' : '$904M'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Market Cap:</span>
            <span className="text-white font-semibold">
              {selectedCrypto === 'BTC' ? '$1.32T' : selectedCrypto === 'ETH' ? '$415B' : '$95.2B'}
            </span>
          </div>
        </div>
      </div>

      {/* TradingView Chart Container */}
      <div className="relative w-full h-[calc(100vh-140px)]">
        {isChartLoading && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/60 text-lg">Loading {cryptoInfo.name} chart...</p>
              <p className="text-white/40 text-sm mt-2">Powered by TradingView</p>
            </div>
          </div>
        )}
        <div 
          id="tradingview-widget"
          className="w-full h-full"
        />
      </div>

      {/* Footer info */}
      <div className="absolute bottom-4 left-4 text-white/40 text-xs">
        Powered by TradingView • Real-time data • {cryptoInfo.symbol}/USD
      </div>
    </div>
  )
}
