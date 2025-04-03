import * as dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './init.js';
import { getDB, closeDB } from './utils.js';

// Configure dotenv to look in the root directory
dotenv.config({ path: path.join(__dirname, '../../../.env') });

console.log('Starting database initialization...');

async function main() {
    try {
        await initializeDatabase();
        console.log('Database initialized successfully!');

        // Test query to verify tables were created
        const database = await getDB();
        const tables = database.exec(`
          SELECT name FROM sqlite_master 
          WHERE type='table' 
          ORDER BY name;
        `);

        console.log('Created tables:', tables);

        // Close the database connection
        closeDB();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
}); 