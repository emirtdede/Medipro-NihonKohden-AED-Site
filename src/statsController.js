import db from '../database.js';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

// --- Configuration ---
const QUEUE_FLUSH_INTERVAL = 5000;
const BATCH_SIZE = 100;
const HMAC_SECRET = process.env.HMAC_SECRET || 'medipro_secure_salt_2026';

const UNKNOWN_COUNTRY = 'UNKNOWN_COUNTRY';
const UNKNOWN_CITY = 'UNKNOWN_CITY';
const UNKNOWN_REGION = 'UNKNOWN_REGION';

// --- Helper: Trusted IP Extraction ---
const getSafeIp = (req) => {
    const cfIp = req.headers['cf-connecting-ip'];
    if (cfIp) return cfIp;

    const xff = req.headers['x-forwarded-for'];
    if (xff) {
        const ips = xff.split(',').map(ip => ip.trim());
        if (ips.length > 0) return ips[0];
    }

    return req.socket.remoteAddress || req.ip || '0.0.0.0';
};

// --- Async Queue Implementation ---
class VisitorQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        setInterval(() => this.process(), QUEUE_FLUSH_INTERVAL);
    }

    add(data) {
        this.queue.push(data);
    }

    async process() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        try {
            const batch = this.queue.splice(0, BATCH_SIZE);
            if (batch.length === 0) return;

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // Statements for UPSERT
                const stmtVisitor = db.prepare(`
                    INSERT INTO visitors_ip (ip_hash, first_seen, last_seen, visit_count, country, city, region, browser, os, device, user_agent)
                    VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(ip_hash) DO UPDATE SET
                        last_seen = excluded.last_seen,
                        visit_count = visit_count + 1
                `);

                const stmtGeo = db.prepare(`
                    INSERT INTO visits_monthly_geo (year, month, country, city, count)
                    VALUES (?, ?, ?, ?, 1)
                    ON CONFLICT(year, month, country, city) DO UPDATE SET
                        count = count + 1
                `);

                batch.forEach(item => {
                    try {
                        // 1. Hash & Enrichment
                        const ipHash = crypto.createHmac('sha256', HMAC_SECRET)
                            .update(item.clientIp)
                            .digest('hex');

                        const geo = geoip.lookup(item.clientIp);
                        const country = geo ? geo.country : UNKNOWN_COUNTRY;
                        const city = geo ? geo.city : UNKNOWN_CITY;
                        const region = geo ? geo.region : UNKNOWN_REGION;

                        const ua = new UAParser(item.userAgent);
                        const browser = `${ua.getBrowser().name || ''} ${ua.getBrowser().version || ''}`.trim();
                        const os = `${ua.getOS().name || ''} ${ua.getOS().version || ''}`.trim();
                        const device = ua.getDevice().type || 'desktop';

                        // Date parsing for Monthly Aggregation
                        const date = new Date(item.timestamp);
                        const year = date.getUTCFullYear();
                        const month = date.getUTCMonth() + 1; // 1-12

                        // 2. UPSERT visitor_ip
                        // Note: We use item.timestamp for first_seen/last_seen defaults in SQL logic or pass explicitly.
                        // Ideally first_seen is set on insert. last_seen updated on conflict.
                        stmtVisitor.run(ipHash, item.timestamp, item.timestamp, country, city, region, browser, os, device, item.userAgent);

                        // 3. UPSERT visits_monthly_geo
                        stmtGeo.run(year, month, country, city);

                    } catch (err) {
                        console.error("Error processing item:", err);
                    }
                });

                stmtVisitor.finalize();
                stmtGeo.finalize();

                db.run("COMMIT", (err) => {
                    if (err) console.error("Commit failed:", err);
                    else console.log(`Worker processed batch of ${batch.length}`);
                });
            });

        } catch (error) {
            console.error("Worker process error:", error);
        } finally {
            this.isProcessing = false;
            if (this.queue.length > BATCH_SIZE) {
                setImmediate(() => this.process());
            }
        }
    }
}

const queue = new VisitorQueue();

