/**
 * AuthContext - Contexto de autenticacion
 * Placeholder - Se completara en siguiente rama
 */

import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Se implementara completamente en siguiente rama
  const value = {
    user: null,
    token: null,
    login: async () => {},
    logout: () => {},
    isAuthenticated: false,
    isAdmin: false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export default AuthContext
