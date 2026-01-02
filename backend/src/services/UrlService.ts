import pool from '../config/db';
import redisClient from '../config/redis';
import { idGenerator } from './IdGenerator';
import { encode } from '../utils/base62';

const CACHE_TTL = 3600; // 1 hour

export class UrlService {
    async shorten(longUrl: string, customAlias?: string, expiresAt?: Date): Promise<string> {
        const id = await idGenerator.nextId();
        const shortCode = customAlias || encode(id);

        try {
            await pool.query(
                'INSERT INTO urls (id, short_code, long_url, expires_at) VALUES ($1, $2, $3, $4)',
                [id.toString(), shortCode, longUrl, expiresAt || null] // Check if node-pg supports BigInt directly or needs string
            );

            // Cache it immediately
            await redisClient.set(`url:${shortCode}`, longUrl, { EX: CACHE_TTL });

            return shortCode;
        } catch (err: any) {
            if (err.code === '23505') { // Unique violation
                if (customAlias) {
                    throw new Error('Alias already taken');
                } else {
                    // Collision on generated ID is unexpected with unique generator
                    console.error('Unexpected collision on generated ID', shortCode);
                    throw err;
                }
            }
            throw err;
        }
    }

    async getOriginalUrl(shortCode: string): Promise<string | null> {
        // 1. Check Redis
        const cached = await redisClient.get(`url:${shortCode}`);
        if (cached) return cached;

        // 2. Check DB
        const res = await pool.query(
            'SELECT long_url, expires_at FROM urls WHERE short_code = $1',
            [shortCode]
        );

        if (res.rows.length === 0) return null;

        const { long_url, expires_at } = res.rows[0];

        // Check expiration
        if (expires_at && new Date() > new Date(expires_at)) {
            return null;
        }

        // 3. Set Cache
        await redisClient.set(`url:${shortCode}`, long_url, { EX: CACHE_TTL });

        return long_url;
    }
}

export const urlService = new UrlService();
