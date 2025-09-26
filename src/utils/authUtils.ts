import { User, LoginCredentials, RegisterCredentials, UserTradeData } from '../types/auth'

// Clés pour le localStorage
const USERS_KEY = 'mememock_users_data'
const CURRENT_USER_KEY = 'mememock_current_user'
const USER_TRADES_KEY = 'mememock_user_trades'

// Fonction simple de hachage (pour la démo - en production utiliser bcrypt)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertit en 32bit integer
  }
  return hash.toString()
}

// Fonction pour générer un ID unique
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Fonction pour récupérer tous les utilisateurs
export function getAllUsers(): User[] {
  try {
    const usersData = localStorage.getItem(USERS_KEY)
    return usersData ? JSON.parse(usersData) : []
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return []
  }
}

// Fonction pour sauvegarder tous les utilisateurs
export function saveAllUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    console.log('Utilisateurs sauvegardés avec succès')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des utilisateurs:', error)
  }
}

// Fonction pour créer un nouvel utilisateur
export function createUser(credentials: RegisterCredentials): User | null {
  const { email, password, pseudo } = credentials
  
  // Validation
  if (!email || !password) {
    throw new Error('Email et mot de passe requis')
  }
  
  if (password.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères')
  }
  
  if (credentials.password !== credentials.confirmPassword) {
    throw new Error('Les mots de passe ne correspondent pas')
  }
  
  // Vérifier si l'utilisateur existe déjà
  const existingUsers = getAllUsers()
  const existingUser = existingUsers.find(user => user.email.toLowerCase() === email.toLowerCase())
  
  if (existingUser) {
    throw new Error('Un compte avec cet email existe déjà')
  }
  
  // Créer le nouvel utilisateur
  const newUser: User = {
    id: generateId(),
    email: email.toLowerCase(),
    password: simpleHash(password),
    pseudo: pseudo || email.split('@')[0],
    createdAt: new Date(),
    lastLogin: new Date()
  }
  
  // Sauvegarder
  existingUsers.push(newUser)
  saveAllUsers(existingUsers)
  
  console.log('Nouvel utilisateur créé:', newUser.email)
  return newUser
}

// Fonction pour authentifier un utilisateur
export function authenticateUser(credentials: LoginCredentials): User | null {
  const { email, password } = credentials
  
  if (!email || !password) {
    throw new Error('Email et mot de passe requis')
  }
  
  const users = getAllUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  
  if (!user) {
    throw new Error('Aucun compte trouvé avec cet email')
  }
  
  if (user.password !== simpleHash(password)) {
    throw new Error('Mot de passe incorrect')
  }
  
  // Mettre à jour la dernière connexion
  user.lastLogin = new Date()
  const updatedUsers = users.map(u => u.id === user.id ? user : u)
  saveAllUsers(updatedUsers)
  
  console.log('Utilisateur authentifié:', user.email)
  return user
}

// Fonction pour sauvegarder l'utilisateur actuel
export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'utilisateur actuel:', error)
  }
}

// Fonction pour récupérer l'utilisateur actuel
export function getCurrentUser(): User | null {
  try {
    const userData = localStorage.getItem(CURRENT_USER_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error)
    return null
  }
}

// Fonction pour déconnecter l'utilisateur
export function logoutUser(): void {
  saveCurrentUser(null)
  console.log('Utilisateur déconnecté')
}

// Fonction pour mettre à jour le profil utilisateur
export function updateUserProfile(userId: string, updates: Partial<User>): User {
  const users = getAllUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé')
  }

  // Mettre à jour les données utilisateur
  users[userIndex] = { ...users[userIndex], ...updates }
  saveAllUsers(users)
  
  // Mettre à jour l'utilisateur actuel si c'est le même
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === userId) {
    saveCurrentUser(users[userIndex])
  }
  
  console.log('Profil utilisateur mis à jour:', users[userIndex].email)
  return users[userIndex]
}

// Fonction pour sauvegarder les données de trading d'un utilisateur
export function saveUserTradeData(userId: string, data: string, name: string): UserTradeData {
  const tradeData: UserTradeData = {
    id: generateId(),
    userId,
    data,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  try {
    const existingTrades = getUserTradeData(userId)
    const updatedTrades = [...existingTrades, tradeData]
    localStorage.setItem(`${USER_TRADES_KEY}_${userId}`, JSON.stringify(updatedTrades))
    console.log('Données de trading sauvegardées:', name)
    return tradeData
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données de trading:', error)
    throw error
  }
}

// Fonction pour sauvegarder ou mettre à jour la session actuelle
export function saveOrUpdateCurrentSession(userId: string, data: string): UserTradeData {
  try {
    const existingTrades = getUserTradeData(userId)
    
    // Chercher une session récente (moins de 7 jours pour plus de flexibilité)
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const recentSession = existingTrades.find(trade => 
      new Date(trade.updatedAt) > oneWeekAgo
    )
    
    if (recentSession) {
      // Mettre à jour la session existante
      const updatedSession = {
        ...recentSession,
        data,
        updatedAt: new Date()
      }
      
      const updatedTrades = existingTrades.map(trade => 
        trade.id === recentSession.id ? updatedSession : trade
      )
      
      localStorage.setItem(`${USER_TRADES_KEY}_${userId}`, JSON.stringify(updatedTrades))
      console.log('Session mise à jour pour:', userId)
      return updatedSession
    } else {
      // Créer une nouvelle session
      return saveUserTradeData(userId, data, `Session ${new Date().toLocaleDateString()}`)
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde/mise à jour de la session:', error)
    throw error
  }
}

// Fonction pour sauvegarder la session actuelle avec un nom personnalisé
export function saveCurrentSession(userId: string, data: string, sessionName?: string): UserTradeData {
  try {
    const name = sessionName || `Session ${new Date().toLocaleDateString()}`
    return saveUserTradeData(userId, data, name)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la session actuelle:', error)
    throw error
  }
}

// Fonction pour récupérer les données de trading d'un utilisateur
export function getUserTradeData(userId: string): UserTradeData[] {
  try {
    const tradesData = localStorage.getItem(`${USER_TRADES_KEY}_${userId}`)
    return tradesData ? JSON.parse(tradesData) : []
  } catch (error) {
    console.error('Erreur lors de la récupération des données de trading:', error)
    return []
  }
}

// Fonction pour supprimer une session de trading
export function deleteUserTradeData(userId: string, tradeId: string): void {
  try {
    const existingTrades = getUserTradeData(userId)
    const updatedTrades = existingTrades.filter(trade => trade.id !== tradeId)
    localStorage.setItem(`${USER_TRADES_KEY}_${userId}`, JSON.stringify(updatedTrades))
    console.log('Session de trading supprimée:', tradeId)
  } catch (error) {
    console.error('Erreur lors de la suppression des données de trading:', error)
  }
}

// Fonction pour mettre à jour les données de trading
export function updateUserTradeData(userId: string, tradeId: string, data: string, name: string): void {
  try {
    const existingTrades = getUserTradeData(userId)
    const updatedTrades = existingTrades.map(trade => 
      trade.id === tradeId 
        ? { ...trade, data, name, updatedAt: new Date() }
        : trade
    )
    localStorage.setItem(`${USER_TRADES_KEY}_${userId}`, JSON.stringify(updatedTrades))
    console.log('Données de trading mises à jour:', name)
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données de trading:', error)
  }
}
