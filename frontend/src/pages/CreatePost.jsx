/**
 * CreatePost - Formulario para crear nuevas publicaciones
 * Requiere usuario autenticado
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { blogAPI } from '../services/api'

function CreatePost() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      await blogAPI.create({
        title: formData.title.trim(),
        content: formData.content.trim()
      })

      navigate('/blog')
    } catch (err) {
      const message = err.response?.data?.message || 'Error al crear la publicacion'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <header className="form-header">
          <h1>Nueva Publicacion</h1>
          <p>Comparte tu contenido con la comunidad</p>
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
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost
