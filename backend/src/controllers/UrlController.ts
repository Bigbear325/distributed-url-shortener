import { Request, Response } from 'express';
import { urlService } from '../services/UrlService';
import { z } from 'zod';

const shortenSchema = z.object({
    long_url: z.string().url(),
    custom_alias: z.string().regex(/^[a-zA-Z0-9_\-]+$/).max(20).optional(),
    expiration_date: z.string().datetime().optional()
});

export const createShortUrl = async (req: Request, res: Response) => {
    try {
        const { long_url, custom_alias, expiration_date } = shortenSchema.parse(req.body);
        const expiresAt = expiration_date ? new Date(expiration_date) : undefined;

        const shortUrl = await urlService.shorten(long_url, custom_alias, expiresAt);

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

        res.status(201).json({
            short_url: `${baseUrl}/${shortUrl}`,
            short_code: shortUrl
        });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: (err as z.ZodError).issues });
        }
        if (err.message === 'Alias already taken') {
            return res.status(409).json({ error: 'Alias already taken' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const redirect = async (req: Request, res: Response) => {
    const { shortCode } = req.params;
    try {
        const longUrl = await urlService.getOriginalUrl(shortCode);
        if (longUrl) {
            return res.redirect(302, longUrl);
        } else {
            return res.status(404).send('URL not found or expired');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
