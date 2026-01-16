/**
 * Servicio API - Conexion con el backend
 * Usa Axios para todas las peticiones HTTP
 */

import axios from 'axios'

// Crear instancia de Axios con configuracion base
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiro o es invalido, limpiar localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH ====================

export const authAPI = {
  // Login - Solo este endpoint de auth (no hay registro)
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Obtener usuario actual
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  }
}

// ==================== PRODUCTS ====================

export const productsAPI = {
  // Listar todos los productos (publico)
  getAll: async () => {
    const response = await api.get('/products')
    return response.data
  },

  // Obtener productos del usuario autenticado
  getMyProducts: async () => {
    const response = await api.get('/products/my')
    return response.data
  },

  // Obtener un producto por ID (publico)
  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  // Crear producto (usuario autenticado)
  create: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  // Actualizar producto (propietario o admin)
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  // Eliminar producto (propietario o admin)
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  }
}

// ==================== USERS (Admin) ====================

export const usersAPI = {
  // Listar todos los usuarios (solo admin)
  getAll: async () => {
    const response = await api.get('/users')
    return response.data
  },

  // Obtener un usuario por ID (solo admin)
  getById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Cambiar rol de usuario (solo admin)
  updateRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role })
    return response.data
  },

  // Eliminar usuario (solo admin)
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  }
}

// ==================== BLOG ====================

export const blogAPI = {
  // Listar todos los posts (publico)
  getAll: async () => {
    const response = await api.get('/blog')
    return response.data
  },

  // Obtener un post por ID (publico)
  getById: async (id) => {
    const response = await api.get(`/blog/${id}`)
    return response.data
  },

  // Crear post (usuario autenticado)
  create: async (postData) => {
    const response = await api.post('/blog', postData)
    return response.data
  },

  // Actualizar post (solo autor o admin)
  update: async (id, postData) => {
    const response = await api.put(`/blog/${id}`, postData)
    return response.data
  },

  // Eliminar post (solo autor o admin)
  delete: async (id) => {
    const response = await api.delete(`/blog/${id}`)
    return response.data
  }
}

export default api
