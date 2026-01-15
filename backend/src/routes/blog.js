/**
 * Rutas del Blog
 * - Listar/Ver posts: publico
 * - Crear posts: usuarios autenticados
 * - Editar/Eliminar: solo autor o admin
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/blog
 * Listar todos los posts (publico)
 */
router.get('/', async (req, res) => {
    try {
        const [posts] = await pool.execute(`
            SELECT
                bp.id,
                bp.title,
                bp.content,
                bp.created_at,
                bp.updated_at,
                bp.author_id,
                u.name as author_name,
                u.email as author_email
            FROM blog_posts bp
            JOIN users u ON bp.author_id = u.id
            ORDER BY bp.created_at DESC
        `);

        res.json({
            error: false,
            count: posts.length,
            posts
        });

    } catch (error) {
        console.error('Error al listar posts:', error);
        res.status(500).json({
            error: true,
            message: 'Error al obtener posts'
        });
    }
});

/**
 * GET /api/blog/:id
 * Obtener un post por ID (publico)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [posts] = await pool.execute(`
            SELECT
                bp.id,
                bp.title,
                bp.content,
                bp.created_at,
                bp.updated_at,
                bp.author_id,
                u.name as author_name,
                u.email as author_email
            FROM blog_posts bp
            JOIN users u ON bp.author_id = u.id
            WHERE bp.id = ?
        `, [id]);

        if (posts.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Post no encontrado'
            });
        }

        res.json({
            error: false,
            post: posts[0]
        });

    } catch (error) {
        console.error('Error al obtener post:', error);
        res.status(500).json({
            error: true,
            message: 'Error al obtener post'
        });
    }
});

/**
 * POST /api/blog
 * Crear nuevo post (solo usuarios autenticados)
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const author_id = req.user.id;

        // Validar campos requeridos
        if (!title || !content) {
            return res.status(400).json({
                error: true,
                message: 'Titulo y contenido son requeridos'
            });
        }

        // Validar longitud del titulo
        if (title.length > 300) {
            return res.status(400).json({
                error: true,
                message: 'El titulo no puede exceder 300 caracteres'
            });
        }

        // Validar contenido minimo
        if (content.trim().length < 10) {
            return res.status(400).json({
                error: true,
                message: 'El contenido debe tener al menos 10 caracteres'
            });
        }

        // Insertar post
        const [result] = await pool.execute(
            'INSERT INTO blog_posts (title, content, author_id) VALUES (?, ?, ?)',
            [title.trim(), content.trim(), author_id]
        );

        // Obtener el post creado con datos del autor
        const [newPost] = await pool.execute(`
            SELECT
                bp.id,
                bp.title,
                bp.content,
                bp.created_at,
                bp.updated_at,
                bp.author_id,
                u.name as author_name,
                u.email as author_email
            FROM blog_posts bp
            JOIN users u ON bp.author_id = u.id
            WHERE bp.id = ?
        `, [result.insertId]);

        res.status(201).json({
            error: false,
            message: 'Post creado exitosamente',
            post: newPost[0]
        });

    } catch (error) {
        console.error('Error al crear post:', error);
        res.status(500).json({
            error: true,
            message: 'Error al crear post'
        });
    }
});

/**
 * PUT /api/blog/:id
 * Actualizar post (solo autor o admin)
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar que el post existe
        const [existing] = await pool.execute(
            'SELECT id, author_id FROM blog_posts WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Post no encontrado'
            });
        }

        // Verificar permisos: solo autor o admin
        if (existing[0].author_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                error: true,
                message: 'No tienes permiso para editar este post'
            });
        }

        // Validar campos requeridos
        if (!title || !content) {
            return res.status(400).json({
                error: true,
                message: 'Titulo y contenido son requeridos'
            });
        }

        // Validar longitud del titulo
        if (title.length > 300) {
            return res.status(400).json({
                error: true,
                message: 'El titulo no puede exceder 300 caracteres'
            });
        }

        // Validar contenido minimo
        if (content.trim().length < 10) {
            return res.status(400).json({
                error: true,
                message: 'El contenido debe tener al menos 10 caracteres'
            });
        }

        // Actualizar post
        await pool.execute(
            'UPDATE blog_posts SET title = ?, content = ? WHERE id = ?',
            [title.trim(), content.trim(), id]
        );

        // Obtener el post actualizado
        const [updated] = await pool.execute(`
            SELECT
                bp.id,
                bp.title,
                bp.content,
                bp.created_at,
                bp.updated_at,
                bp.author_id,
                u.name as author_name,
                u.email as author_email
            FROM blog_posts bp
            JOIN users u ON bp.author_id = u.id
            WHERE bp.id = ?
        `, [id]);

        res.json({
            error: false,
            message: 'Post actualizado exitosamente',
            post: updated[0]
        });

    } catch (error) {
        console.error('Error al actualizar post:', error);
        res.status(500).json({
            error: true,
            message: 'Error al actualizar post'
        });
    }
});

/**
 * DELETE /api/blog/:id
 * Eliminar post (solo autor o admin)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar que el post existe
        const [existing] = await pool.execute(
            'SELECT id, title, author_id FROM blog_posts WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Post no encontrado'
            });
        }

        // Verificar permisos: solo autor o admin
        if (existing[0].author_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                error: true,
                message: 'No tienes permiso para eliminar este post'
            });
        }

        // Eliminar post
        await pool.execute('DELETE FROM blog_posts WHERE id = ?', [id]);

        res.json({
            error: false,
            message: `Post "${existing[0].title}" eliminado exitosamente`
        });

    } catch (error) {
        console.error('Error al eliminar post:', error);
        res.status(500).json({
            error: true,
            message: 'Error al eliminar post'
        });
    }
});

module.exports = router;
