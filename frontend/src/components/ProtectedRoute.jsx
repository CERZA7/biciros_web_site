/**
 * ProtectedRoute - Componente para proteger rutas
 * Redirige a login si no esta autenticado
 * Redirige a home si no tiene permisos de admin (cuando se requiere)
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  // Mostrar loading mientras se verifica la autenticacion
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  // Si no esta autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si requiere admin y no es admin, redirigir a home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return children
}

export default ProtectedRoute
