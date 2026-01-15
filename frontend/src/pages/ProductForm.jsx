/**
 * ProductForm - Formulario para crear/editar productos
 * Solo accesible para admin
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productsAPI } from '../services/api'

function ProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditing)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoadingProduct(true)
      const response = await productsAPI.getById(id)
      const product = response.product
      setFormData({
        name: product.name || '',
        price: product.price || '',
        image_url: product.image_url || ''
      })
    } catch (err) {
      setError('Error al cargar el producto')
      console.error(err)
    } finally {
      setLoadingProduct(false)
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
    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('El precio debe ser un numero positivo')
      return
    }

    try {
      setLoading(true)

      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        image_url: formData.image_url.trim() || null
      }

      if (isEditing) {
        await productsAPI.update(id, productData)
      } else {
        await productsAPI.create(productData)
      }

      navigate('/admin')
    } catch (err) {
      const message = err.response?.data?.message || 'Error al guardar el producto'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <header className="form-header">
          <h1>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h1>
          <p>{isEditing ? 'Modifica los datos del producto' : 'Agrega un nuevo producto a la tienda'}</p>
        </header>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Nombre del producto *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Bicicleta de montaña"
              disabled={loading}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Precio (USD) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              disabled={loading}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image_url">URL de imagen</label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={loading}
            />
            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin')}
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
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
