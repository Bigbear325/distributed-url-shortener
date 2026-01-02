const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = CHARS.length;

export const encode = (num: bigint): string => {
    if (num === 0n) return CHARS[0];
    let encoded = '';
    let current = num;
    while (current > 0n) {
        const remainder = current % BigInt(BASE);
        encoded = CHARS[Number(remainder)] + encoded;
        current = current / BigInt(BASE);
    }
    return encoded;
};

export const decode = (str: string): bigint => {
    let decoded = 0n;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const index = CHARS.indexOf(char);
        if (index === -1) {
            throw new Error(`Invalid character in Base62 string: ${char}`);
        }
        decoded = decoded * BigInt(BASE) + BigInt(index);
    }
    return decoded;
};
