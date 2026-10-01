import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { EventClub, EventFields } from '../../shared/events';
export default function AddEvent() {
 const [clubs,setClubs]=useState<EventClub[]>([]);
 const [sent,setSent]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError('');
  fetch('/.netlify/functions/getEvents',{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error('Could not load clubs. Please retry.');const data=await response.json();setClubs(data.clubs);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();
 },[retry]);
 const submit=async(event:EventFields)=>{
  const response=await fetch('/.netlify/functions/submitEvent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not submit your event.');setSent(true);
 };
 return <main className="max-w-2xl px-4 md:px-8 pb-8"><Link className="underline" to="/events">Back to events</Link><h1 className="text-3xl my-4">Add an event</h1>{sent?<div role="status"><p>Thanks! Your event has been submitted for review. It will appear after approval.</p><button className="primaryBtn mt-4" onClick={()=>setSent(false)}>Submit another event</button></div>:<><p className="mb-4">Share an event with the community. Submissions are reviewed before publication.</p>{loading?<p role="status">Loading…</p>:error?<div role="alert">{error} <button className="underline" onClick={()=>setRetry(n=>n+1)}>Retry</button></div>:<EventForm clubs={clubs} onSave={submit}/>}</>}</main>;
}
