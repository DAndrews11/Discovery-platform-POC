import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from './db/utils.js';
import claimsRouter from './routes/claims.js';
import authRouter from './routes/auth.js';
import rtiRoutes from './routes/rti.js';
import validateRouter from './routes/validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all origins in development
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://0.0.0.0:5173',
        /\.replit\.dev$/,    // Allow all Replit domains
        /\.repl\.co$/        // Allow all Repl.co domains
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Trust the proxy (for Replit)
app.set('trust proxy', 1);

// Parse JSON bodies
app.use(express.json());

// Initialize database connection
getDB().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/claims', claimsRouter);
app.use('/api/validate', validateRouter);
app.use('/api/rti', rtiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

export default app; 