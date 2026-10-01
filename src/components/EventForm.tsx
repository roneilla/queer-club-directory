import { FormEvent, useState } from 'react';
import { emptyEvent, EventFields, EventClub, validateEvent, weekdays } from '../../shared/events';
export default function EventForm({ initial, clubs, onSave, label='Submit for review' }: {initial?: Partial<EventFields>; clubs:EventClub[]; onSave:(event:EventFields)=>Promise<void>; label?:string}) {
 const [draft,setDraft]=useState({...emptyEvent,...initial});
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const update=(field:keyof EventFields,value:string|number|null)=>setDraft(d=>({...d,[field]:value}));
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();if(busy)return;setError('');
  try {
   const details=validateEvent(draft);
   setBusy(true);await onSave(details);
  } catch(err){setError((err as Error).message);}finally{setBusy(false);}
 };
 return <form onSubmit={submit} className="flex flex-col gap-4">
  <p className="text-sm">All dates and times are Toronto time (America/Toronto).</p>
  {error&&<p role="alert" className="text-red-700">{error}</p>}
  <fieldset disabled={busy} className="flex flex-col gap-4">
   <label className="fieldGroup">Event title<input className="field" required maxLength={200} value={draft.title} onChange={e=>update('title',e.target.value)} /></label>
   <label className="fieldGroup">Description<textarea className="field" required rows={5} maxLength={5000} value={draft.description} onChange={e=>update('description',e.target.value)} /></label>
   <fieldset><legend className="mb-2">Schedule</legend><div className="flex flex-wrap gap-4">
    <label className="flex items-center gap-2"><input type="radio" name="recurrence" checked={draft.recurrence!=='weekly'} onChange={()=>setDraft(d=>({...d,recurrence:'once',weekday:null,date:'',endDate:''}))}/>Specific dates</label>
    <label className="flex items-center gap-2"><input type="radio" name="recurrence" checked={draft.recurrence==='weekly'} onChange={()=>setDraft(d=>({...d,recurrence:'weekly',weekday:null,date:'',endDate:''}))}/>Repeats weekly</label>
   </div></fieldset>
   {draft.recurrence==='weekly'&&<label className="fieldGroup">Repeats every<select className="field" required value={draft.weekday??''} onChange={e=>update('weekday',e.target.value===''?null:Number(e.target.value))}><option value="">Select a weekday</option>{weekdays.map((day,index)=><option key={day} value={index}>{day}</option>)}</select></label>}
   <div className="grid sm:grid-cols-2 gap-4">
    <label className="fieldGroup">{draft.recurrence==='weekly'?'Series starts (optional)':'Start date'}<input className="field" required={draft.recurrence!=='weekly'} type="date" value={draft.date} onChange={e=>update('date',e.target.value)} /></label>
    <label className="fieldGroup">{draft.recurrence==='weekly'?'Series ends (optional)':'End date (optional)'}<input className="field" type="date" min={draft.date} value={draft.endDate} onChange={e=>update('endDate',e.target.value)} /></label>
    <label className="fieldGroup">Start time<input className="field" required type="time" value={draft.time} onChange={e=>update('time',e.target.value)} /></label>
    <label className="fieldGroup">End time (optional)<input className="field" type="time" value={draft.endTime} onChange={e=>update('endTime',e.target.value)} /></label>
   </div>
   {draft.recurrence==='weekly'&&<p className="text-sm text-gray-500">Appears every selected weekday at this Toronto local time. Leave series dates empty for no date limits. Editing or archiving changes the whole series.</p>}

   <label className="fieldGroup">Location or online meeting details<input className="field" required maxLength={500} value={draft.location} onChange={e=>update('location',e.target.value)} /></label>
   <label className="fieldGroup">Event / ticket link (optional)<input className="field" type="url" placeholder="https://" maxLength={2000} value={draft.website} onChange={e=>update('website',e.target.value)} /></label>
   <label className="fieldGroup">Club (optional)<select className="field" value={draft.clubId} onChange={e=>update('clubId',e.target.value)}><option value="">No linked club</option>{draft.clubId&&!clubs.some(c=>c._id===draft.clubId)&&<option value={draft.clubId}>Previously linked club (unavailable)</option>}{clubs.map(club=><option key={club._id} value={club._id}>{club.name}</option>)}</select></label>
   <label className="fieldGroup">Category (optional)<select className="field" value={draft.category||''} onChange={e=>update('category',e.target.value)}><option value="">Use linked club category</option>{['arts','entertainment','food','games','party','social','sports'].map(category=><option key={category} value={category}>{category==='food'?'Food & Drink':category}</option>)}</select></label>
   <fieldset><legend>Cost</legend><p className="text-sm text-gray-500 mb-3">All prices are in CAD.</p><div className="flex flex-wrap gap-4">{(['free','pwyc','other'] as const).map(type=><label key={type} className="flex gap-2 items-center"><input type="radio" name="costType" value={type} checked={draft.costType===type} onChange={()=>setDraft(d=>({...d,costType:type,price:type==='other'?d.price:null}))}/>{type==='free'?'Free':type==='pwyc'?'PWYC':'Other'}</label>)}</div>{draft.costType==='other'&&<label className="fieldGroup mt-3">Price (CAD)<input className="field" type="number" inputMode="decimal" min="0" max="100000" step="0.01" required value={draft.price??''} onChange={e=>update('price',e.target.value===''?null:Number(e.target.value))}/></label>}</fieldset>
   <label className="fieldGroup">Promo code (optional)<input className="field" maxLength={200} value={draft.promoCode} onChange={e=>update('promoCode',e.target.value)}/></label>
   <button className="primaryBtn self-start" disabled={busy}>{busy?'Saving…':label}</button>
  </fieldset>
 </form>;
}
