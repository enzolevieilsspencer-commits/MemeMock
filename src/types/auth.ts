export interface User {
  id: string
  email: string
  password: string // Hashé avec bcrypt
  pseudo?: string
  avatar?: string
  createdAt: Date
  lastLogin?: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  pseudo?: string
}

export interface UserTradeData {
  id: string
  userId: string
  data: string // JSON string des données de trading
  name: string // Nom de la session
  createdAt: Date
  updatedAt: Date
}
