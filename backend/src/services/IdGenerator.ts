import redisClient from '../config/redis';

const BLOCK_SIZE = 1000;
const BLOCK_COUNTER_KEY = 'global:block_counter';

class IdGenerator {
    private currentEnd: bigint = -1n;
    private currentPtr: bigint = 0n;
    private fetchPromise: Promise<void> | null = null;

    constructor() {
        // Initialize with invalid state to force fetch on first use
        this.currentPtr = 1n; // Higher than currentEnd
    }

    private async fetchNewBlock() {
        try {
            // INCR returns the new value of the key
            const blockNum = await redisClient.incr(BLOCK_COUNTER_KEY);
            const blockBig = BigInt(blockNum);

            // Calculate range
            // Range: [(block - 1) * SIZE, block * SIZE - 1]
            const start = (blockBig - 1n) * BigInt(BLOCK_SIZE);
            const end = blockBig * BigInt(BLOCK_SIZE) - 1n;

            this.currentPtr = start;
            this.currentEnd = end;

            console.log(`[IdGenerator] Fetched new block: ${start} - ${end}`);
        } catch (err) {
            console.error('[IdGenerator] Failed to fetch block from Redis', err);
            throw err;
        }
    }

    public async nextId(): Promise<bigint> {
        // Check if we need a new block
        if (this.currentPtr > this.currentEnd) {
            // If already fetching, wait for it
            if (this.fetchPromise) {
                await this.fetchPromise;
            } else {
                // Start fetching
                this.fetchPromise = this.fetchNewBlock();
                try {
                    await this.fetchPromise;
                } finally {
                    this.fetchPromise = null;
                }
            }

            // Double check after await (though single thread usually ensures we are good, safe coding)
            if (this.currentPtr > this.currentEnd) {
                throw new Error('Failed to obtain new ID block');
            }
        }

        const id = this.currentPtr;
        this.currentPtr++;
        return id;
    }
}

export const idGenerator = new IdGenerator();
