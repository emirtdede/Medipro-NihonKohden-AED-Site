import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

// Global Error Handlers
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// Keep-alive hack
setInterval(() => {
    // Prevent process exit
}, 10000);

// Auth Modules
import { register, login, requestPasswordReset, resetPassword, getProfile, updateProfile, sendVerification, verifyCode } from './src/authController.js';
import { trackVisitor, getAnalytics, getVisitorList } from './src/statsController.js';
import { authenticateToken, loginRateLimiter } from './src/middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Global Tracking Middleware
app.use(trackVisitor);

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
    next();
});
app.use(express.static('public')); // Serve static files from public
app.use(express.static('dist'));   // Serve built files if needed

// Data Storage
const CONTENT_FILE = path.join(__dirname, 'data', 'content.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Multer Storage for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// --- API Routes ---

// Auth Routes
app.post('/api/auth/register', register); // Seed route
app.post('/api/auth/login', loginRateLimiter, login);
app.post('/api/auth/forgot-password', requestPasswordReset);
app.post('/api/auth/reset-password', resetPassword);

// Profile Routes
app.get('/api/profile', authenticateToken, getProfile);
app.post('/api/profile/update', authenticateToken, updateProfile);
app.post('/api/profile/send-verification', authenticateToken, sendVerification);
app.post('/api/profile/verify', authenticateToken, verifyCode);

// Admin Stats
app.get('/api/admin/stats', authenticateToken, getAnalytics);
app.get('/api/admin/visitors', authenticateToken, getVisitorList);


// Get Content (Public Read)
app.get('/api/content', (req, res) => {
    if (fs.existsSync(CONTENT_FILE)) {
        const data = fs.readFileSync(CONTENT_FILE, 'utf8');
        res.json(JSON.parse(data));
    } else {
        res.json({}); // Return empty if no content file yet
    }
});

// Update Content (Protected)
app.post('/api/content', authenticateToken, (req, res) => {
    const newContent = req.body;
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(newContent, null, 2));
    res.json({ success: true, message: 'Content updated successfully' });
});

// Upload Image (Protected)
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({ success: true, filePath: `/uploads/${req.file.filename}` });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
