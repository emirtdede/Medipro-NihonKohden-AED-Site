import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            phone TEXT,
            email_verified INTEGER DEFAULT 0,
            phone_verified INTEGER DEFAULT 0,
            failed_attempts INTEGER DEFAULT 0,
            lock_until INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS reset_tokens (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // OTP Logs (Optional, for auditing)
        db.run(`CREATE TABLE IF NOT EXISTS otp_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Phase 05: Unique Visitors Table (State-based)
        db.run(`CREATE TABLE IF NOT EXISTS visitors_ip (
            ip_hash TEXT PRIMARY KEY,
            first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
            visit_count INTEGER DEFAULT 1,
            country TEXT,
            city TEXT,
            region TEXT,
            browser TEXT,
            os TEXT,
            device TEXT,
            user_agent TEXT
        )`);

        // Phase 06: Monthly Geo Aggregation
        db.run(`CREATE TABLE IF NOT EXISTS visits_monthly_geo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER,
            month INTEGER,
            country TEXT,
            city TEXT,
            count INTEGER DEFAULT 1,
            UNIQUE(year, month, country, city)
        )`);

        // Removed old visitor_stats table to prevent confusion/bloat
        // db.run(`DROP TABLE IF EXISTS visitor_stats`);

        console.log('Database tables initialized.');
    });
}

export default db;
