/**
 * Configuracion de conexion a MySQL
 * Usa mysql2 con pool de conexiones para mejor rendimiento
 */

const mysql = require('mysql2/promise');

// Crear pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tienda_ciclismo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Funcion para verificar la conexion
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexion a MySQL establecida correctamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error al conectar a MySQL:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };
