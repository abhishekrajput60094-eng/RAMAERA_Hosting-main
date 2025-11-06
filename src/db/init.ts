import pool from '../lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initializeDatabase() {
    try {
        // Read the schema SQL file
        const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

        // Execute the SQL
        await pool.query(schemaSQL);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await pool.end();
    }
}

initializeDatabase();