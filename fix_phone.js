import db from './database.js';

const CORRECT_PHONE = '+905303380543';
const EMAIL = 'emir.dede@medipro.com.tr';

db.serialize(() => {
    const stmt = db.prepare("UPDATE users SET phone = ?, phone_verified = 1 WHERE email = ?");
    stmt.run(CORRECT_PHONE, EMAIL, function (err) {
        if (err) console.error("Update Error:", err);
        else console.log(`Phone updated to ${CORRECT_PHONE}. Changes: ${this.changes}`);
    });
});
