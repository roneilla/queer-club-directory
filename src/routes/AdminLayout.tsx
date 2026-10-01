import { adminPath } from '../adminRouting';
import { FormEvent, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
export default function AdminLayout() {
 const [accessKey, setAccessKey] = useState('');
 const [input, setInput] = useState('');
 const [error, setError] = useState('');
 const [busy, setBusy] = useState(false);
 const logout = () => { setAccessKey(''); setInput(''); };
 const login = async (event: FormEvent) => {
  event.preventDefault(); setBusy(true); setError('');
  try {
   const response = await fetch('/.netlify/functions/adminAddClub', { headers: { Authorization: `Bearer ${input}` }, cache: 'no-store' });
   const data = await response.json();
   if (!response.ok) throw new Error(data.error || 'Sign in failed.');
   setAccessKey(input); setInput('');
  } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
 };
 if (!accessKey) return <main className="px-8 pb-8"><h1 className="text-3xl mb-4">Admin sign in</h1>{error && <p role="alert">{error}</p>}<form onSubmit={login} className="max-w-md flex flex-col gap-4"><label htmlFor="admin-key">Admin access key</label><input id="admin-key" className="field" type="password" autoComplete="current-password" required value={input} onChange={e => setInput(e.target.value)} /><button disabled={busy} className="primaryBtn">{busy ? 'Signing in…' : 'Sign in'}</button></form></main>;
 return <><nav aria-label="Admin navigation" className="px-8 mb-6 flex flex-wrap gap-6 items-center">{['submissions', 'directory', 'events'].map(page => <NavLink key={page} to={adminPath(page)} className={({isActive}) => `capitalize ${isActive ? 'font-bold underline' : ''}`}>{page}</NavLink>)}<button className="underline ml-auto" onClick={logout}>Sign out</button></nav><Outlet context={{accessKey, logout}} /></>;
}
