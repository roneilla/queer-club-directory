import { useEffect, useState } from 'react';
import { useAdmin } from './useAdmin';

interface Submission {
 _id: string; collection: string; status: string; dateSubmitted: string; existingClub: string | null; sharedInstagramClub?: string | null;
 name: string; description: string; instagram: string; website: string; category: string; location: string; schedule: string;
}
const fields = ['name', 'description', 'instagram', 'website', 'category', 'location', 'schedule'] as const;
const endpoint = '/.netlify/functions/adminSubmissions';
const categories = ['arts', 'entertainment', 'food', 'games', 'party', 'social', 'sports'];

function Editor({ row, busy, error, onAction }: { row: Submission; busy: boolean; error: string; onAction: (action: string, club: Submission) => Promise<void> }) {
 const [draft, setDraft] = useState(row);
 const [confirm, setConfirm] = useState('');
 const dirty = fields.some(field => draft[field] !== row[field]);
 return <section className="border rounded p-4 bg-white">
  <h2 className="text-xl">{row.name || 'Unnamed submission'}</h2>
  <p className="text-sm my-2">{row.status} · {row.dateSubmitted || 'Date unavailable'}</p>
  {row.existingClub && <p className="mb-4">Already in the directory as {row.existingClub}. Approving publishes your edits to that listing.</p>}
  {row.sharedInstagramClub && <p className="mb-4">Shares an Instagram handle with {row.sharedInstagramClub}. This may be a separate program; review before approving. The database may reject a duplicate handle.</p>}
  <div className="flex flex-col gap-4">
   <p className="text-sm">Approval requires an Instagram handle or website. You can provide both.</p>
   {fields.map(field => <div className="fieldGroup" key={field}>
    <label htmlFor={`${row._id}-${field}`} className="capitalize">{field}</label>
    {field === 'category' ? <select className="field" id={`${row._id}-${field}`} disabled={busy} value={draft[field]} onChange={e => { setDraft({ ...draft, [field]: e.target.value }); setConfirm(''); }}><option value="">Select category</option>{categories.map(c => <option key={c}>{c}</option>)}</select> : field === 'description' ? <textarea className="field" id={`${row._id}-${field}`} rows={5} maxLength={3000} disabled={busy} value={draft[field]} onChange={e => { setDraft({ ...draft, [field]: e.target.value }); setConfirm(''); }} /> : <input className="field" id={`${row._id}-${field}`} disabled={busy} value={draft[field]} onChange={e => { setDraft({ ...draft, [field]: e.target.value }); setConfirm(''); }} />}
   </div>)}
   <p className="text-sm">Save edits keeps changes in the submission only. Approve publishes them. Reject keeps the submission and does not delete an existing club.</p>
   {error && <p role="alert" className="text-red-700">{error}</p>}
   <div className="flex flex-wrap gap-4">
    <button disabled={busy || !dirty} className="primaryBtn" onClick={() => onAction('save', draft)}>Save edits</button>
    <button disabled={busy} className="primaryBtn" onClick={() => setConfirm('approve')}>Approve</button>
    <button disabled={busy} className="underline" onClick={() => setConfirm('reject')}>Reject</button>
   </div>
   {confirm && <div className="border rounded p-3" role="alert">
    <p>{confirm === 'approve' ? 'Publish these edited details to the public directory?' : `Reject this submission?${dirty ? ' Unsaved edits will be discarded.' : ''}`}</p>
    <div className="flex gap-4 mt-2"><button disabled={busy} className="primaryBtn" onClick={async () => { await onAction(confirm, draft); setConfirm(''); }}>{busy ? 'Saving…' : `Confirm ${confirm}`}</button><button disabled={busy} onClick={() => setConfirm('')}>Cancel</button></div>
   </div>}
  </div>
 </section>;
}

export default function AdminSubmissions() {
 const { accessKey, logout } = useAdmin();
 const [rows, setRows] = useState<Submission[]>([]);
 const [selected, setSelected] = useState('');
 const [filter, setFilter] = useState('all');
 const [search, setSearch] = useState('');
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const [message, setMessage] = useState('');
 const [revision, setRevision] = useState(0);

 const load = async (key: string) => {
  const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${key}` }, cache: 'no-store' });
  const data = await response.json();
  if (response.status === 401) logout();
  if (!response.ok) throw new Error(data.error || 'Could not load submissions.');
  setRows(data.submissions); setRevision(r => r + 1);
 };
 useEffect(() => {
  let active = true;
  setBusy(true);
  load(accessKey).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setBusy(false); });
  return () => { active = false; };
  // Access key is fixed for the lifetime of this authenticated page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [accessKey]);
 const act = async (action: string, row: Submission) => {
  if (busy) return;
  if (action === 'approve' && !row.instagram.trim().replace(/^@/, '').trim() && !row.website.trim()) { setError('Enter an Instagram handle or a website. You can provide both.'); return; }
  setBusy(true); setError(''); setMessage('');
  try {
   const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${accessKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id: row._id, collection: row.collection, club: Object.fromEntries(fields.map(f => [f, row[f]])) }) });
   const data = await response.json();
   if (response.status === 401) logout();
   if (!response.ok) throw new Error(data.error || 'Review failed.');
   setMessage(action === 'approve' ? 'Approved and published to the directory.' : action === 'reject' ? 'Submission rejected. Existing directory entries were not removed.' : 'Submission edits saved.');
   await load(accessKey);
  } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
 };
 const visible = rows.filter(r => (filter === 'all' || r.status === filter) && `${r.name} ${r.instagram}`.toLowerCase().includes(search.toLowerCase()));
 const current = visible.find(r => `${r.collection}/${r._id}` === selected);
 return <main className="px-4 md:px-8 pb-8">
  <h1 className="text-3xl mb-4">Review submissions</h1>
  {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
  {message && <p role="status" className="mb-4">{message}</p>}
  <>
   <div className="flex flex-wrap gap-4 mb-4"><label>Filter <select className="field" disabled={busy} value={filter} onChange={e => setFilter(e.target.value)}>{['all', 'submitted', 'approved', 'rejected', 'duplicate'].map(s => <option key={s} value={s}>{s === 'all' ? 'Show all' : s === 'submitted' ? 'Awaiting decision' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></label><label>Search <input className="field" disabled={busy} value={search} onChange={e => setSearch(e.target.value)} /></label></div>
   <p className="mb-4">{visible.length} of {rows.length} submissions. Show all includes decided and already-listed submissions. Select an entry to edit and review.</p>
   <div className="grid md:grid-cols-2 gap-6 items-start"><div className="flex flex-col gap-2 md:max-h-[75vh] overflow-auto">{visible.map(row => <button disabled={busy} key={`${row.collection}/${row._id}`} className={`text-left border rounded p-3 ${current === row ? 'bg-gray-200' : 'bg-white'}`} onClick={() => setSelected(`${row.collection}/${row._id}`)}><span className="block font-medium">{row.name || 'Unnamed submission'}</span><span className="text-sm">{row.status} · {row.dateSubmitted}{row.existingClub ? ' · Already listed' : row.sharedInstagramClub ? ' · Shared Instagram' : ''}</span></button>)}{!visible.length && <p>No matching submissions.</p>}</div>{current ? <Editor key={`${selected}/${revision}`} row={current} busy={busy} error={error} onAction={act} /> : <p>Select a submission to review its details.</p>}</div>
  </>
 </main>;
}
