/**
 * Login - Pagina de inicio de sesion
 * Solo login, NO hay registro publico
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones basicas
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      setLoading(true)
      const result = await login(email, password)

      if (result.success) {
        // Redirigir segun el rol
        if (result.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } else {
        setError(result.error || 'Error al iniciar sesion')
      }
    } catch (err) {
      setError('Error de conexion. Intenta de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="login-container">
        <div className="login-card">
          <header className="login-header">
            <h1>Iniciar Sesion</h1>
            <p>Ingresa a tu cuenta de Biciros</p>
          </header>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
            </button>
          </form>

          <footer className="login-footer">
            <p className="login-hint">
              No hay registro publico. Contacta al administrador para obtener una cuenta.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Login
