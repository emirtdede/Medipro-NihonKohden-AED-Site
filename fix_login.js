import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'database.sqlite');

const db = new sqlite3.Database(dbPath);

const email = 'emir.dede@medipro.com.tr';
const password = 'emr336699x*';
const role = 'admin';

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

db.serialize(() => {
    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error("Error checking user:", err);
            return;
        }

        if (user) {
            // Update password
            console.log(`User ${email} found. Resetting password...`);
            db.run('UPDATE users SET password_hash = ?, failed_attempts = 0, lock_until = NULL WHERE email = ?', [hash, email], (err) => {
                if (err) console.error("Error updating password:", err);
                else console.log(`Password for ${email} reset to: ${password}`);
            });
        } else {
            // Create user
            console.log(`User ${email} not found. Creating...`);
            const stmt = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)');
            stmt.run(email, hash, role, (err) => {
                if (err) console.error("Error creating user:", err);
                else console.log(`User ${email} created with password: ${password}`);
            });
            stmt.finalize();
        }
    });
});
