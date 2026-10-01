import { CalendarEvent, eventCost, scheduleLabel } from '../../shared/events';
import { eventCategory, categoryLabel } from '../eventDisplay';
function timeLabel(time: string) { const [hour, minute] = time.split(':').map(Number); return Number.isNaN(hour) ? time : `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`; }
export default function EventCard({ event }: { event: CalendarEvent }) {
    const category = eventCategory(event);
    return <article className="event-list-card">
        <div className="event-list-time"><p>{timeLabel(event.time)}</p>{category && <span className={`event-category-pill event-category-${category}`}><span className="event-category-dot" />{categoryLabel(category)}</span>}</div>
        <div className="min-w-0 flex-1"><h3 className="text-xl mb-2">{event.title}</h3>
            {event.club && <p className="event-card-meta">{event.club.instagram ? <a href={`https://www.instagram.com/${encodeURIComponent(event.club.instagram.replace(/^@/, ''))}/`} target="_blank" rel="noopener noreferrer">@{event.club.instagram.replace(/^@/, '')}</a> : event.club.name}</p>}
            <p className="event-card-meta">{event.location}</p>
            <div className="flex flex-wrap gap-2 mt-4 items-center"><span className="event-cost-tag">{eventCost(event)}</span>{event.website && /^https?:\/\//i.test(event.website) && <a className="event-ticket-link" href={event.website} target="_blank" rel="noopener noreferrer">Event / tickets ↗</a>}</div>
            <details className="event-more-info"><summary>More info</summary><div className="pt-3 flex flex-col gap-3"><p className="whitespace-pre-wrap">{event.description}</p><p className="text-sm">{scheduleLabel(event)} · {timeLabel(event.time)}{event.endTime ? ` – ${timeLabel(event.endTime)}` : ''} (Toronto time)</p>{event.promoCode && <p>Promo code: <strong>{event.promoCode}</strong></p>}{event.club && <div className="border-t pt-3 text-sm"><p className="font-medium">Hosted by {event.club.name}</p>{event.club.description && <p>{event.club.description}</p>}{event.club.website && /^https?:\/\//i.test(event.club.website) && <a className="underline" href={event.club.website} target="_blank" rel="noopener noreferrer">Club website</a>}</div>}</div></details>
        </div>
    </article>;
}
