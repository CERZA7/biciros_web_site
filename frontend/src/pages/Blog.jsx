/**
 * Blog - Pagina de publicaciones
 * Lista todos los posts, permite crear si esta autenticado
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { blogAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated, isAdmin, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await blogAPI.getAll()
      setPosts(response.posts || [])
      setError(null)
    } catch (err) {
      setError('Error al cargar las publicaciones')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId, postTitle) => {
    if (!window.confirm(`¿Eliminar la publicacion "${postTitle}"?`)) {
      return
    }

    try {
      await blogAPI.delete(postId)
      setPosts(posts.filter(p => p.id !== postId))
    } catch (err) {
      alert('Error al eliminar la publicacion')
      console.error(err)
    }
  }

  const canEditPost = (post) => {
    return isAdmin || (user && post.author_id === user.id)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando publicaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadPosts} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Blog</h1>
        <p>Articulos y noticias sobre ciclismo</p>
      </header>

      <section className="blog-actions">
        {isAuthenticated ? (
          <Link to="/blog/create" className="btn btn-primary">
            Nueva publicacion
          </Link>
        ) : (
          <p className="auth-message">
            <Link to="/login">Inicia sesion</Link> para crear publicaciones
          </p>
        )}
      </section>

      <section className="posts-section">
        {posts.length === 0 ? (
          <p className="no-data">No hay publicaciones todavia</p>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <header className="post-header">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-meta">
                    <span className="post-author">Por {post.author_name}</span>
                    <span className="post-date">{formatDate(post.created_at)}</span>
                  </div>
                </header>

                <div className="post-content">
                  <p>{post.content}</p>
                </div>

                {canEditPost(post) && (
                  <footer className="post-actions">
                    <button
                      onClick={() => navigate(`/blog/edit/${post.id}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="btn btn-danger btn-sm"
                    >
                      Eliminar
                    </button>
                  </footer>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Blog
