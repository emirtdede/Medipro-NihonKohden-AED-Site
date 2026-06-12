import http from 'http';

// 1. Login
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
        console.log('Login:', json.success ? 'Success' : 'Fail');
        if (json.token) updateProfile(json.token);
    });
});
loginReq.write(loginData);
loginReq.end();

function updateProfile(token) {
    const updateData = JSON.stringify({
        email: 'emir.dede@medipro.com.tr', // Same email
        phone: '+905555555555'
    });

    const updateReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/profile/update',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(updateData),
            'Authorization': `Bearer ${token}`
        }
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log('Update Status:', res.statusCode);
            console.log('Update Body:', data);
        });
    });
    updateReq.write(updateData);
    updateReq.end();
}
