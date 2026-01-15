# Biciros - Tienda de Ciclismo

Sistema web completo para tienda de ciclismo con panel de administracion y blog.

## Tecnologias

**Backend:**
- Node.js + Express
- MySQL + mysql2
- JWT (jsonwebtoken)
- bcrypt

**Frontend:**
- React 18 + Vite
- React Router DOM
- Axios
- CSS puro

## Requisitos Previos

- Node.js 18+
- MySQL 8+ (o XAMPP)
- Git

## Instalacion

### 1. Clonar repositorio

```bash
git clone https://github.com/CERZA7/biciros_web_site.git
cd biciros_web_site
```

### 2. Configurar Base de Datos

Inicia MySQL (o XAMPP) y ejecuta el schema:

```bash
mysql -u root -p < database/schema.sql
```

O importa `database/schema.sql` desde phpMyAdmin.

### 3. Configurar Backend

```bash
cd backend
cp .env.example .env
npm install
```

Edita `.env` con tus credenciales de MySQL:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=tienda_ciclismo
JWT_SECRET=cambia_esto_por_un_secreto_seguro_de_32_caracteres
FRONTEND_URL=http://localhost:5173
```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

### 5. Ejecutar

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Abre: http://localhost:5173

## Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@tienda.com | admin123 |
| Usuario | user@tienda.com | user123 |

## Estructura del Proyecto

```
biciros_web_site/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js, adminAuth.js
│   │   ├── routes/auth.js, products.js, blog.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/Navbar.jsx, ProtectedRoute.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/*.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── database/
│   └── schema.sql
└── README.md
```

## API Endpoints

### Auth
| Metodo | Ruta | Acceso | Descripcion |
|--------|------|--------|-------------|
| POST | /api/auth/login | Publico | Login |
| GET | /api/auth/me | Autenticado | Usuario actual |

### Productos
| Metodo | Ruta | Acceso | Descripcion |
|--------|------|--------|-------------|
| GET | /api/products | Publico | Listar |
| GET | /api/products/:id | Publico | Ver uno |
| POST | /api/products | Admin | Crear |
| PUT | /api/products/:id | Admin | Actualizar |
| DELETE | /api/products/:id | Admin | Eliminar |

### Blog
| Metodo | Ruta | Acceso | Descripcion |
|--------|------|--------|-------------|
| GET | /api/blog | Publico | Listar |
| GET | /api/blog/:id | Publico | Ver uno |
| POST | /api/blog | Autenticado | Crear |
| PUT | /api/blog/:id | Autor/Admin | Actualizar |
| DELETE | /api/blog/:id | Autor/Admin | Eliminar |

## Funcionalidades

- Login con JWT (sin registro publico)
- Panel admin para gestion de productos
- Blog con creacion de posts para usuarios autenticados
- Edicion/eliminacion de posts solo por autor o admin
- Diseno responsive

## Rutas Frontend

| Ruta | Acceso | Pagina |
|------|--------|--------|
| / | Publico | Inicio - Productos |
| /blog | Publico | Blog |
| /login | Publico | Login |
| /blog/create | Autenticado | Crear post |
| /blog/edit/:id | Autor/Admin | Editar post |
| /admin | Admin | Panel admin |
| /admin/products/new | Admin | Nuevo producto |
| /admin/products/edit/:id | Admin | Editar producto |
