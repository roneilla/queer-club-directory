import { FormEvent, useState } from 'react';

const emptyClub = { name: '', description: '', instagram: '', website: '', category: '', location: '', schedule: '' };


const AddAClub = ({ admin = false }: { admin?: boolean }) => {
	const endpoint = admin ? '/.netlify/functions/adminAddClub' : '/.netlify/functions/addAClub';
	const [keyInput, setKeyInput] = useState('');
	const [accessKey, setAccessKey] = useState('');
	const [club, setClub] = useState(emptyClub);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [sent, setSent] = useState(false);

	const login = async (event: FormEvent) => {
		event.preventDefault();
		setBusy(true); setError('');
		try {
			const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${keyInput}` }, cache: 'no-store' });
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Sign in failed.');
			setAccessKey(keyInput); setKeyInput('');
		} catch (err) { setError(err instanceof Error ? err.message : 'Could not sign in.'); }
		finally { setBusy(false); }
	};

	const save = async (event: FormEvent) => {
		event.preventDefault();
		if (busy) return;
		if (!club.instagram.trim().replace(/^@/, '').trim() && !club.website.trim()) { setError('Enter an Instagram handle or a website. You can provide both.'); return; }
		setBusy(true); setError(''); setSent(false);
		try {
			const response = await fetch(endpoint, {
				method: 'POST', headers: { 'Content-Type': 'application/json', ...(admin ? { Authorization: `Bearer ${accessKey}` } : {}) },
				body: JSON.stringify(club),
			});
			const data = await response.json();
			if (response.status === 401) setAccessKey('');
			if (!response.ok) throw new Error(data.error || 'Could not save the club.');
			setSent(true); setClub(emptyClub);
		} catch (err) { setError(err instanceof Error ? err.message : 'Could not save the club.'); }
		finally { setBusy(false); }
	};

	return (
		<div className="p-8 w-full">
			<div className="flex justify-center flex-col max-w-2xl mx-auto">
				<h1 className="text-4xl pb-4 font-semibold">{!admin || accessKey ? 'Add a club' : 'Admin sign in'}</h1>
				{error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
				{admin && !accessKey ? (
					<form onSubmit={login} className="flex flex-col gap-4">
						<label htmlFor="admin-key">Admin access key</label>
						<input id="admin-key" className="field" type="password" autoComplete="current-password" required value={keyInput} onChange={(event) => setKeyInput(event.target.value)} />
						<button className="primaryBtn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
					</form>
				) : (
					<>
						{admin && <button className="mb-4 underline" disabled={busy} onClick={() => { setAccessKey(''); setClub(emptyClub); setError(''); setSent(false); }}>Sign out</button>}
						<p className="mb-4">
							{admin ? 'New entries appear immediately in the public directory.' : 'We\'ll review your submission within a few days.'}</p>
						{sent &&
							<p role="status" className="mb-4">{admin ? 'Club added to the directory. You can add another below.' : 'Thank you! Your submission has been sent for review.'}</p>}

						<form onSubmit={save} className="flex flex-col gap-4">
							<div className="fieldGroup">
								<label htmlFor="name">Name (required)</label>
								<input className="field" id="name" name="name" type="text" maxLength={200} required value={club.name} onChange={(event) => setClub({ ...club, name: event.target.value })} disabled={busy} />
							</div>
							<div className="fieldGroup">
								<label htmlFor="description">Description (required)</label>
								<textarea className="field" id="description" name="description" rows={5} maxLength={3000} required value={club.description} onChange={(event) => setClub({ ...club, description: event.target.value })} disabled={busy} />
							</div>
							<div className="fieldGroup">
								<label htmlFor="category">Category (required)</label>
								<select id="category" className="field" required value={club.category} disabled={busy} onChange={(event) => setClub({ ...club, category: event.target.value })}>
									<option value="">Select a category</option>
									{['arts', 'entertainment', 'food', 'games', 'party', 'social', 'sports'].map((category) => <option key={category} value={category}>{category}</option>)}
								</select>
							</div>
							<div className="fieldGroup">
								<label htmlFor="location">Location</label>
								<input className="field" id="location" name="location" type="text" maxLength={300} value={club.location} onChange={(event) => setClub({ ...club, location: event.target.value })} disabled={busy} />
							</div>
							<div className="fieldGroup">
								<label htmlFor="schedule">When does your club meet?</label>
								<input className="field" id="schedule" name="schedule" type="text" maxLength={500} value={club.schedule} onChange={(event) => setClub({ ...club, schedule: event.target.value })} disabled={busy} />
							</div>
							<fieldset className="flex flex-col gap-4">
								<legend className="text-lg mb-2 font-semibold">Where can you be reached?</legend>
								<p id="club-contact-help" className="text-sm">Either Instagram or a website is required (you can also provide both).</p>
								<div className="fieldGroup">
									<label htmlFor="instagram">Instagram handle</label>
									<input className="field" id="instagram" name="instagram" type="text" maxLength={31} placeholder="e.g. insideoutfestival" aria-describedby="club-contact-help" value={club.instagram} onChange={(event) => setClub({ ...club, instagram: event.target.value })} disabled={busy} />
								</div>
								<div className="fieldGroup">
									<label htmlFor="website">Website</label>
									<input className="field" id="website" name="website" type="url" maxLength={2000} aria-describedby="club-contact-help" value={club.website} onChange={(event) => setClub({ ...club, website: event.target.value })} disabled={busy} />
								</div>
							</fieldset>
							<button className="primaryBtn mt-8" disabled={busy}>{busy ? 'Submitting...' : admin ? 'Add to directory' : 'Submit for review'}</button>
						</form>
					</>
				)}
			</div>
		</div>
	);
};
export default AddAClub;
