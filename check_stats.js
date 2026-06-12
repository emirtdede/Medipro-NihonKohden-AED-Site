import http from 'http';

// 1. Login to get token
const loginData = JSON.stringify({
    email: 'emir.dede@medipro.com.tr',
    password: 'emr336699x*'
});

const loginReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        const json = JSON.parse(data);
        if (json.token) checkStats(json.token);
        else console.log('Login failed');
    });
});
loginReq.write(loginData);
loginReq.end();

function checkStats(token) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/stats',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    };
    http.get(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log('Stats Response:', data);
        });
    });
}
