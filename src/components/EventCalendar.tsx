import { CalendarEvent, eventOnDay } from '../../shared/events';
import { calendarDays, monthLabel } from '../eventDisplay';
export default function EventCalendar({ month, selected, today, events, compact = false, move, select }: { month: string; selected: string; today: string; events: CalendarEvent[]; compact?: boolean; move: (offset: number) => void; select: (day: string) => void }) {
    return <section className={`event-calendar ${compact ? 'event-calendar-mini' : ''}`} aria-label={compact ? 'Choose an event date' : 'Month calendar'}>
        <div className="event-calendar-heading"><h2>{monthLabel(month)}</h2><div className="flex gap-2"><button className="calendar-arrow" aria-label="Previous month" onClick={() => move(-1)}>‹</button><button className="calendar-arrow" aria-label="Next month" onClick={() => move(1)}>›</button></div></div>
        <div className="event-calendar-weekdays" aria-hidden="true">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={index}>{day}</span>)}</div>
        <div className="event-calendar-days">{calendarDays(month).map(day => {
            const current = day.startsWith(month); const entries = events.filter(event => eventOnDay(event, day));
            return <button key={day} className={`event-calendar-day ${!current ? 'outside-month' : ''} ${selected === day ? 'selected-day' : ''}`} aria-label={`${day}, ${entries.length} events`} aria-pressed={selected === day} aria-current={day === today ? 'date' : undefined} onClick={() => select(day)}><span className={`calendar-day-number ${day === today ? 'calendar-today' : ''}`}>{Number(day.slice(-2))}</span>{compact ? entries.length > 0 && <span className="calendar-event-dot" /> : entries.length > 0 && <div className="calendar-day-events"><span className="sm:hidden">{entries.length} events</span><div className="hidden sm:block">{entries.slice(0, 2).map(event => <p key={event._id} className="truncate">{event.time} {event.title}</p>)}{entries.length > 2 && <p>+{entries.length - 2} more</p>}</div></div>}</button>;
        })}</div>
    </section>;
}
