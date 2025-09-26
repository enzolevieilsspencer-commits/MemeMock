import { useNavigate } from 'react-router-dom'
import { FixedTopTaskbar } from '../components/FixedTopTaskbar'
import { FixedTaskbar } from '../components/FixedTaskbar'
import { TabKey } from '../components/Tabs'

interface VueGenericPageProps {
  title: string
  description: string
  icon: string
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

export function VueGenericPage({ 
  title, 
  description, 
  icon,
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
}: VueGenericPageProps) {
  const navigate = useNavigate()

  const handleCryptoClick = (symbol: 'BTC' | 'ETH' | 'SOL') => {
    navigate(`/crypto/${symbol.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Fixed Top Taskbar */}
      <FixedTopTaskbar 
        active={null}
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

      {/* Main Content */}
      <main className="relative mx-auto max-w-6xl px-4 py-4 pb-10 mt-12">
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-[#9945FF] to-[#06B6D4] flex items-center justify-center">
            <span className="text-4xl">{icon}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-white/60 text-lg mb-8">{description}</p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/perpetuals')}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#06B6D4] text-white font-semibold rounded-lg hover:from-[#7A37CC] hover:to-[#048B9A] transition-colors"
            >
              Go to Perpetuals Trading
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
            >
              Back to Analytics
            </button>
          </div>
        </div>
        </div>
      </main>

      {/* Fixed taskbar */}
      <FixedTaskbar onCryptoClick={handleCryptoClick} />
    </div>
  )
}
