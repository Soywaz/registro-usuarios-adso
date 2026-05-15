const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Inicialización de la base de datos
const initDB = async () => {
    try {
        // 1. Crear la base de datos si no existe
        await db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        
        // 2. Usar la base de datos
        await db.query(`USE ${process.env.DB_NAME}`);
        
        // 3. Crear la tabla si no existe
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Base de datos y tabla preparadas correctamente');
    } catch (err) {
        console.error('❌ Error inicializando la base de datos:', err.message);
        console.log('Asegúrate de que XAMPP (MySQL) esté encendido.');
    }
};

initDB();

// Ruta de registro
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Aseguramos que estamos usando la DB correcta antes de insertar
        await db.query(`USE ${process.env.DB_NAME}`);
        
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        res.status(201).json({ message: '¡Usuario registrado con éxito!', userId: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El correo electrónico ya existe' });
        }
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
