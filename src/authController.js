import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';


const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Initial Registration (Use this route ONCE securely to seed the admin)
export const register = (req, res) => {
    const { email, password, role, phone } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-posta ve şifre gereklidir.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const stmt = db.prepare('INSERT INTO users (email, password_hash, role, phone) VALUES (?, ?, ?, ?)');
    stmt.run(email, hash, role || 'admin', phone, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ success: false, message: 'Bu e-posta zaten kullanımda.' });
            }
            return res.status(500).json({ success: false, message: 'Veritabanı hatası.' });
        }
        res.json({ success: true, message: 'Kullanıcı oluşturuldu.', userId: this.lastID });
    });
    stmt.finalize();
};

export const login = (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Sunucu hatası.' });

        if (!user) {
            // Security: Don't reveal user existence
            return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
        }

        // Check Lockout
        if (user.lock_until && user.lock_until > Date.now()) {
            return res.status(403).json({ success: false, message: 'Hesap geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.' });
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);

        if (!validPassword) {
            // Increment failed attempts
            let newFailedAttempts = (user.failed_attempts || 0) + 1;
            let lockUntil = user.lock_until;

            if (newFailedAttempts >= 5) {
                lockUntil = Date.now() + (15 * 60 * 1000); // 15 mins lock
                newFailedAttempts = 0; // Reset counter after locking
            }

            db.run('UPDATE users SET failed_attempts = ?, lock_until = ? WHERE id = ?', [newFailedAttempts, lockUntil, user.id]);

            return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
        }

        // Success - Reset failure counters
        db.run('UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = ?', [user.id]);

        // Generate Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

        res.json({ success: true, token, role: user.role });
    });
};

export const requestPasswordReset = (req, res) => {
    const { email } = req.body;

    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Hata.' });
        if (!user) {
            // Return success to avoid email enumeration
            return res.json({ success: true, message: 'Eğer kayıtlıysa, sıfırlama bağlantısı gönderildi.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + (15 * 60 * 1000); // 15 mins

        // Invalidate old tokens for this user
        db.run('DELETE FROM reset_tokens WHERE user_id = ?', [user.id], () => {
            const stmt = db.prepare('INSERT INTO reset_tokens (token, user_id, type, expires_at) VALUES (?, ?, ?, ?)');
            stmt.run(token, user.id, 'email', expiresAt, (err) => {
                if (err) return res.status(500).json({ message: "Token hatası" });

                // MOCK EMAIL SEND
                console.log(`[MOCK EMAIL] Password Reset Link for ${email}: http://localhost:3000/admin/reset-password.html?token=${token}`);

                res.json({ success: true, message: 'Sıfırlama bağlantısı gönderildi.' });
            });
            stmt.finalize();
        });
    });
};

export const resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    db.get('SELECT * FROM reset_tokens WHERE token = ?', [token], (err, record) => {
        if (err || !record) return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });

        if (record.expires_at < Date.now()) {
            return res.status(400).json({ success: false, message: 'Token süresi dolmuş.' });
        }

        // Valid Token -> Update Password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);

        db.serialize(() => {
            db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, record.user_id]);
            db.run('DELETE FROM reset_tokens WHERE token = ?', [token]); // Consume token
        });

        res.json({ success: true, message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });
    });
};

// --- Profile & Verification ---

export const getProfile = (req, res) => {
    db.get('SELECT id, email, phone, role, email_verified, phone_verified FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        res.json({ success: true, user });
    });
};

