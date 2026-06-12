import http from 'http';

function makeRequest(ip, ua, label) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        headers: {
            'X-Forwarded-For': ip,
            'User-Agent': ua
        }
    };

    const req = http.request(options, (res) => {
        // console.log(`${label}: ${res.statusCode}`);
    });

    req.on('error', (e) => {
        console.error(`${label} Error: ${e.message}`);
    });

    req.end();
}

console.log(`Starting mixed traffic test...`);

// 1. Legitimate User (Should be tracked)
makeRequest('88.254.200.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Human User');

// 2. Bot (Should be ignored)
makeRequest('66.249.66.1', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Googlebot');

console.log("Requests sent. Check logs/admin panel.");
