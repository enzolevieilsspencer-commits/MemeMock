import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { FixedTaskbar } from './components/FixedTaskbar'
import { FixedTopTaskbar } from './components/FixedTopTaskbar'
import { AuthModal } from './components/AuthModal'
import { SettingsModal } from './components/SettingsModal'
import { TabKey } from './components/Tabs'
import { ZoneImportJSON } from './components/ZoneImportJSON'
import { VueGraphiques } from './views/VueGraphiques'
import { VueAnalyse } from './views/VueAnalyse'
import { VueCalendrier } from './views/VueCalendrier'
import { VuePerpetuals } from './views/VuePerpetuals'
import { VueCryptoCharts } from './views/VueCryptoCharts'
import { VueGenericPage } from './views/VueGenericPage'
import { useAuth } from './hooks/useAuth'
import { getUserTradeData, saveOrUpdateCurrentSession, deleteUserTradeData } from './utils/authUtils'
// Import crypto logos for modals
import bitcoinLogo from './assets/logo-btc.png'
import ethereumLogo from './assets/logo-eth.png'
import solanaLogo from './assets/logo-solana.png'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isLoading, login, register, logout, updateUserProfile } = useAuth()
  const [active, setActive] = useState<TabKey | null>(null)
  const [rawJson, setRawJson] = useState<string | null>(null)
  const [showTradingViewModal, setShowTradingViewModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'SOL' | null>(null)
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(true)
  
  // S'assurer que l'URL reste sur la page principale au chargement
  useEffect(() => {
    if (location.pathname !== '/' && 
        !location.pathname.startsWith('/crypto/') && 
        location.pathname !== '/perpetuals' &&
        location.pathname !== '/charts' &&
        location.pathname !== '/analysis' &&
        location.pathname !== '/calendar') {
      navigate('/')
    }
  }, [location.pathname, navigate])

  // Charger automatiquement les données de l'utilisateur connecté
  useEffect(() => {
    if (isAuthenticated && user && !rawJson) {
      try {
        const userTrades = getUserTradeData(user.id)
        if (userTrades.length > 0) {
          // Charger la session la plus récente
          const latestSession = userTrades.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0]
          setRawJson(latestSession.data)
          console.log('Données chargées automatiquement pour:', user.email)
        }
      } catch (error) {
        console.error('Erreur lors du chargement automatique:', error)
      }
    }
  }, [isAuthenticated, user])

  // Sauvegarder automatiquement les données quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user && rawJson) {
      try {
        // Sauvegarder avec un délai pour éviter trop de sauvegardes
        const timeoutId = setTimeout(() => {
          saveOrUpdateCurrentSession(user.id, rawJson)
          console.log('Données sauvegardées automatiquement pour:', user.email)
        }, 2000) // 2 secondes de délai

        return () => clearTimeout(timeoutId)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error)
      }
    }
  }, [rawJson, isAuthenticated, user])

  // Fonctions d'authentification
  const handleAuthClick = () => {
    setShowAuthModal(true)
  }

  const handleLogin = async (credentials: any) => {
    await login(credentials)
  }

  const handleRegister = async (credentials: any) => {
    await register(credentials)
  }

  const closeAuthModal = () => {
    setShowAuthModal(false)
  }

  const handleLogout = async () => {
    await logout()
    // Effacer les données de la session actuelle
    setRawJson(null)
  }

  const handleSettings = () => {
    setShowSettingsModal(true)
  }

  const closeSettingsModal = () => {
    setShowSettingsModal(false)
  }

  const handleUpdateUser = async (updates: any) => {
    await updateUserProfile(updates)
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  const handleNewSession = () => {
    // Sauvegarder la session actuelle avant de la fermer
    if (user && rawJson) {
      try {
        saveOrUpdateCurrentSession(user.id, rawJson)
        console.log('Session actuelle sauvegardée avant nouvelle session')
      } catch (error) {
        console.error('Erreur lors de la sauvegarde avant nouvelle session:', error)
      }
    }
    setRawJson(null)
    navigate('/')
  }

  const handleCloseSession = () => {
    setRawJson(null)
  }

  const handleDeleteSession = (sessionId: string) => {
    if (user) {
      deleteUserTradeData(user.id, sessionId)
      console.log('Session supprimée:', sessionId)
    }
  }


  const handleTabChange = (newActive: TabKey) => {
    if (newActive === 'calendar') {
      // Pour l'onglet Calendar, on navigue vers une page dédiée
      navigate('/calendar')
      return
    } else if (newActive === 'perpetuals') {
      // Pour l'onglet Perpetuals, on navigue vers une page dédiée
      navigate('/perpetuals')
      return
    } else if (newActive === 'graphs') {
      // Pour l'onglet Charts, on navigue vers une page dédiée
      navigate('/charts')
      return
    } else if (newActive === 'analysis') {
      // Pour l'onglet Analysis, on navigue vers une page dédiée
      navigate('/analysis')
      return
    } else {
      setActive(newActive)
    }
  }

  const handleCryptoClick = (symbol: 'BTC' | 'ETH' | 'SOL') => {
    navigate(`/crypto/${symbol.toLowerCase()}`)
  }

  const closeTradingViewModal = () => {
    setShowTradingViewModal(false)
    setSelectedCrypto(null)
    setIsFullscreen(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }


  // Handle keyboard shortcuts for TradingView modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showTradingViewModal) {
        if (event.key === 'Escape') {
          if (isFullscreen) {
            setIsFullscreen(false)
          } else {
            closeTradingViewModal()
          }
        } else if (event.key === 'F11' || (event.key === 'f' && event.ctrlKey)) {
          event.preventDefault()
          toggleFullscreen()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showTradingViewModal, isFullscreen])

  // Load TradingView widget when modal opens
  useEffect(() => {
    if (showTradingViewModal && selectedCrypto) {
      setIsChartLoading(true)
      
      // Clear any existing widget
      const existingWidget = document.getElementById('tradingview-widget')
      if (existingWidget) {
        existingWidget.innerHTML = ''
      }

      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Load TradingView widget script
        const script = document.createElement('script')
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
        script.async = true
        script.type = 'text/javascript'
        
        const config = {
          autosize: true,
          symbol: getTradingViewSymbol(selectedCrypto),
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#1a1a1a',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: 'tradingview-widget',
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies'
          ]
        }
        
        script.innerHTML = JSON.stringify(config)
        
        const container = document.getElementById('tradingview-widget')
        if (container) {
          container.appendChild(script)
          
          // Hide loading after a delay
          setTimeout(() => {
            setIsChartLoading(false)
          }, 2000)
        }
      }, 100)

      return () => clearTimeout(timer)
    } else {
      setIsChartLoading(false)
    }
  }, [showTradingViewModal, selectedCrypto])

  const getTradingViewSymbol = (symbol: string) => {
    switch (symbol) {
      case 'BTC': return 'BINANCE:BTCUSDT'
      case 'ETH': return 'BINANCE:ETHUSDT'
      case 'SOL': return 'BINANCE:SOLUSDT'
      default: return 'BINANCE:BTCUSDT'
    }
  }

  const getCryptoInfo = (symbol: string) => {
    switch (symbol) {
      case 'BTC':
        return {
          name: 'Bitcoin',
          logo: bitcoinLogo,
          color: '#F7931A',
          bgColor: '#f7931a'
        }
      case 'ETH':
        return {
          name: 'Ethereum',
          logo: ethereumLogo,
          color: '#627EEA',
          bgColor: '#627eea'
        }
      case 'SOL':
        return {
          name: 'Solana',
          logo: solanaLogo,
          color: '#9945FF',
          bgColor: '#000000'
        }
      default:
        return {
          name: 'Bitcoin',
          logo: bitcoinLogo,
          color: '#F7931A',
          bgColor: '#f7931a'
        }
    }
  }

  // Si on est sur une page crypto, afficher la page crypto
  if (location.pathname.startsWith('/crypto/')) {
    const crypto = location.pathname.split('/')[2]?.toUpperCase() as 'BTC' | 'ETH' | 'SOL'
    if (crypto && ['BTC', 'ETH', 'SOL'].includes(crypto)) {
      return <VueCryptoCharts selectedCrypto={crypto} />
    }
  }

  // Si on est sur la page Perpetuals, afficher la page Perpetuals
  if (location.pathname === '/perpetuals') {
    return (
      <VuePerpetuals 
        onTabChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
    )
  }

  // Si on est sur la page Charts, afficher la page Charts
  if (location.pathname === '/charts') {
    return (
      <div className="min-h-screen relative text-white overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <FixedTopTaskbar 
          active="graphs" 
          onChange={handleTabChange}
          onAccountClick={handleAuthClick}
          onLogout={handleLogout}
          onSettings={handleSettings}
          onLogoClick={handleLogoClick}
          onLoadSession={setRawJson}
          onNewSession={handleNewSession}
          onCloseSession={handleCloseSession}
          onDeleteSession={handleDeleteSession}
          isAuthenticated={!!isAuthenticated}
          userEmail={user?.email}
          userPseudo={user?.pseudo}
          userAvatar={user?.avatar}
          userId={user?.id}
        />
        <main className="relative mx-auto max-w-6xl px-4 py-4 pb-10 mt-12">
          {!rawJson ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Data Available</h3>
                <p className="text-white/70 mb-6">You must first import data to view charts</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#06B6D4] text-white font-semibold hover:from-[#7A37CC] hover:to-[#048B9A] transition-colors"
                >
                  Go to Data Import
                </button>
              </div>
            </div>
          ) : (
            <VueGraphiques jsonData={rawJson} />
          )}
        </main>
        <FixedTaskbar onCryptoClick={handleCryptoClick} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
        />
        {user && (
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={closeSettingsModal}
            user={user}
            onUpdateUser={handleUpdateUser}
            isLoading={isLoading}
          />
        )}
      </div>
    )
  }

  // Si on est sur la page Analysis, afficher la page Analysis
  if (location.pathname === '/analysis') {
    return (
      <div className="min-h-screen relative text-white overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <FixedTopTaskbar 
          active="analysis" 
          onChange={handleTabChange}
          onAccountClick={handleAuthClick}
          onLogout={handleLogout}
          onSettings={handleSettings}
          onLogoClick={handleLogoClick}
          onLoadSession={setRawJson}
          onNewSession={handleNewSession}
          onCloseSession={handleCloseSession}
          onDeleteSession={handleDeleteSession}
          isAuthenticated={!!isAuthenticated}
          userEmail={user?.email}
          userPseudo={user?.pseudo}
          userAvatar={user?.avatar}
          userId={user?.id}
        />
        <main className="relative mx-auto max-w-6xl px-4 py-4 pb-10 mt-12">
          {!rawJson ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-6">📈</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Data Available</h3>
                <p className="text-white/70 mb-6">You must first import data to view analysis</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#06B6D4] text-white font-semibold hover:from-[#7A37CC] hover:to-[#048B9A] transition-colors"
                >
                  Go to Data Import
                </button>
              </div>
            </div>
          ) : (
            <VueAnalyse jsonData={rawJson} />
          )}
        </main>
        <FixedTaskbar onCryptoClick={handleCryptoClick} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
        />
        {user && (
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={closeSettingsModal}
            user={user}
            onUpdateUser={handleUpdateUser}
            isLoading={isLoading}
          />
        )}
      </div>
    )
  }

  // Si on est sur la page Calendar, afficher la page Calendar
  if (location.pathname === '/calendar') {
    return (
      <div className="min-h-screen relative text-white overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <FixedTopTaskbar 
          active="calendar" 
          onChange={handleTabChange}
          onAccountClick={handleAuthClick}
          onLogout={handleLogout}
          onSettings={handleSettings}
          onLogoClick={handleLogoClick}
          onLoadSession={setRawJson}
          onNewSession={handleNewSession}
          onCloseSession={handleCloseSession}
          onDeleteSession={handleDeleteSession}
          isAuthenticated={!!isAuthenticated}
          userEmail={user?.email}
          userPseudo={user?.pseudo}
          userAvatar={user?.avatar}
          userId={user?.id}
        />
        <main className="relative mx-auto max-w-6xl px-4 py-4 pb-10 mt-12">
          {!rawJson ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-6">📅</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Data Available</h3>
                <p className="text-white/70 mb-6">You must first import data to view calendar</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#06B6D4] text-white font-semibold hover:from-[#7A37CC] hover:to-[#048B9A] transition-colors"
                >
                  Go to Data Import
                </button>
              </div>
            </div>
          ) : (
            <VueCalendrier jsonData={rawJson} isModal={false} />
          )}
        </main>
        <FixedTaskbar onCryptoClick={handleCryptoClick} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
        />
        {user && (
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={closeSettingsModal}
            user={user}
            onUpdateUser={handleUpdateUser}
            isLoading={isLoading}
          />
        )}
      </div>
    )
  }

  // Pages génériques pour les autres onglets
  if (location.pathname === '/discover') {
    return (
      <VueGenericPage 
        title="Discover" 
        description="Discover new tokens and trading opportunities" 
        icon="🔍"
        onTabChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
    )
  }
  if (location.pathname === '/pulse') {
    return (
      <VueGenericPage 
        title="Pulse" 
        description="Market pulse and trending assets" 
        icon="📊"
        onTabChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
    )
  }
  if (location.pathname === '/trackers') {
    return (
      <VueGenericPage 
        title="Trackers" 
        description="Track your favorite tokens and portfolios" 
        icon="📈"
        onTabChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
    )
  }
  if (location.pathname === '/yield') {
    return (
      <VueGenericPage 
        title="Yield" 
        description="Yield farming and staking opportunities" 
        icon="🌾"
        onTabChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
    )
  }
  if (location.pathname === '/vision') {
    return (
      <VueGenericPage 
        title="Vision" 
        description="AI-powered market insights and predictions" 
        icon="🔮"
        onTabChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
    )
  }
  if (location.pathname === '/portfolio') {
    return (
      <VueGenericPage 
        title="Portfolio" 
        description="Manage your crypto portfolio and track performance" 
        icon="💼"
        onTabChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
    )
  }
  if (location.pathname === '/rewards') {
    return (
      <VueGenericPage 
        title="Rewards" 
        description="Earn rewards and participate in programs" 
        icon="🎁"
        onTabChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
    )
  }

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Fixed Top Taskbar */}
      <FixedTopTaskbar 
        active={active} 
        onChange={handleTabChange}
        onAccountClick={handleAuthClick}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onLogoClick={handleLogoClick}
        onLoadSession={setRawJson}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
        isAuthenticated={!!isAuthenticated}
        userEmail={user?.email}
        userPseudo={user?.pseudo}
        userAvatar={user?.avatar}
        userId={user?.id}
      />
      
      <Header 
      />
      <main className="relative mx-auto max-w-6xl px-4 py-4 pb-10 mt-12">
        <AnimatePresence mode="wait">
          {!rawJson && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
                    <ZoneImportJSON 
                      onValidJSON={setRawJson} 
                      onAnalyze={() => {
                        navigate('/analysis')
                      }}
                      isDataLoaded={Boolean(isAuthenticated && user && rawJson !== null)}
                    />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Les onglets Charts et Analysis sont maintenant sur des pages dédiées */}
        
        {/* Le modal Calendar a été remplacé par une page dédiée */}

        {/* TradingView Modal */}
        <AnimatePresence>
          {showTradingViewModal && selectedCrypto && (
            <motion.div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeTradingViewModal}
            >
              <motion.div 
                className={`bg-gray-900/95 backdrop-blur-md border border-white/20 overflow-hidden shadow-2xl flex flex-col ${
                  isFullscreen 
                    ? 'fixed inset-0 w-full h-full rounded-none' 
                    : 'rounded-2xl sm:rounded-3xl w-full max-w-7xl h-[90vh] sm:h-[85vh]'
                }`}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - Hidden in fullscreen mode */}
                {!isFullscreen && (
                  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center"
                        style={{ 
                          backgroundColor: getCryptoInfo(selectedCrypto).bgColor
                        }}
                      >
                        <img 
                          src={getCryptoInfo(selectedCrypto).logo} 
                          alt={getCryptoInfo(selectedCrypto).name}
                          className="w-full h-full object-contain p-1"
                          style={{
                            filter: selectedCrypto === 'SOL' ? 'contrast(1.2) saturate(1.1) brightness(1.3)' : 'none'
                          }}
                          onError={(e) => {
                            // Fallback to text icon if image fails
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = selectedCrypto === 'BTC' ? '₿' : selectedCrypto === 'ETH' ? 'Ξ' : '◎'
                              parent.className = 'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold'
                              parent.style.color = getCryptoInfo(selectedCrypto).color
                            }
                          }}
                        />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                          {getCryptoInfo(selectedCrypto).name}
                        </h2>
                        <p className="text-white/60 text-xs sm:text-sm">Live Chart - {selectedCrypto}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleFullscreen}
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/20"
                        title="Enter fullscreen"
                      >
                        <span className="text-sm font-medium">Fullscreen</span>
                      </button>
                <button
                        onClick={closeTradingViewModal}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Fullscreen controls - Only visible in fullscreen mode */}
                {isFullscreen && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="px-4 py-2 rounded-lg bg-black/70 hover:bg-black/90 transition-colors text-white backdrop-blur-sm border border-white/20"
                      title="Exit fullscreen"
                    >
                      <span className="text-sm font-medium">Exit Fullscreen</span>
                    </button>
                    <button
                      onClick={closeTradingViewModal}
                      className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors text-white backdrop-blur-sm"
                      title="Close"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                </button>
              </div>
                )}
                
                {/* TradingView Chart */}
                <div className={`flex-1 flex flex-col min-h-0 ${isFullscreen ? 'p-0' : 'p-4 sm:p-6'}`}>
                  <div className="relative flex-1 min-h-0">
                    <div className={`w-full h-full overflow-hidden bg-gray-800 relative ${isFullscreen ? 'rounded-none' : 'rounded-lg sm:rounded-xl'}`}>
                      {isChartLoading && (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-800">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p className="text-white/60">Loading {selectedCrypto} chart...</p>
                            <p className="text-white/40 text-sm mt-2">Powered by TradingView</p>
                          </div>
                        </div>
                      )}
                      <div 
                        id="tradingview-widget"
                        className="w-full h-full"
                />
              </div>
                  </div>
                </div>

                {/* Footer - Hidden in fullscreen mode */}
                {!isFullscreen && (
                  <div className="p-4 sm:p-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                      <div className="text-white/60 text-xs sm:text-sm">
                        Powered by TradingView • Real-time data
                        <span className="ml-2 text-white/40">
                          • Press F11 or Ctrl+F for fullscreen
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=BINANCE:${selectedCrypto}USDT`, '_blank')}
                          className="px-3 py-2 sm:px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-xs sm:text-sm"
                        >
                          Open in TradingView
                        </button>
                        <button
                          onClick={closeTradingViewModal}
                          className="px-3 py-2 sm:px-4 rounded-lg bg-gradient-to-r from-[#14F195] to-[#06B6D4] text-black font-semibold hover:from-[#12D885] hover:to-[#0891B2] transition-colors text-xs sm:text-sm"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed taskbar */}
      <FixedTaskbar onCryptoClick={handleCryptoClick} />

            {/* Auth Modal */}
            <AuthModal
              isOpen={showAuthModal}
              onClose={closeAuthModal}
              onLogin={handleLogin}
              onRegister={handleRegister}
              isLoading={isLoading}
            />

            {/* Settings Modal */}
            {user && (
              <SettingsModal
                isOpen={showSettingsModal}
                onClose={closeSettingsModal}
                user={user}
                onUpdateUser={handleUpdateUser}
                isLoading={isLoading}
              />
            )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App