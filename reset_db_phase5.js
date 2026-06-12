import db from './database.js';

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS visitor_stats");
    db.run("DROP TABLE IF EXISTS visitors_ip");
    db.run("DROP TABLE IF EXISTS visits_monthly_geo");
    console.log("Tables dropped. Restart server to recreate.");
});