export const updateProfile = (req, res) => {
    const { email, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('[Profile] DB Error:', err);
            return res.status(500).json({ message: 'Veritabanı hatası.' });
        }
        if (!user) {
            console.error('[Profile] User not found for ID:', userId);
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Verify Current Password (ONLY if changing password OR if currentPassword is provided)
        // If updating email/phone without password, we skip this check (Assumes Session Security)
        if (currentPassword || newPassword) {
            if (!currentPassword) { // If newPassword set but current missing
                return res.status(401).json({ success: false, message: 'Şifre değiştirmek için mevcut şifrenizi girmelisiniz.' });
            }
            if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
                return res.status(401).json({ success: false, message: 'Mevcut şifre hatalı.' });
            }
        }

        const updates = [];
        const params = [];
        let emailChanged = false;
        let phoneChanged = false;

        // Update Email (if changed)
        if (email && email !== user.email) {
            updates.push('email = ?');
            updates.push('email_verified = 0'); // Reset verification
            params.push(email);
            emailChanged = true;
        }

        // Update Phone (if changed)
        if (phone && phone !== user.phone) {
            updates.push('phone = ?');
            updates.push('phone_verified = 0'); // Reset verification
            params.push(phone);
            phoneChanged = true;
        }

        // Update Password (if provided)
        if (newPassword && newPassword.length >= 6) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(newPassword, salt);
            updates.push('password_hash = ?');
            params.push(hash);
        }

        if (updates.length === 0) {
            return res.json({ success: true, message: 'Değişiklik yapılmadı.' });
        }

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        params.push(userId);

        db.run(query, params, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ success: false, message: 'Bu e-posta zaten kullanımda.' });
                return res.status(500).json({ success: false, message: 'Güncelleme hatası.' });
            }
            res.json({ success: true, message: 'Profil güncellendi.', emailChanged, phoneChanged });
        });
    });
};

export const sendVerification = (req, res) => {
    const { type } = req.body; // 'email' or 'sms'
    const userId = req.user.id;

    db.get('SELECT email, phone FROM users WHERE id = ?', [userId], (err, user) => {
        if (!user) return res.status(404).json({ message: 'User not found' });

        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
        const expiresAt = Date.now() + (5 * 60 * 1000); // 5 mins

        // Store code in reset_tokens table (reusing validation logic or similar table structure)
        // Actually better to have a generic otp table or reuse reset_tokens with a diff 'type' prefix?
        // Let's reuse reset_tokens but with type 'verify_email' or 'verify_sms'
        const tokenType = type === 'email' ? 'verify_email' : 'verify_sms';

        db.serialize(() => {
            db.run('DELETE FROM reset_tokens WHERE user_id = ? AND type = ?', [userId, tokenType]);
            const stmt = db.prepare('INSERT INTO reset_tokens (token, user_id, type, expires_at) VALUES (?, ?, ?, ?)');
            stmt.run(code, userId, tokenType, expiresAt, (err) => {
                if (err) return res.status(500).json({ message: "Token hatası" });

                // MOCK SEND
                const target = type === 'email' ? user.email : user.phone;
                const msg = `[MOCK ${type.toUpperCase()}] Verification Code for ${target}: ${code}`;
                console.log(msg);

                // Write to text file for user convenience
                try {
                    fs.writeFile('verification_code.txt', msg, (err) => {
                        if (err) console.error("Write token file error", err);
                    });
                } catch (e) { console.error('Write error', e); }

                res.json({ success: true, message: `${type === 'email' ? 'E-posta' : 'SMS'} doğrulama kodu gönderildi. (verification_code.txt dosyasına bakınız)` });
            });
            stmt.finalize();
        });
    });
};

export const verifyCode = (req, res) => {
    const { type, code } = req.body;
    const userId = req.user.id;
    const tokenType = type === 'email' ? 'verify_email' : 'verify_sms';

    db.get('SELECT * FROM reset_tokens WHERE token = ? AND user_id = ? AND type = ?', [code, userId, tokenType], (err, record) => {
        if (err || !record) return res.status(400).json({ success: false, message: 'Geçersiz kod.' });

        if (record.expires_at < Date.now()) {
            return res.status(400).json({ success: false, message: 'Kodun süresi dolmuş.' });
        }

        // Valid Code -> Update User Verification Status
        const updateField = type === 'email' ? 'email_verified' : 'phone_verified';

        db.serialize(() => {
            db.run(`UPDATE users SET ${updateField} = 1 WHERE id = ?`, [userId]);
            db.run('DELETE FROM reset_tokens WHERE token = ?', [code]); // Consume
        });

        res.json({ success: true, message: 'Doğrulama başarılı!' });
    });
};
