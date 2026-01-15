/**
 * Rutas de Autenticacion
 * Solo login - NO hay registro publico
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Iniciar sesion con email y password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos requeridos
        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: 'Email y password son requeridos'
            });
        }

        // Validar formato de email basico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: true,
                message: 'Formato de email invalido'
            });
        }

        // Buscar usuario por email (consulta parametrizada)
        const [users] = await pool.execute(
            'SELECT id, email, password_hash, name, role FROM users WHERE email = ?',
            [email]
        );

        // Verificar si el usuario existe
        if (users.length === 0) {
            return res.status(401).json({
                error: true,
                message: 'Credenciales invalidas'
            });
        }

        const user = users[0];

        // Verificar password con bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: true,
                message: 'Credenciales invalidas'
            });
        }

        // Generar token JWT (expira en 24 horas)
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Responder con token y datos del usuario
        res.json({
            error: false,
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: true,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /api/auth/me
 * Obtener datos del usuario autenticado (verificar token)
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // El middleware ya verifico el token y agrego req.user
        const [users] = await pool.execute(
            'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
            [req.user.id]
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
        console.error('Error en /me:', error);
        res.status(500).json({
            error: true,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;
