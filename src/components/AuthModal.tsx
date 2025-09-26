import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginCredentials, RegisterCredentials } from '../types/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: LoginCredentials) => Promise<void>
  onRegister: (credentials: RegisterCredentials) => Promise<void>
  isLoading: boolean
}

export function AuthModal({ isOpen, onClose, onLogin, onRegister, isLoading }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    pseudo: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLoginMode) {
        await onLogin({
          email: formData.email,
          password: formData.password
        })
      } else {
        await onRegister({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          pseudo: formData.pseudo
        })
      }
      
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setError('')
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      pseudo: ''
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-gray-900 border border-white/20 rounded-2xl p-8 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLoginMode ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p className="text-white/70 text-sm">
              {isLoginMode 
                ? 'Connectez-vous à votre compte MemeMock' 
                : 'Créez votre compte MemeMock pour sauvegarder vos données'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent transition-colors"
                placeholder="votre@email.com"
              />
            </div>

            {/* Pseudo (only for registration) */}
            {!isLoginMode && (
              <div>
                <label htmlFor="pseudo" className="block text-sm font-medium text-white/80 mb-2">
                  Pseudo (optionnel)
                </label>
                <input
                  type="text"
                  id="pseudo"
                  name="pseudo"
                  value={formData.pseudo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent transition-colors"
                  placeholder="Votre pseudo"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Confirm Password (only for registration) */}
            {!isLoginMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#9945FF] to-[#06B6D4] text-white font-semibold rounded-lg hover:from-[#7A37CC] hover:to-[#048B9A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLoginMode ? 'Connexion...' : 'Création...'}
                </div>
              ) : (
                isLoginMode ? 'Se connecter' : 'Créer le compte'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 text-[#9945FF] hover:text-[#7A37CC] font-medium transition-colors"
              >
                {isLoginMode ? 'Créer un compte' : 'Se connecter'}
              </button>
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
