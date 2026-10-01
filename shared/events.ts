export interface EventClub { category?: string; _id: string; name: string; description?: string; instagram?: string; website?: string; }
export interface EventFields {
 recurrence?: 'once' | 'weekly'; weekday?: number | null;
 category?: string; title: string; description: string; date: string; time: string; endDate: string; endTime: string;
 location: string; website: string; clubId: string; costType: 'free' | 'pwyc' | 'other'; price: number | null;
 promoCode: string;
}
export interface CalendarEvent extends EventFields {
 _id: string; archived?: boolean; status?: string; updatedAt?: string; club?: EventClub | null;
}
export const emptyEvent: EventFields = { recurrence:'once', weekday:null, category:'', title:'', description:'', date:'', time:'', endDate:'', endTime:'', location:'', website:'', clubId:'', costType:'free', price:null, promoCode:'' };
export function validDate(value: string) {
 return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value;
}
export function validateEvent(input: unknown): EventFields {
 if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected event details.');
 const raw = input as Record<string, unknown>;
 const result = {...emptyEvent};
 const limits = { category:30,title:200,description:5000,date:10,time:5,endDate:10,endTime:5,location:500,website:2000,clubId:24,promoCode:200 };
 for (const [key, limit] of Object.entries(limits)) {
  const value = raw[key] ?? '';
  if (typeof value !== 'string' || value.length > limit) throw new Error(`Invalid ${key}.`);
  (result as unknown as Record<string, unknown>)[key] = value.trim();
 }
 if (result.category && !['arts','entertainment','food','games','party','social','sports'].includes(result.category)) throw new Error('Select a valid category.');
 if (!result.title || !result.description || !result.location) throw new Error('Title, description and location are required.');
 if (raw.recurrence !== undefined && !['once','weekly'].includes(String(raw.recurrence))) throw new Error('Select specific dates or weekly recurrence.');
 result.recurrence = raw.recurrence === 'weekly' ? 'weekly' : 'once';
 if (result.recurrence === 'weekly') {
  if (typeof raw.weekday !== 'number' || !Number.isInteger(raw.weekday) || raw.weekday < 0 || raw.weekday > 6) throw new Error('Select a day of the week.');
  result.weekday = raw.weekday;
 }
 if ((result.recurrence !== 'weekly' && !result.date) || (result.date && !validDate(result.date)) || (result.endDate && !validDate(result.endDate))) throw new Error('Enter a valid event date.');
 const validTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
 if (!validTime(result.time) || (result.endTime && !validTime(result.endTime))) throw new Error('Enter a valid start time and optional end time.');
 if (result.date && result.endDate && result.endDate < result.date) throw new Error('End date cannot be before the start date.');
 if (result.endTime && (result.recurrence === 'weekly' || (result.endDate || result.date) === result.date) && result.endTime <= result.time) throw new Error(result.recurrence === 'weekly' ? 'Weekly events must end after their start time on the same day.' : 'End time must be after the start time. For overnight events, set the end date.');
 if (result.clubId && !/^[a-f0-9]{24}$/i.test(result.clubId)) throw new Error('Select a valid club.');
 if (result.website) {
  try { if (!['http:', 'https:'].includes(new URL(result.website).protocol)) throw new Error(); }
  catch { throw new Error('Event link must start with https:// or http://.'); }
 }
 if (!['free','pwyc','other'].includes(String(raw.costType))) throw new Error('Select Free, PWYC or Other for cost.');
 result.costType = raw.costType as EventFields['costType'];
 if (result.costType === 'other') {
  if (typeof raw.price !== 'number' || !Number.isFinite(raw.price) || raw.price < 0 || raw.price > 100000 || Math.abs(raw.price*100-Math.round(raw.price*100)) > 0.000001) throw new Error('Enter a price from 0 to 100,000 CAD, with up to two decimal places.');
  result.price = raw.price;
 }
 return result;
}
export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
type Schedule = Pick<EventFields,'date'|'endDate'|'recurrence'|'weekday'>;
export function validSchedule(event: Schedule) {
 if (event.recurrence === 'weekly') return typeof event.weekday === 'number' && Number.isInteger(event.weekday) && event.weekday >= 0 && event.weekday <= 6 && (!event.date || validDate(event.date)) && (!event.endDate || validDate(event.endDate)) && (!event.date || !event.endDate || event.date <= event.endDate);
 return validDate(event.date) && (!event.endDate || (validDate(event.endDate) && event.endDate >= event.date));
}
export function eventOnDay(event: Schedule, day: string) {
 if (!validDate(day) || !validSchedule(event)) return false;
 if (event.recurrence === 'weekly') return (!event.date || day >= event.date) && (!event.endDate || day <= event.endDate) && new Date(`${day}T12:00:00Z`).getUTCDay() === event.weekday;
 return event.date <= day && (event.endDate || event.date) >= day;
}
export const eventInMonth = (event: Schedule, month: string) => Array.from({length:31},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`).some(day=>eventOnDay(event,day));
export const scheduleLabel = (event: Schedule) => event.recurrence === 'weekly'
 ? `Every ${weekdays[event.weekday ?? -1] || 'week'}${event.date ? ` from ${event.date}` : ''}${event.endDate ? ` through ${event.endDate}` : ''}`
 : `${event.date || 'Date missing'}${event.endDate && event.endDate !== event.date ? ` – ${event.endDate}` : ''}`;
export const eventCost = (event: Pick<EventFields,'costType'|'price'>) => event.costType === 'free' ? 'Free' : event.costType === 'pwyc' ? 'PWYC' : new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(event.price || 0) + ' CAD';
export const todayInToronto = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
