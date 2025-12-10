const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'analytics_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigrations() {
  try {
    console.log('🚀 Bắt đầu chạy migrations...');
    
    const migrationFile = path.join(__dirname, '001_create_tables.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migrations hoàn thành thành công!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi chạy migrations:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();
