import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery } from '../db/utils.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface User {
    id: number;
    username: string;
    password: string;
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await runQuery<User>(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await runQuery<{ id: number }>(
            'INSERT INTO users (username, password) VALUES (?, ?) RETURNING id',
            [username, hashedPassword]
        );

        const userId = result[0]?.id;

        // Generate token
        const token = jwt.sign(
            { userId, username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { userId, username }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const users = await runQuery<User>(
            'SELECT id, username, password FROM users WHERE username = ?',
            [username]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: { userId: user.id, username: user.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

export default router; 