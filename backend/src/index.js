/**
 * Biciros Backend - Servidor Express
 * API para tienda de ciclismo
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');

// Crear aplicacion Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuracion de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Biciros API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/users', require('./routes/users'));

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Error interno del servidor'
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: 'Ruta no encontrada'
    });
});

// Iniciar servidor
const startServer = async () => {
    // Verificar conexion a la base de datos
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.error('No se pudo conectar a la base de datos. Verifica la configuracion.');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Servidor Biciros corriendo en http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
};

startServer();
