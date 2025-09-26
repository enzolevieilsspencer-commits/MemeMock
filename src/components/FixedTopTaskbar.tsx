import { motion } from 'framer-motion'
import { TabKey } from './Tabs'
import { UserMenu } from './UserMenu'
import mainLogo from '../assets/logo.png'

interface FixedTopTaskbarProps {
  active: TabKey | null
  onChange: (key: TabKey) => void
  onAccountClick: () => void
  onLogout: () => void
  onSettings: () => void
  onLogoClick: () => void
  onLoadSession?: (data: string) => void
  onNewSession?: () => void
  onCloseSession?: () => void
  onDeleteSession?: (sessionId: string) => void
  isAuthenticated: boolean
  userEmail?: string
  userPseudo?: string
  userAvatar?: string
  userId?: string
}

export function FixedTopTaskbar({ 
  active, 
  onChange,
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
}: FixedTopTaskbarProps) {
  const tabs = [
    { key: 'graphs' as TabKey, label: 'Charts' },
    { key: 'analysis' as TabKey, label: 'Analysis' },
    { key: 'calendar' as TabKey, label: 'Calendar' },
    { key: 'perpetuals' as TabKey, label: 'Perpetuals' }
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center px-6 py-1">
        {/* Main Logo - Far Left */}
        <motion.button
          onClick={onLogoClick}
          className="flex items-center gap-3 mr-6 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="Retour à l'accueil"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src={mainLogo} 
              alt="MemeMock Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<span class="text-white font-bold text-lg">M</span>'
                }
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg leading-none">MemeMock</span>
            <span className="text-white/70 font-medium text-xs leading-none">Pro</span>
          </div>
        </motion.button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-300 ${
                active === tab.key
                  ? 'bg-gradient-to-r from-[#9945FF]/20 to-[#06B6D4]/20 text-white border border-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm">{tab.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Spacer to push account to the right */}
        <div className="flex-1"></div>

        {/* Account Logo - Right Side */}
        {isAuthenticated ? (
          <UserMenu 
            userEmail={userEmail || ''}
            userPseudo={userPseudo}
            userAvatar={userAvatar}
            userId={userId || ''}
            onLogout={onLogout}
            onSettings={onSettings}
            onLoadSession={onLoadSession}
            onNewSession={onNewSession}
            onCloseSession={onCloseSession}
            onDeleteSession={onDeleteSession}
          />
        ) : (
          <motion.button
            onClick={onAccountClick}
            className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Se connecter"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9945FF] to-[#06B6D4] p-[2px]">
              <div className="w-full h-full rounded-full bg-black"></div>
            </div>
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="relative z-10"
            >
              {/* Person icon */}
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
              {/* Settings gear overlay */}
              <circle cx="18" cy="6" r="2" fill="white" stroke="white" strokeWidth="1"></circle>
              <path d="M17 5.5l1 1M19 5.5l-1 1M17 6.5l1-1M19 6.5l-1-1" stroke="gray" strokeWidth="0.5"></path>
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  )
}



