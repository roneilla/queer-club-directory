import { useEffect, useRef, useState } from 'react';
import { CalendarEvent, EventClub, EventFields, emptyEvent, eventCost, scheduleLabel } from '../../shared/events';
import EventForm from '../components/EventForm';
import { useAdmin } from './useAdmin';
const endpoint='/.netlify/functions/adminEvents';
type Source='events'|'eventSubmissions';
function EventDrawer({event,clubs,source,close,save}:{event:Partial<CalendarEvent>;clubs:EventClub[];source:Source;close:()=>void;save:(action:string,details:EventFields)=>Promise<void>}) {
 const ref=useRef<HTMLDialogElement>(null);
 const [publishing,setPublishing]=useState(false);
 const [saving,setSaving]=useState(false);
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=previous;};},[]);
 const dismiss=()=>{if(!saving&&window.confirm('Close the editor? Any unsaved changes will be discarded.'))close();};
 return <dialog ref={ref} className="admin-drawer p-6 backdrop:bg-black/50" aria-labelledby="event-editor-heading" onCancel={e=>{e.preventDefault();dismiss();}}><button disabled={saving} className="float-right underline" onClick={dismiss}>Close</button><h2 id="event-editor-heading" className="text-2xl mb-4">{event._id?'Edit event':'Add event'}</h2>{source==='eventSubmissions'&&<label className="flex gap-2 mb-4"><input type="checkbox" checked={publishing} disabled={saving||event.status==='approved'} onChange={e=>setPublishing(e.target.checked)}/>Approve and publish when saving</label>}<EventForm initial={event} clubs={clubs} label={publishing?'Approve and publish':event._id?'Save changes':'Publish event'} onSave={async details=>{setSaving(true);try{await save(publishing?'approve':event._id?'save':'create',details);}finally{setSaving(false);}}}/></dialog>;
}
export default function AdminEvents() {
 const {accessKey,logout}=useAdmin();
 const [events,setEvents]=useState<CalendarEvent[]>([]);
 const [submissions,setSubmissions]=useState<CalendarEvent[]>([]);
 const [clubs,setClubs]=useState<EventClub[]>([]);
 const [source,setSource]=useState<Source>('events');
 const [filter,setFilter]=useState('all');
 const [search,setSearch]=useState('');
 const [editing,setEditing]=useState<Partial<CalendarEvent>|null>(null);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError('');
  fetch(endpoint,{headers:{Authorization:`Bearer ${accessKey}`},cache:'no-store',signal:controller.signal}).then(async response=>{
   const data=await response.json();if(response.status===401)logout();if(!response.ok)throw new Error(data.error||'Could not load events.');
   setEvents(data.events);setSubmissions(data.submissions);setClubs(data.clubs);
  }).catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();
  // Authentication remains fixed while this page is mounted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[accessKey,retry]);
 const act=async(action:string,event:Partial<CalendarEvent>,details?:EventFields)=>{
  if(busy)return;setBusy(true);setError('');setMessage('');
  try {
   const response=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${accessKey}`,'Content-Type':'application/json'},body:JSON.stringify({source,action,id:event._id,event:details})});
   const data=await response.json();if(response.status===401)logout();if(!response.ok)throw new Error(data.error||'Event action failed.');
   setEditing(null);setMessage(action==='approve'?'Event approved and published.':action==='remove'?'Entry permanently removed.':'Event updated.');setRetry(n=>n+1);
  } finally {setBusy(false);}
 };
 const run=async(action:string,event:CalendarEvent)=>{
  if(action==='remove'&&!window.confirm(`Permanently remove “${event.title||'this entry'}”? This cannot be undone. Use Archive to hide an event without deleting it.`))return;
  if(action==='reject'&&!window.confirm('Reject this event submission?'))return;
  try{await act(action,event);}catch(e){setError((e as Error).message);}
 };
 const rows=(source==='events'?events:submissions).filter(e=>(filter==='all'||(source==='events'?(filter==='archived'?e.archived:!e.archived):e.status===filter))&&`${e.title||''} ${e.location||''}`.toLowerCase().includes(search.toLowerCase()));
 return <main className="px-4 md:px-8 pb-8"><div className="flex justify-between gap-4 mb-4"><h1 className="text-3xl">Manage events</h1>{source==='events'&&<button disabled={busy||loading} className="primaryBtn" onClick={()=>setEditing({...emptyEvent})}>Add event</button>}</div>
  <div className="flex flex-wrap gap-4 mb-4">{(['events','eventSubmissions'] as const).map(s=><button disabled={busy} key={s} aria-pressed={source===s} className={`border rounded px-3 py-1 ${source===s?'bg-gray-900 text-white':''}`} onClick={()=>{setSource(s);setFilter('all');}}>{s==='events'?'Events':'Event submissions'}</button>)}<label>Filter <select className="field" value={filter} onChange={e=>setFilter(e.target.value)}>{(source==='events'?['all','active','archived']:['all','submitted','approved','rejected']).map(s=><option key={s}>{s}</option>)}</select></label><label>Search <input className="field" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
  {error&&<p role="alert" className="text-red-700 mb-4">{error} <button className="underline" onClick={()=>setRetry(n=>n+1)}>Retry</button></p>}{message&&<p role="status" className="mb-4">{message}</p>}
  {loading?<p role="status">Loading events…</p>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{rows.map(event=><article key={event._id} className="bg-white border rounded p-4"><h2 className="text-xl">{event.title||'Untitled legacy event'}</h2><p className="text-sm my-2">{scheduleLabel(event)} · {event.time||'Time missing'} · {eventCost(event)}</p><p>{event.location}</p><p className="text-sm my-2">{source==='events'?(event.archived?'Archived':'Published'):event.status||'submitted'}</p><div className="flex flex-wrap gap-4"><button disabled={busy} className="underline" onClick={()=>setEditing({...emptyEvent,...event})}>Edit{source==='eventSubmissions'&&event.status!=='approved'?' / Approve':''}</button>{source==='events'?<button disabled={busy} className="underline" onClick={()=>run(event.archived?'restore':'archive',event)}>{event.archived?'Restore':'Archive'}</button>:event.status!=='approved'&&<button disabled={busy} className="underline" onClick={()=>run('reject',event)}>Reject</button>}<button disabled={busy} className="underline" onClick={()=>run('remove',event)}>Remove</button></div></article>)}{!rows.length&&<p>No matching {source==='events'?'events':'submissions'}.</p>}</div>}
  {editing&&<EventDrawer event={editing} source={source} clubs={clubs} close={()=>setEditing(null)} save={(action,details)=>act(action,editing,details)}/>}
 </main>;
}