// --- Middleware ---
export const trackVisitor = (req, res, next) => {
    // 1. Static File Filter
    const ext = req.url.split('.').pop();
    const staticExts = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'map', 'json', 'woff', 'woff2', 'ttf'];
    if (req.url.includes('.') && staticExts.includes(ext)) return next();

    // 2. Path Filter
    if (req.url.startsWith('/admin') || req.url.startsWith('/api') || req.url.startsWith('/@') || req.url.includes('node_modules')) return next();

    // 3. Bot Filter (Phase 09)
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const bots = ['bot', 'crawler', 'spider', 'googlebot', 'bingbot', 'yandex', 'slurp', 'baidu', 'curl', 'wget', 'python-requests'];
    if (bots.some(bot => ua.includes(bot))) {
        // console.log('Bot detected, skipping stats:', ua);
        return next();
    }

    const visitData = {
        clientIp: getSafeIp(req),
        method: req.method,
        userAgent: req.headers['user-agent'] || '',
        timestamp: new Date().toISOString()
    };

    queue.add(visitData);
    next();
};

// --- Analytics API (KPIs & Top Cities) ---
export const getAnalytics = (req, res) => {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month) : (now.getMonth() + 1);
    const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

    const dbResponse = {};

    db.serialize(() => {
        // 1. KPI: Total Visits
        db.get(
            `SELECT SUM(count) as total_visits FROM visits_monthly_geo WHERE year = ? AND month = ?`,
            [year, month],
            (err, row) => {
                if (err) console.error("KPI Total Error:", err);
                dbResponse.kpi = dbResponse.kpi || {};
                dbResponse.kpi.total_visits = row ? row.total_visits : 0;
            }
        );

        // 2. KPI: Unique Visitors & Top Cities
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

        db.get(
            `SELECT COUNT(*) as unique_visitors FROM visitors_ip WHERE last_seen BETWEEN ? AND ?`,
            [startDate, endDate],
            (err, row) => {
                if (err) console.error("KPI Unique Error:", err);
                dbResponse.kpi = dbResponse.kpi || {};
                dbResponse.kpi.unique_visitors = row ? row.unique_visitors : 0;
            }
        );

        db.all(
            `SELECT city, country, SUM(count) as count 
             FROM visits_monthly_geo 
             WHERE year = ? AND month = ? 
             GROUP BY city, country 
             ORDER BY count DESC 
             LIMIT 10`,
            [year, month],
            (err, rows) => {
                if (err) console.error("Cities Error:", err);
                dbResponse.top_cities = rows || [];
                res.json(dbResponse);
            }
        );
    });
};

// --- Visitor List API (Pagination & Search) ---
export const getVisitorList = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month) : (now.getMonth() + 1);
    const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

    let query = `SELECT * FROM visitors_ip WHERE last_seen BETWEEN ? AND ?`;
    let params = [startDate, endDate];

    if (search) {
        query += ` AND (ip_hash LIKE ? OR country LIKE ? OR city LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get Total Count for Pagination
    let countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');

    db.serialize(() => {
        db.get(countQuery, params, (err, row) => {
            if (err) {
                console.error("Count Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            const total = row ? row.total : 0;

            query += ` ORDER BY last_seen DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error("List Error:", err);
                    return res.status(500).json({ error: "Database error" });
                }
                res.json({
                    data: rows,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                });
            });
        });
    });
};

// --- Phase 10: Data Retention Job ---
const runRetentionJob = () => {
    console.log('[Retention] Starting daily cleanup...');
    db.serialize(() => {
        // 1. Delete visitors inactive for > 90 days
        db.run(
            `DELETE FROM visitors_ip WHERE last_seen < datetime('now', '-90 days')`,
            (err) => {
                if (err) console.error("[Retention] Error cleaning visitors:", err);
                else console.log("[Retention] Inactive visitors cleaned.");
            }
        );

        // 2. Delete monthly stats > 24 months old
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 24);
        const cutoffYear = cutoffDate.getFullYear();
        const cutoffMonth = cutoffDate.getMonth() + 1;

        db.run(
            `DELETE FROM visits_monthly_geo WHERE year < ? OR (year = ? AND month < ?)`,
            [cutoffYear, cutoffYear, cutoffMonth],
            (err) => {
                if (err) console.error("[Retention] Error cleaning stats:", err);
                else console.log("[Retention] Old monthly stats cleaned.");
            }
        );
    });
};

// Run on startup
runRetentionJob();
// Run every 24 hours
setInterval(runRetentionJob, 86400000);
