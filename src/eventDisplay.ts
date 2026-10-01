import type { CalendarEvent } from '../shared/events';
export function calendarDays(month: string) {
 const [year,number]=month.split('-').map(Number);
 const first=new Date(Date.UTC(year,number-1,1));
 const count=new Date(Date.UTC(year,number,0)).getUTCDate();
 return Array.from({length:Math.ceil((first.getUTCDay()+count)/7)*7},(_,index)=>new Date(Date.UTC(year,number-1,index-first.getUTCDay()+1)).toISOString().slice(0,10));
}
export const monthLabel=(month:string)=>new Intl.DateTimeFormat('en-CA',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${month}-01T12:00:00Z`));
export const eventCategory=(event:CalendarEvent)=>event.category||event.club?.category||'';
export const categoryLabel=(category:string)=>category==='food'?'Food & Drink':category==='arts'?'Art':category.charAt(0).toUpperCase()+category.slice(1);
