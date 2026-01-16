/**
 * Rutas de Productos
 * - Usuarios autenticados pueden crear/editar/eliminar SUS propios productos
 * - Admin puede gestionar TODOS los productos
 * - Listado publico para todos
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/products
 * Listar todos los productos (publico)
 * Incluye nombre del propietario
 */
router.get('/', async (req, res) => {
    try {
        const [products] = await pool.execute(
            `SELECT p.id, p.name, p.price, p.image_url, p.user_id,
                    p.created_at, p.updated_at, u.name as owner_name
             FROM products p
             JOIN users u ON p.user_id = u.id
             ORDER BY p.created_at DESC`
        );

        res.json({
            error: false,
            count: products.length,
            products
        });

    } catch (error) {
        console.error('Error al listar productos:', error);
        res.status(500).json({
            error: true,
            message: 'Error al obtener productos'
        });
    }
});

/**
 * GET /api/products/my
 * Obtener productos del usuario autenticado
 */
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const [products] = await pool.execute(
            `SELECT id, name, price, image_url, created_at, updated_at
             FROM products
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            error: false,
            count: products.length,
            products
        });

    } catch (error) {
        console.error('Error al listar mis productos:', error);
        res.status(500).json({
            error: true,
            message: 'Error al obtener tus productos'
        });
    }
});

/**
 * GET /api/products/:id
 * Obtener un producto por ID (publico)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.execute(
            `SELECT p.id, p.name, p.price, p.image_url, p.user_id,
                    p.created_at, p.updated_at, u.name as owner_name
             FROM products p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            error: false,
            product: products[0]
        });

    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({
            error: true,
            message: 'Error al obtener producto'
        });
    }
});

/**
 * POST /api/products
 * Crear nuevo producto (usuarios autenticados)
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, price, image_url } = req.body;

        // Validar campos requeridos
        if (!name || !price) {
            return res.status(400).json({
                error: true,
                message: 'Nombre y precio son requeridos'
            });
        }

        // Validar que el precio sea un numero positivo
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({
                error: true,
                message: 'El precio debe ser un numero positivo'
            });
        }

        // Validar longitud del nombre
        if (name.length > 200) {
            return res.status(400).json({
                error: true,
                message: 'El nombre no puede exceder 200 caracteres'
            });
        }

        // Insertar producto con user_id del usuario autenticado
        const [result] = await pool.execute(
            'INSERT INTO products (name, price, image_url, user_id) VALUES (?, ?, ?, ?)',
            [name.trim(), priceNum, image_url || null, req.user.id]
        );

        // Obtener el producto creado
        const [newProduct] = await pool.execute(
            `SELECT p.id, p.name, p.price, p.image_url, p.user_id,
                    p.created_at, p.updated_at, u.name as owner_name
             FROM products p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            error: false,
            message: 'Producto creado exitosamente',
            product: newProduct[0]
        });

    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({
            error: true,
            message: 'Error al crear producto'
        });
    }
});

/**
 * PUT /api/products/:id
 * Actualizar producto (propietario o admin)
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, image_url } = req.body;

        // Verificar que el producto existe
        const [existing] = await pool.execute(
            'SELECT id, user_id FROM products WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Producto no encontrado'
            });
        }

        // Verificar permisos: propietario o admin
        const product = existing[0];
        if (product.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                error: true,
                message: 'No tienes permiso para editar este producto'
            });
        }

        // Validar campos requeridos
        if (!name || !price) {
            return res.status(400).json({
                error: true,
                message: 'Nombre y precio son requeridos'
            });
        }

        // Validar que el precio sea un numero positivo
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({
                error: true,
                message: 'El precio debe ser un numero positivo'
            });
        }

        // Validar longitud del nombre
        if (name.length > 200) {
            return res.status(400).json({
                error: true,
                message: 'El nombre no puede exceder 200 caracteres'
            });
        }

        // Actualizar producto
        await pool.execute(
            'UPDATE products SET name = ?, price = ?, image_url = ? WHERE id = ?',
            [name.trim(), priceNum, image_url || null, id]
        );

        // Obtener el producto actualizado
        const [updated] = await pool.execute(
            `SELECT p.id, p.name, p.price, p.image_url, p.user_id,
                    p.created_at, p.updated_at, u.name as owner_name
             FROM products p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        res.json({
            error: false,
            message: 'Producto actualizado exitosamente',
            product: updated[0]
        });

    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            error: true,
            message: 'Error al actualizar producto'
        });
    }
});

/**
 * DELETE /api/products/:id
 * Eliminar producto (propietario o admin)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el producto existe
        const [existing] = await pool.execute(
            'SELECT id, name, user_id FROM products WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Producto no encontrado'
            });
        }

        // Verificar permisos: propietario o admin
        const product = existing[0];
        if (product.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                error: true,
                message: 'No tienes permiso para eliminar este producto'
            });
        }

        // Eliminar producto
        await pool.execute('DELETE FROM products WHERE id = ?', [id]);

        res.json({
            error: false,
            message: `Producto "${product.name}" eliminado exitosamente`
        });

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            error: true,
            message: 'Error al eliminar producto'
        });
    }
});

module.exports = router;
