/**
 * AdminPanel - Panel de administracion
 * Gestion de productos (solo admin)
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productsAPI } from '../services/api'

function AdminPanel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getAll()
      setProducts(response.products || [])
      setError(null)
    } catch (err) {
      setError('Error al cargar los productos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`¿Eliminar el producto "${productName}"?`)) {
      return
    }

    try {
      await productsAPI.delete(productId)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      alert('Error al eliminar el producto')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Panel de Administracion</h1>
        <p>Gestion de productos de la tienda</p>
      </header>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={loadProducts} className="btn btn-sm">
            Reintentar
          </button>
        </div>
      )}

      <section className="admin-section">
        <div className="admin-header">
          <h2>Productos ({products.length})</h2>
          <Link to="/admin/products/new" className="btn btn-primary">
            Agregar Producto
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="no-data">No hay productos registrados</p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="admin-table-image"
                        />
                      ) : (
                        <span className="no-image">-</span>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td className="admin-actions">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="btn btn-danger btn-sm"
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

export default AdminPanel
