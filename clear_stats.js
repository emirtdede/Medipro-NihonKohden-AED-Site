import db from './database.js';

db.serialize(() => {
    console.log('Clearing analytics data...');
    db.run("DELETE FROM visitors_ip", (err) => {
        if (err) console.error("Error clearing visitors_ip:", err);
        else console.log("visitors_ip cleared.");
    });
    db.run("DELETE FROM visits_monthly_geo", (err) => {
        if (err) console.error("Error clearing visits_monthly_geo:", err);
        else console.log("visits_monthly_geo cleared.");
    });
    // Keep users table intact
});
