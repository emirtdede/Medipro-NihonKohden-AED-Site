import http from 'http';

const UNIQUE_VISITORS = 10;
const REPEATS_PER_VISITOR = 5;

function makeRequest(ip, i) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        headers: {
            'X-Forwarded-For': ip,
            'User-Agent': `LoadTestBot/1.0 (Visitor ${ip})`
        }
    };

    const req = http.request(options, (res) => {
    });

    req.on('error', (e) => {
        console.error(`Request ${i} error: ${e.message}`);
    });

    req.end();
}

console.log(`Starting load test: ${UNIQUE_VISITORS} visitors x ${REPEATS_PER_VISITOR} visits...`);

let count = 0;
// Simulate 10 unique IPs
for (let v = 0; v < UNIQUE_VISITORS; v++) {
    // Generate an IP
    const ip = `88.254.${100 + v}.${Math.floor(Math.random() * 255)}`;

    // Each visitor makes 5 requests
    for (let r = 0; r < REPEATS_PER_VISITOR; r++) {
        setTimeout(() => {
            makeRequest(ip, count++);
        }, v * 100 + r * 50); // Stagger requests
    }
}
