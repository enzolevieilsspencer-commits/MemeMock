import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '../types/auth'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onUpdateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

export function SettingsModal({ isOpen, onClose, user, onUpdateUser, isLoading }: SettingsModalProps) {
  const [pseudo, setPseudo] = useState(user.pseudo || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (pseudo.length < 2) {
      setError('Le pseudo doit contenir au moins 2 caractères.')
      return
    }

    if (pseudo.length > 20) {
      setError('Le pseudo ne peut pas dépasser 20 caractères.')
      return
    }

    try {
      await onUpdateUser({ pseudo, avatar })
      setSuccess('Paramètres mis à jour avec succès !')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide.')
      return
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('L\'image ne peut pas dépasser 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setAvatar(result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatar('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6 sm:p-8 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Paramètres
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 text-red-300 border border-red-500 rounded-lg p-3 mb-4 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 text-green-300 border border-green-500 rounded-lg p-3 mb-4 text-sm text-center"
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="text-center">
                <label className="block text-white/70 text-sm font-medium mb-3">
                  Avatar
                </label>
                
                <div className="flex flex-col items-center gap-4">
                  {/* Avatar Display */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#9945FF] to-[#06B6D4] p-[2px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        {avatar ? (
                          <img 
                            src={avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-white font-bold text-2xl">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                        title="Supprimer l'avatar"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
                    >
                      Choisir une image
                    </button>
                  </div>
                </div>
              </div>

              {/* Pseudo Section */}
              <div>
                <label htmlFor="pseudo" className="block text-white/70 text-sm font-medium mb-2">
                  Pseudo
                </label>
                <input
                  type="text"
                  id="pseudo"
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent transition-colors"
                  placeholder="Votre pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  maxLength={20}
                />
                <p className="text-white/40 text-xs mt-1">
                  {pseudo.length}/20 caractères
                </p>
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                  value={user.email}
                  disabled
                />
                <p className="text-white/40 text-xs mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#06B6D4] text-white font-semibold text-lg hover:from-[#7A37CC] hover:to-[#048B9A] transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Sauvegarder
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
