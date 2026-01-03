import express from 'express';
import cors from 'cors';
// Trigger restart for DB init
import dotenv from 'dotenv';
import { connectRedis } from './config/redis';
import { initDb } from './config/db';
import * as UrlController from './controllers/UrlController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Init services
connectRedis().then(() => {
    return initDb();
}).then(() => {
    console.log('Services initialized');
}).catch(err => {
    console.error('Failed to init services', err);
    // Don't exit process in dev watch mode usually, but for reliability we should.
    // But nodemon handles restarts.
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
app.post('/api/v1/shorten', UrlController.createShortUrl);
app.get('/:shortCode', UrlController.redirect);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
