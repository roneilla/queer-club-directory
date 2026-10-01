import { createHash, timingSafeEqual } from 'node:crypto';
export function adminAuth(headers: Record<string, string | undefined>) {
		const key = process.env.ADMIN_ACCESS_KEY;
		// Fail closed until a sufficiently long, server-only key is configured.
		if (!key || key.length < 43) return { statusCode: 503, error: 'Admin access is not configured.' };
		const authorization = headers.authorization || headers.Authorization || '';
		const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
		const hash = (value: string) => createHash('sha256').update(value).digest();
		if (!supplied || !timingSafeEqual(hash(supplied), hash(key))) {
			return { statusCode: 401, error: 'Invalid admin access key.' };
		}

 return null;
}
