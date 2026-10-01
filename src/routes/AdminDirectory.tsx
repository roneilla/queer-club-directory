import { FormEvent, useEffect, useRef, useState } from 'react';
import DirectoryCard from '../components/DirectoryCard';
import { useAdmin } from './useAdmin';
interface Club {
 _id: string; archived?: boolean; updatedAt?: string; dateAdded?: string; name: string; description: string; instagram: string; website: string;
 category: string; location: string; schedule: string; subcategories: {name: string}[];
}
const fields = ['name', 'description', 'instagram', 'website', 'category', 'location', 'schedule'] as const;
const limits = {name:200,description:3000,instagram:31,website:2000,category:30,location:300,schedule:500};
const formatDateAdded = (value?: string) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'Not recorded';
const endpoint = '/.netlify/functions/adminClubs';
function EditDrawer({ club, close, saved }: {club: Club; close: () => void; saved: (club: Club) => void}) {
 const { accessKey, logout } = useAdmin();
 const [draft, setDraft] = useState(club);
 const [tags, setTags] = useState(club.subcategories.map(t => t.name).join(', '));
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const dialog = useRef<HTMLDialogElement>(null);
 useEffect(() => {
  const element = dialog.current!;
  element.showModal();
  const previous = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  return () => { element.close(); document.body.style.overflow = previous; };
 }, []);
 const dismiss = () => {
  if (busy) return;
  const dirty = fields.some(f => draft[f] !== club[f]) || tags !== club.subcategories.map(t => t.name).join(', ');
  if (!dirty || window.confirm('Discard unsaved edits?')) close();
 };
 const submit = async (event: FormEvent) => {
  event.preventDefault(); if (busy) return;
  if (!draft.instagram.trim().replace(/^@/, '').trim() && !draft.website.trim()) { setError('Enter an Instagram handle or a website. You can provide both.'); return; }
  setBusy(true); setError('');
  try {
   const response = await fetch(endpoint, { method:'POST', headers: {Authorization:`Bearer ${accessKey}`, 'Content-Type':'application/json'}, body:JSON.stringify({id:club._id, club:{...Object.fromEntries(fields.map(field => [field, draft[field]])),subcategories:tags.split(',').map(s=>s.trim()).filter(Boolean).map(name=>({name}))}}) });
   const data = await response.json();
   if (response.status === 401) logout();
   if (!response.ok) throw new Error(data.error || 'Could not save changes.');
   saved({...club, ...data.club});
  } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
 };
 return <dialog ref={dialog} aria-labelledby="edit-club-heading" onCancel={e => {e.preventDefault();dismiss();}} className="admin-drawer p-6 backdrop:bg-black/50">
  <button type="button" className="float-right underline" onClick={dismiss} disabled={busy} aria-label="Close editor">Close</button>
  <h2 id="edit-club-heading" className="text-2xl mb-4">Edit {club.name}</h2>
  <p className="text-sm mb-4">Date added: {formatDateAdded(club.dateAdded)}</p>
  {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
  <form onSubmit={submit} className="flex flex-col gap-4">
   <p className="text-sm">Instagram or website is required. You can provide both.</p>
   {fields.map(field => <div className="fieldGroup" key={field}><label className="capitalize" htmlFor={`edit-${field}`}>{field}</label>{field === 'category' ? <select id={`edit-${field}`} className="field" required disabled={busy} value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}><option value="">Select category</option>{['arts','entertainment','food','games','party','social','sports'].map(c=><option key={c}>{c}</option>)}</select> : field === 'description' ? <textarea id={`edit-${field}`} className="field" rows={5} disabled={busy} maxLength={limits[field]} value={draft[field]} onChange={e=>setDraft({...draft,[field]:e.target.value})} /> : <input id={`edit-${field}`} className="field" type={field==='website'?'url':'text'} required={field==='name'} disabled={busy} maxLength={limits[field]} value={draft[field]} onChange={e=>setDraft({...draft,[field]:e.target.value})} />}</div>)}
   <div className="fieldGroup"><label htmlFor="edit-tags">Tags (comma separated)</label><input id="edit-tags" className="field" disabled={busy} value={tags} onChange={e=>setTags(e.target.value)} /></div>
   <p className="text-sm">{club.archived ? 'Saving keeps this club archived and hidden from the public directory.' : 'Saving updates the public directory immediately.'}</p>
   <div className="flex gap-4"><button className="primaryBtn" disabled={busy}>{busy?'Saving…':'Save'}</button><button type="button" disabled={busy} onClick={dismiss}>Cancel</button></div>
  </form>
 </dialog>;
}
export default function AdminDirectory() {
 const {accessKey, logout} = useAdmin();
 const [clubs,setClubs] = useState<Club[]>([]);
 const [editing,setEditing] = useState<Club|null>(null);
 const [loading,setLoading] = useState(true);
 const [error,setError] = useState('');
 const [message,setMessage] = useState('');
 const [reload,setReload] = useState(0);
 const [archiving,setArchiving] = useState('');
 const archive = async (club: Club) => {
  if (archiving) return;
  setArchiving(club._id); setError(''); setMessage('');
  try {
   const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${accessKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({id:club._id,action:club.archived?'restore':'archive'}) });
   const data = await response.json();
   if (response.status === 401) logout();
   if (!response.ok) throw new Error(data.error || 'Could not update archive status.');
   setClubs(rows => rows.map(row => row._id === club._id ? {...row,...data.club} : row));
   setMessage(`${club.name} ${club.archived ? 'restored to the public directory' : 'archived and hidden from the public directory'}.`);
  } catch(e) { setError((e as Error).message); } finally { setArchiving(''); }
 };
 const latestUpdate = clubs.map(club => club.updatedAt || club.dateAdded).filter((value): value is string => Boolean(value) && !Number.isNaN(Date.parse(value!))).sort((a,b) => Date.parse(b)-Date.parse(a))[0];
 useEffect(() => {
  const controller = new AbortController();
  setLoading(true);setError('');
  fetch(endpoint,{headers:{Authorization:`Bearer ${accessKey}`},cache:'no-store',signal:controller.signal}).then(async response=>{
   const data=await response.json();
   if(response.status===401)logout();
   if(!response.ok)throw new Error(data.error||'Could not load clubs.');
   setClubs(data.clubs.map((club:Club)=>({...club,...Object.fromEntries(fields.map(f=>[f,club[f]||''])),subcategories:club.subcategories||[]})));
  }).catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
  // The shared login lasts until sign out; avoid refetching on parent renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[accessKey,reload]);
 return <main className="pb-8"><h1 className="text-3xl px-8 mb-4">Directory · All</h1>{!loading && <p className="px-8 mb-4 text-sm">Last directory update: {latestUpdate ? new Date(latestUpdate).toLocaleString() : 'Not recorded yet'}</p>}{message&&<p role="status" className="px-8 mb-4">{message}</p>}{error&&<div role="alert" className="px-8"><p>{error}</p><button className="underline" onClick={()=>setReload(n=>n+1)}>Retry</button></div>}{loading?<p role="status" className="px-8">Loading directory…</p>:!error&&<><p className="px-8">{clubs.length} clubs</p><div className="flex flex-wrap px-4">{[...clubs].sort((a,b)=>a.name.localeCompare(b.name)).map(club=><DirectoryCard key={club._id} {...club} adminDateAdded={formatDateAdded(club.dateAdded)} actionBusy={Boolean(archiving)} onArchive={()=>archive(club)} onEdit={()=>{setEditing(club);setMessage('');}} />)}</div></>}{editing&&<EditDrawer club={editing} close={()=>setEditing(null)} saved={club=>{setClubs(rows=>rows.map(row=>row._id===club._id?club:row));setEditing(null);setMessage(`${club.name} saved.`);}} />}</main>;
}
