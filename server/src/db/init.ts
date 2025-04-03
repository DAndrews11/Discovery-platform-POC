import { getDB } from './utils.js';
import * as fs from 'fs';
import * as path from 'path';

export async function initDB() {
    console.log('Initializing database...');
    
    try {
        const db = await getDB();
        console.log('Verifying database tables...');

        // Create users table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table verified');

        // Create claims table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS claims (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                claim_nb_tx TEXT NOT NULL,
                claim_title TEXT NOT NULL,
                description TEXT,
                published_url TEXT,
                category TEXT,
                status TEXT DEFAULT 'Opened',
                comments TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                date_published DATETIME,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);
        console.log('Claims table verified');

        // Create validations table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                claim_id INTEGER NOT NULL,
                validator_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                notes TEXT,
                ai_generated_full_report TEXT,
                ai_generated_conclusion TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (claim_id) REFERENCES claims(id),
                FOREIGN KEY (validator_id) REFERENCES users(id)
            )
        `);
        console.log('Validations table verified');

        // Create rti_requests table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS rti_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                claim_id INTEGER NOT NULL,
                validator_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                notes TEXT,
                ai_generated_rti_request TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (claim_id) REFERENCES claims(id),
                FOREIGN KEY (validator_id) REFERENCES users(id)
            )
        `);
        console.log('RTI requests table verified');

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
} 