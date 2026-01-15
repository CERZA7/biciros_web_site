/**
 * AuthContext - Contexto de autenticacion global
 * Maneja login, logout y persistencia en localStorage
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  // Funcion de login
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)

      if (response.error) {
        throw new Error(response.message)
      }

      // Guardar en estado
      setToken(response.token)
      setUser(response.user)

      // Persistir en localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return { success: true, user: response.user }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al iniciar sesion'
      return { success: false, error: message }
    }
  }

  // Funcion de logout
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Verificar si esta autenticado
  const isAuthenticated = !!token && !!user

  // Verificar si es admin
  const isAdmin = user?.role === 'admin'

  // Valor del contexto
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export default AuthContext
