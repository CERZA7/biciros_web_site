/**
 * EditPost - Formulario para editar publicaciones existentes
 * Solo autor del post o admin pueden editar
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { blogAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPost()
  }, [id])

  const loadPost = async () => {
    try {
      setLoadingPost(true)
      const response = await blogAPI.getById(id)
      const post = response.post

      // Verificar permisos
      if (!isAdmin && post.author_id !== user?.id) {
        navigate('/blog')
        return
      }

      setFormData({
        title: post.title || '',
        content: post.content || ''
      })
    } catch (err) {
      setError('Error al cargar la publicacion')
      console.error(err)
    } finally {
      setLoadingPost(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.title.trim()) {
      setError('El titulo es requerido')
      return
    }

    if (!formData.content.trim() || formData.content.trim().length < 10) {
      setError('El contenido debe tener al menos 10 caracteres')
      return
    }

    try {
      setLoading(true)

      await blogAPI.update(id, {
        title: formData.title.trim(),
        content: formData.content.trim()
      })

      navigate('/blog')
    } catch (err) {
      const message = err.response?.data?.message || 'Error al actualizar la publicacion'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingPost) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando publicacion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <header className="form-header">
          <h1>Editar Publicacion</h1>
          <p>Modifica el contenido de tu publicacion</p>
        </header>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Titulo *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Escribe un titulo atractivo"
              disabled={loading}
              maxLength={300}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenido *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Escribe el contenido de tu publicacion..."
              disabled={loading}
              rows={10}
            />
            <small className="form-hint">
              Minimo 10 caracteres ({formData.content.length} escritos)
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPost
