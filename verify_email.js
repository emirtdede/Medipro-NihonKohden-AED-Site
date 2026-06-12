import db from './database.js';

const EMAIL = 'emir.dede@medipro.com.tr';

db.serialize(() => {
    const stmt = db.prepare("UPDATE users SET email_verified = 1 WHERE email = ?");
    stmt.run(EMAIL, function (err) {
        if (err) console.error("Update Error:", err);
        else console.log(`Email verified for ${EMAIL}. Changes: ${this.changes}`);
    });
});
