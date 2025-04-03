import sqlite3 from 'sqlite3';
import { Database as SQLiteDatabase, open } from 'sqlite';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Configure dotenv to look in the server directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Get database path from environment variable or use default
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'db', 'discovery.sqlite');

let db: SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLiteDatabase> {
    if (!db) {
        try {
            // Ensure the path is absolute
            const absolutePath = path.resolve(DB_PATH);
            console.log('Opening database at:', absolutePath);
            
            // Ensure the directory exists
            const dbDir = path.dirname(absolutePath);
            if (!fs.existsSync(dbDir)) {
                console.log('Creating database directory:', dbDir);
                fs.mkdirSync(dbDir, { recursive: true });
            }
            
            console.log('Connecting to database...');
            db = await open({
                filename: absolutePath,
                driver: sqlite3.Database,
                mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
            });

            // Enable foreign keys
            await db.run('PRAGMA foreign_keys = ON');
            console.log('Database connection established successfully');
            
        } catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }
    return db;
}

export async function closeDB(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}

export async function saveDB(): Promise<void> {
    if (db) {
        await db.run('PRAGMA wal_checkpoint(FULL)');
    }
}

export async function runQuery<T>(query: string, params: any[] = []): Promise<T[]> {
    const database = await getDB();
    return database.all(query, params);
}

export async function runInTransaction(callback: () => Promise<void>): Promise<void> {
    const database = await getDB();
    try {
        await database.run('BEGIN TRANSACTION');
        await callback();
        await database.run('COMMIT');
        await saveDB();
    } catch (error) {
        await database.run('ROLLBACK');
        throw error;
    }
}

export { SQLiteDatabase as Database }; 