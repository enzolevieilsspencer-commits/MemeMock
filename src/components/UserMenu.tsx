import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserTradeData } from '../utils/authUtils'

interface UserMenuProps {
  userEmail: string
  userPseudo?: string
  userAvatar?: string
  userId: string
  onLogout: () => void
  onSettings: () => void
  onLoadSession?: (data: string) => void
  onNewSession?: () => void
  onCloseSession?: () => void
  onDeleteSession?: (sessionId: string) => void
}

export function UserMenu({ userEmail, userPseudo, userAvatar, userId, onLogout, onSettings, onLoadSession, onNewSession, onCloseSession, onDeleteSession }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [showSessions, setShowSessions] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu quand on clique à l'extérieur
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  // Charger les sessions de l'utilisateur
  useEffect(() => {
    if (userId) {
      const userSessions = getUserTradeData(userId)
      setSessions(userSessions.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ))
    }
  }, [userId])

  // Recharger les sessions quand le menu s'ouvre
  useEffect(() => {
    if (isOpen && userId) {
      const userSessions = getUserTradeData(userId)
      setSessions(userSessions.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ))
    }
  }, [isOpen, userId])

  // Attacher/détacher l'event listener
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    onLogout()
    setIsOpen(false)
  }

  const handleSettings = () => {
    onSettings()
    setIsOpen(false)
  }

  const handleLoadSession = (sessionData: string) => {
    if (onLoadSession) {
      onLoadSession(sessionData)
    }
    setIsOpen(false)
  }

  const handleNewSession = () => {
    if (onNewSession) {
      onNewSession()
    }
    // Recharger la liste des sessions après création d'une nouvelle session
    setTimeout(() => {
      const updatedSessions = getUserTradeData(userId)
      setSessions(updatedSessions.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ))
    }, 100) // Petit délai pour s'assurer que la sauvegarde est terminée
    setIsOpen(false)
  }

  const handleCloseSession = () => {
    if (onCloseSession) {
      onCloseSession()
    }
    setIsOpen(false)
  }

  const handleDeleteSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Empêcher le chargement de la session
    if (onDeleteSession) {
      onDeleteSession(sessionId)
      // Recharger la liste des sessions
      const updatedSessions = getUserTradeData(userId)
      setSessions(updatedSessions.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ))
    }
  }


  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Account Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Connecté: ${userPseudo || userEmail}`}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9945FF] to-[#06B6D4] p-[2px]">
          <div className="w-full h-full rounded-full bg-black"></div>
        </div>
        {userAvatar ? (
          <img 
            src={userAvatar} 
            alt="Avatar" 
            className="relative z-10 w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="relative z-10 text-white font-bold text-sm">
            {userEmail.charAt(0).toUpperCase()}
          </span>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-white/20 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-white font-medium text-sm">{userPseudo || userEmail}</p>
              <p className="text-white/60 text-xs">Connecté</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Sessions Section */}
              {sessions.length > 0 && (
                <>
                  <button
                    onClick={() => setShowSessions(!showSessions)}
                    className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 transition-colors text-sm flex items-center gap-3 justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Sessions ({sessions.length})
                    </div>
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className={`transition-transform ${showSessions ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                  
                  {showSessions && (
                    <div className="max-h-48 overflow-y-auto border-t border-white/10">
                      {sessions.slice(0, 5).map((session) => (
                        <div
                          key={session.id}
                          className="w-full px-6 py-2 text-left text-white/70 hover:bg-white/5 transition-colors text-xs flex items-center justify-between group"
                        >
                          <button
                            onClick={() => handleLoadSession(session.data)}
                            className="flex flex-col flex-1"
                          >
                            <span className="font-medium truncate">{session.name}</span>
                            <span className="text-white/50">{formatDate(session.updatedAt)}</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete session"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6"></polyline>
                              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                      {sessions.length > 5 && (
                        <div className="px-6 py-2 text-white/50 text-xs">
                          +{sessions.length - 5} more sessions
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Sessions Management Section */}
              <div className="border-t border-white/10 pt-2">
                <div className="px-4 py-2 text-white/60 text-xs font-medium uppercase tracking-wide">
                  Session Management
                </div>
                
                {/* New Session Button */}
                <button
                  onClick={handleNewSession}
                  className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 transition-colors text-sm flex items-center gap-3"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  New Session
                </button>


                {/* Close Session Button */}
                <button
                  onClick={handleCloseSession}
                  className="w-full px-4 py-2 text-left text-orange-400 hover:bg-white/10 transition-colors text-sm flex items-center gap-3"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Close Session
                </button>
              </div>

              <button
                onClick={handleSettings}
                className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 transition-colors text-sm flex items-center gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                </svg>
                Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 transition-colors text-sm flex items-center gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
