/**
 * Rutas de Usuarios
 * CRUD para administradores - Gestion de usuarios del sistema
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

/**
 * GET /api/users
 * Listar todos los usuarios (solo admin)
 */
router.get('/', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT id, email, name, role, created_at
             FROM users ORDER BY created_at DESC`
        );

        res.json({
            error: false,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({
            error: true,
            message: 'Error al obtener usuarios'
        });
    }
});

/**
 * GET /api/users/:id
 * Obtener un usuario por ID (solo admin)
 */
router.get('/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.execute(
            'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            error: false,
            user: users[0]
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            error: true,
            message: 'Error al obtener usuario'
        });
    }
});

/**
 * PUT /api/users/:id/role
 * Cambiar rol de un usuario (solo admin)
 */
router.put('/:id/role', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validar rol
        if (!role || !['admin', 'user'].includes(role)) {
            return res.status(400).json({
                error: true,
                message: 'Rol invalido. Debe ser "admin" o "user"'
            });
        }

        // Verificar que el usuario existe
        const [existing] = await pool.execute(
            'SELECT id, email, name FROM users WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar rol
        await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );

        res.json({
            error: false,
            message: `Rol de "${existing[0].name}" actualizado a "${role}"`,
            user: { ...existing[0], role }
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({
            error: true,
            message: 'Error al actualizar rol'
        });
    }
});

/**
 * DELETE /api/users/:id
 * Eliminar usuario permanentemente (solo admin)
 */
router.delete('/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userIdToDelete = parseInt(id);

        // Admin no puede eliminarse a si mismo
        if (userIdToDelete === req.user.id) {
            return res.status(400).json({
                error: true,
                message: 'No puedes eliminar tu propia cuenta'
            });
        }

        // Verificar que el usuario existe
        const [existing] = await pool.execute(
            'SELECT id, email, name FROM users WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Usuario no encontrado'
            });
        }

        // Eliminar usuario (CASCADE eliminara sus productos y posts)
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        res.json({
            error: false,
            message: `Usuario "${existing[0].name}" eliminado exitosamente`
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            error: true,
            message: 'Error al eliminar usuario'
        });
    }
});

module.exports = router;
