import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'database.sqlite');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Dropping users table to force schema update...");
    db.run("DROP TABLE IF EXISTS users");
    console.log("Done.");
});
