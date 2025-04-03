import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db/init.js';
import authRouter from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';
import claimsRouter from './routes/claims.js';
import validateRouter from './routes/validate.js';
import rtiRouter from './routes/rti.js';
import app from './app.js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to look in the server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        // Initialize database
        await initDB();
        console.log('Database initialized successfully');

        // Start server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Health check available at http://localhost:${port}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 