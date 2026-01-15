/**
 * App.jsx - Componente principal con rutas
 */

import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Paginas publicas
import Home from './pages/Home'
import Blog from './pages/Blog'
import Login from './pages/Login'

// Paginas privadas
import AdminPanel from './pages/AdminPanel'
import ProductForm from './pages/ProductForm'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas - usuario autenticado */}
          <Route path="/blog/create" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          <Route path="/blog/edit/:id" element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          } />

          {/* Rutas protegidas - solo admin */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin/products/new" element={
            <ProtectedRoute requireAdmin={true}>
              <ProductForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/products/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <ProductForm />
            </ProtectedRoute>
          } />

          {/* Ruta 404 */}
          <Route path="*" element={
            <div className="page-container">
              <div className="not-found">
                <h1>404</h1>
                <p>Pagina no encontrada</p>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
