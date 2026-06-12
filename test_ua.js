import { UAParser } from 'ua-parser-js';
try {
    const parser = new UAParser();
    console.log("Success with named import");
} catch (e) {
    console.log("Failed named import", e.message);
}

import D UAParser from 'ua-parser-js';
// Wait, I can't write invalid syntax in one file if I want to test.
// I'll test named import first.
