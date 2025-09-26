import { useState, useEffect } from 'react'
import { User, LoginCredentials, RegisterCredentials, AuthState } from '../types/auth'
import { 
  getCurrentUser, 
  saveCurrentUser, 
  authenticateUser, 
  createUser, 
  logoutUser as logoutUserUtil,
  updateUserProfile as updateUserProfileUtil
} from '../utils/authUtils'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = getCurrentUser()
        if (currentUser) {
          setAuthState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false
          })
          console.log('Utilisateur chargé:', currentUser.email)
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
      }
    }

    loadUser()
  }, [])

  // Fonction de connexion
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const user = authenticateUser(credentials)
      if (user) {
        saveCurrentUser(user)
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        })
        console.log('Connexion réussie:', user.email)
      } else {
        throw new Error('Échec de l\'authentification')
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  // Fonction d'inscription
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user = createUser(credentials)
      if (user) {
        saveCurrentUser(user)
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        })
        console.log('Inscription réussie:', user.email)
      } else {
        throw new Error('Échec de la création du compte')
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500))
      
      logoutUserUtil()
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
      console.log('Déconnexion réussie')
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!authState.user) {
      throw new Error('Aucun utilisateur connecté')
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const updatedUser = updateUserProfileUtil(authState.user.id, updates)
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false
      }))
      console.log('Profil utilisateur mis à jour:', updatedUser.email)
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  }

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
    updateUserProfile
  }
}
