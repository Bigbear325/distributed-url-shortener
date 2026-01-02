import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/tinyurl'
});

export const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS urls (
        id BIGINT PRIMARY KEY,
        short_code VARCHAR(20) UNIQUE NOT NULL,
        long_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE
      );
      CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
    `);
        console.log('[DB] Database initialized and tables checked');
    } catch (err) {
        console.error('[DB] Initialization failed', err);
        throw err;
    } finally {
        client.release();
    }
};

export default pool;
