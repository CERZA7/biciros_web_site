-- =====================================================
-- BICIROS - Tienda de Ciclismo
-- Schema de Base de Datos
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS tienda_ciclismo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE tienda_ciclismo;

-- =====================================================
-- TABLA: users
-- Almacena los usuarios del sistema (admin y usuarios comunes)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: products
-- Almacena los productos de la tienda de ciclismo
-- Cada producto pertenece a un usuario (user_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_price (price),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: blog_posts
-- Almacena las publicaciones del blog
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_author (author_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- DATOS DE PRUEBA: Usuarios
-- Contraseñas hasheadas con bcrypt (cost factor 10)
-- Credenciales: admin@tienda.com/admin123 y user@tienda.com/user123
-- =====================================================
INSERT INTO users (email, password_hash, name, role) VALUES
-- Admin: admin@tienda.com / admin123
('admin@tienda.com', '$2b$10$3kulcDdtx48LpVrv3Xc2/OPMPVa09gj6LEFgXD/fsqKmuzJPS6GC6', 'Administrador', 'admin'),
-- Usuario: user@tienda.com / user123
('user@tienda.com', '$2b$10$24./iARsgyMfPx8uNv/nFu4bur6fexBzePsCEkhLLMHwBKXiVQf4K', 'Usuario Comun', 'user');

-- =====================================================
-- DATOS DE PRUEBA: Productos de ciclismo
-- user_id = 1 (admin) para productos iniciales
-- =====================================================
INSERT INTO products (name, price, image_url, user_id) VALUES
('Bicicleta de Montaña Pro X500', 1299.99, 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500', 1),
('Casco Aerodinámico Elite', 189.99, 'https://mybike.com.co/wp-content/uploads/2025/08/1754992320_39Ya-estoy-contando-los-anos-hasta-la-jubilacion39-Tadej.jpg', 1),
('Guantes Ciclismo Gel Premium', 45.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', 1),
('Luz LED Delantera 1000 Lumens', 79.99, 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500', 1),
('Candado U-Lock Seguridad Máxima', 65.00, 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=500', 1);

-- =====================================================
-- MIGRACION: Para bases de datos existentes
-- Ejecutar si ya tienes productos sin user_id
-- =====================================================
-- ALTER TABLE products ADD COLUMN user_id INT NULL AFTER image_url;
-- UPDATE products SET user_id = 1 WHERE user_id IS NULL;
-- ALTER TABLE products MODIFY COLUMN user_id INT NOT NULL;
-- ALTER TABLE products ADD CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- CREATE INDEX idx_user_id ON products(user_id);

-- =====================================================
-- DATOS DE PRUEBA: Posts del Blog
-- =====================================================
INSERT INTO blog_posts (title, content, author_id) VALUES
('Bienvenidos a Biciros',
'¡Bienvenidos a nuestra tienda de ciclismo! En Biciros encontrarás todo lo que necesitas para tu pasión por las dos ruedas. Desde bicicletas de montaña hasta accesorios de alta calidad, estamos aquí para acompañarte en cada pedaleo.',
1),
('5 Consejos para Mantener tu Bicicleta',
'El mantenimiento regular de tu bicicleta es esencial para prolongar su vida útil y garantizar tu seguridad. Aquí te compartimos 5 consejos básicos:\n\n1. Revisa la presión de los neumáticos semanalmente\n2. Lubrica la cadena cada 200km\n3. Verifica los frenos antes de cada salida\n4. Limpia tu bicicleta después de rutas con barro\n5. Revisa el ajuste de tornillos mensualmente',
1);
