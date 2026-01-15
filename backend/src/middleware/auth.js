/**
 * Middleware de Autenticacion JWT
 * Verifica que el usuario tenga un token valido
 */

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: true,
                message: 'Token de acceso no proporcionado'
            });
        }

        // El formato esperado es "Bearer <token>"
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: true,
                message: 'Formato de token invalido'
            });
        }

        const token = parts[1];

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Agregar los datos del usuario al request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: true,
                message: 'Token expirado'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: true,
                message: 'Token invalido'
            });
        }

        return res.status(500).json({
            error: true,
            message: 'Error al verificar token'
        });
    }
};

module.exports = authMiddleware;
