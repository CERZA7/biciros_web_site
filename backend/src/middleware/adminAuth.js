/**
 * Middleware de Autorizacion Admin
 * Verifica que el usuario autenticado tenga rol de administrador
 * IMPORTANTE: Debe usarse DESPUES del middleware auth.js
 */

const adminAuthMiddleware = (req, res, next) => {
    // Verificar que el middleware de auth haya agregado el usuario
    if (!req.user) {
        return res.status(401).json({
            error: true,
            message: 'Usuario no autenticado'
        });
    }

    // Verificar que el rol sea admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: true,
            message: 'Acceso denegado. Se requieren permisos de administrador'
        });
    }

    next();
};

module.exports = adminAuthMiddleware;
