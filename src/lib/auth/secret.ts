export function getSessionSecretKey() {
    const secretKey = process.env.ATTENDANCE_SECURE_KEY;
    if (!secretKey || secretKey.length < 32) {
        throw new Error('ATTENDANCE_SECURE_KEY must be set to a random value of at least 32 characters.');
    }

    return new TextEncoder().encode(secretKey);
}
