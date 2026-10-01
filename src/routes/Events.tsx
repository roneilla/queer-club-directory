import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarEvent, eventOnDay, todayInToronto } from '../../shared/events';
import EventCard from '../components/EventCard';
import EventCalendar from '../components/EventCalendar';
import { calendarDays, monthLabel, categoryLabel, eventCategory } from '../eventDisplay';
const categories=['all','arts','entertainment','food','games','party','social','sports'];
const dateLabel=(date:string)=>new Intl.DateTimeFormat('en-CA',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
export default function Events() {
 const today=todayInToronto();
 const [month,setMonth]=useState(today.slice(0,7));
 const [view,setView]=useState<'month'|'list'>('month');
 const [selected,setSelected]=useState('');
 const [category,setCategory]=useState('all');
 const [events,setEvents]=useState<CalendarEvent[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError('');
  fetch('/.netlify/functions/getEvents',{signal:controller.signal,cache:'no-store'}).then(async response=>{if(!response.ok)throw new Error('Could not load events. Please retry.');const data=await response.json();setEvents(data.events);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();
 },[retry]);
 const filtered=events.filter(event=>category==='all'||eventCategory(event)===category).sort((a,b)=>a.time.localeCompare(b.time)||a.title.localeCompare(b.title));
 const days=selected?[selected]:calendarDays(month).filter(day=>day.startsWith(month));
 const groups=days.map(day=>({day,events:filtered.filter(event=>eventOnDay(event,day))})).filter(group=>group.events.length);
 const move=(offset:number)=>{const [year,number]=month.split('-').map(Number);setMonth(new Date(Date.UTC(year,number-1+offset,1)).toISOString().slice(0,7));setSelected('');};
 const select=(day:string)=>{setMonth(day.slice(0,7));setSelected(day);};
 const calendarProps={month,selected,today,events:filtered,move,select};
 return <main className="events-page">
  <div className="flex flex-wrap justify-between items-center gap-4 mb-6"><h1 className="text-4xl">Events</h1><div className="flex items-center gap-4"><div className="flex gap-1 border border-gray-300 rounded-full p-1" aria-label="Calendar view">{(['month','list'] as const).map(option=><button key={option} aria-pressed={view===option} className={`rounded-full px-4 py-1 capitalize ${view===option?'bg-black text-white':''}`} onClick={()=>setView(option)}>{option}</button>)}</div><Link className="primaryBtn" to="/events/add">Add an event</Link></div></div>
  {loading?<p role="status">Loading events…</p>:error?<div role="alert">{error} <button className="underline" onClick={()=>setRetry(n=>n+1)}>Retry</button></div>:<div className={view==='list'?'events-list-layout':''}>
   <div className="min-w-0"><div className="event-filters" aria-label="Filter events by category">{categories.map(option=><button key={option} aria-pressed={category===option} onClick={()=>setCategory(option)} className={`event-category-pill event-category-${option} ${category===option?'active-category':''}`}>{option!=='all'&&<span className="event-category-dot"/>}{option==='all'?'All':categoryLabel(option)}</button>)}</div>
    {view==='month'&&<EventCalendar {...calendarProps}/>}
    <div className="flex flex-wrap gap-4 items-center my-6"><p className="text-sm text-gray-500">Toronto local time · {monthLabel(month)}</p><button className="text-sm underline" onClick={()=>{setMonth(today.slice(0,7));setSelected('');}}>This month</button>{selected&&<button className="text-sm underline" onClick={()=>setSelected('')}>Show whole month</button>}</div>
    <section aria-label="Event list" aria-live="polite">{groups.length?groups.map(group=><section key={group.day} className="mb-8"><h2 className="text-xl mb-4">{dateLabel(group.day)}</h2><div className="flex flex-col gap-4">{group.events.map(event=><EventCard key={event._id} event={event}/>)}</div></section>):<div className="py-8"><h2 className="text-xl mb-2">{selected?dateLabel(selected):monthLabel(month)}</h2><p>No events {selected?'on this day':'this month'}{category!=='all'?' in this category':''} yet.</p></div>}</section>
   </div>
   {view==='list'&&<aside className="events-calendar-sidebar"><EventCalendar {...calendarProps} compact/></aside>}
  </div>}
 </main>;
}
