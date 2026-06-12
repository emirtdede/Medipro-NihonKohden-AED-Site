import http from 'http';

const postData = JSON.stringify({
    email: 'emir.dede@medipro.com.tr',
    password: 'emr336699x*'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Body:', data);
    });
});

req.on('error', (e) => {
    console.error(`Problem: ${e.message}`);
});

req.write(postData);
req.end();
