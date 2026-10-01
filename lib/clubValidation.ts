const categories = ['entertainment', 'sports', 'arts', 'social', 'food', 'games', 'party'];
export function validateClub(input: Record<string, unknown>, requireDescription = true) {
	const limits: Record<string, number> = { name: 200, description: 3000, instagram: 2000, website: 2000, category: 30, location: 300, schedule: 500 };
	const club: Record<string, string> = {};
	for (const [field, limit] of Object.entries(limits)) {
		const value = input[field] ?? '';
		if (typeof value !== 'string' || value.length > limit) throw new Error(`Invalid ${field}.`);
		club[field] = value.trim();
	}
	if (!club.name) throw new Error('Enter the club name.');
	if (requireDescription && !club.description) throw new Error('Enter a description before approving or submitting this club.');
	if (!categories.includes(club.category)) throw new Error('Select a category before approving or submitting this club.');
	club.instagram = club.instagram.replace(/^@/, '').trim();
	club.instagram = club.instagram.toLowerCase();
	if (!club.instagram && !club.website) throw new Error('Enter an Instagram handle or a website. You can provide both.');
	if (club.instagram && !/^[a-z0-9._]{1,30}$/.test(club.instagram)) throw new Error('Enter an Instagram handle (up to 30 characters), not a URL.');
	if (club.website) {
		try {
			const url = new URL(club.website);
			if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
		} catch { throw new Error('Website must be a valid https:// or http:// URL.'); }
	}
	return club;
}
