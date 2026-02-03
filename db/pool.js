const {Pool}=require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables (use .env if available)
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'fastinv_class',
    password: process.env.DB_PASSWORD || 'Welcome@123',
    port: process.env.DB_PORT || 5432,
    ...(process.env.DB_SSL_CA && {
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync(process.env.DB_SSL_CA, 'utf8')
        }
    })
});

module.exports=pool;