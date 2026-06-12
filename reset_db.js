import db from './database.js';

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS visitor_stats", (err) => {
        if (err) console.error("Error dropping table:", err);
        else console.log("Table dropped.");
    });

    // The table will be recreated by database.js on next app start, or we can force it here if we exported initDb.
    // Instead, simply restarting the server is enough as database.js runs initDb on connection.
    console.log("Cleanup done. Restart server to recreate table.");
});
