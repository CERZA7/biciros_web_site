/**
 * Navbar - Barra de navegacion
 * Muestra diferentes opciones segun el estado de autenticacion
 */

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Biciros
        </Link>
      </div>

      <div className="navbar-menu">
        {/* Links publicos - siempre visibles */}
        <Link to="/" className="navbar-link">
          Inicio
        </Link>
        <Link to="/blog" className="navbar-link">
          Blog
        </Link>

        {/* Link Mis Productos - usuarios autenticados */}
        {isAuthenticated && (
          <Link to="/my-products" className="navbar-link">
            Mis Productos
          </Link>
        )}

        {/* Link Admin - solo para administradores */}
        {isAdmin && (
          <Link to="/admin" className="navbar-link navbar-link-admin">
            Admin
          </Link>
        )}

        {/* Seccion de usuario */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                Hola, {user.name}
              </span>
              <button onClick={handleLogout} className="navbar-btn navbar-btn-logout">
                Cerrar sesion
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-btn navbar-btn-login">
              Iniciar sesion
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
