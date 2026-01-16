/**
 * UserManagement - Panel de administracion de usuarios
 * Solo accesible para administradores
 * Permite cambiar roles y eliminar usuarios
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getAll()
      setUsers(response.users || [])
      setError(null)
    } catch (err) {
      setError('Error al cargar los usuarios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, userName, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'dar permisos de administrador a' : 'quitar permisos de administrador a'

    if (!window.confirm(`¿Deseas ${action} "${userName}"?`)) {
      return
    }

    try {
      await usersAPI.updateRole(userId, newRole)
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ))
    } catch (err) {
      alert('Error al cambiar el rol')
      console.error(err)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (userId === currentUser.id) {
      alert('No puedes eliminar tu propia cuenta')
      return
    }

    if (!window.confirm(`¿Eliminar permanentemente al usuario "${userName}"?\n\nEsta accion eliminara tambien todos sus productos y posts. No se puede deshacer.`)) {
      return
    }

    try {
      await usersAPI.delete(userId)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el usuario')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestion de Usuarios</h1>
        <p>Administra los usuarios del sistema</p>
      </header>

      <nav className="admin-nav">
        <Link to="/admin" className="admin-nav-link">
          Productos
        </Link>
        <Link to="/admin/users" className="admin-nav-link active">
          Usuarios
        </Link>
      </nav>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={loadUsers} className="btn btn-sm" style={{ marginLeft: '10px' }}>
            Reintentar
          </button>
        </div>
      )}

      <section className="admin-section">
        <div className="admin-header">
          <h2>Usuarios ({users.length})</h2>
        </div>

        {users.length === 0 ? (
          <p className="no-data">No hay usuarios registrados</p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.id === currentUser.id ? 'current-user-row' : ''}>
                    <td>{user.id}</td>
                    <td>
                      {user.name}
                      {user.id === currentUser.id && <span className="badge badge-info"> (Tu)</span>}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="admin-actions">
                      <button
                        onClick={() => handleRoleChange(user.id, user.name, user.role)}
                        className="btn btn-secondary btn-sm"
                        disabled={user.id === currentUser.id}
                        title={user.id === currentUser.id ? 'No puedes cambiar tu propio rol' : ''}
                      >
                        {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="btn btn-danger btn-sm"
                        disabled={user.id === currentUser.id}
                        title={user.id === currentUser.id ? 'No puedes eliminarte a ti mismo' : ''}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default UserManagement
