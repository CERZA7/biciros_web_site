/**
 * Rutas de Productos
 * CRUD completo - Solo admin puede crear/editar/eliminar
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

/**
 * GET /api/products
 * Listar todos los productos (publico)
 */
router.get('/', async (req, res) => {
    try {
        const [products] = await pool.execute(
            'SELECT id, name, price, image_url, created_at, updated_at FROM products ORDER BY created_at DESC'
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
 * GET /api/products/:id
 * Obtener un producto por ID (publico)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.execute(
            'SELECT id, name, price, image_url, created_at, updated_at FROM products WHERE id = ?',
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
 * Crear nuevo producto (solo admin)
 */
router.post('/', authMiddleware, adminAuthMiddleware, async (req, res) => {
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

        // Insertar producto
        const [result] = await pool.execute(
            'INSERT INTO products (name, price, image_url) VALUES (?, ?, ?)',
            [name.trim(), priceNum, image_url || null]
        );

        // Obtener el producto creado
        const [newProduct] = await pool.execute(
            'SELECT id, name, price, image_url, created_at, updated_at FROM products WHERE id = ?',
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
 * Actualizar producto existente (solo admin)
 */
router.put('/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, image_url } = req.body;

        // Verificar que el producto existe
        const [existing] = await pool.execute(
            'SELECT id FROM products WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Producto no encontrado'
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
            'SELECT id, name, price, image_url, created_at, updated_at FROM products WHERE id = ?',
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
 * Eliminar producto (solo admin)
 */
router.delete('/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el producto existe
        const [existing] = await pool.execute(
            'SELECT id, name FROM products WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Producto no encontrado'
            });
        }

        // Eliminar producto
        await pool.execute('DELETE FROM products WHERE id = ?', [id]);

        res.json({
            error: false,
            message: `Producto "${existing[0].name}" eliminado exitosamente`
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
