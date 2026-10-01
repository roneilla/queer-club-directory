import { FormEvent, useEffect, useRef, useState } from 'react';

export default function ContactModal({ close }: { close: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        const element = dialog.current!;
        element.showModal();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { element.close(); document.body.style.overflow = overflow; };
    }, []);
    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy) return;
        const form = event.currentTarget;
        const body = new URLSearchParams();
        new FormData(form).forEach((value, key) => body.set(key, String(value).trim()));
        if (!body.get('name') || !body.get('message')) { setError('Please enter your name and message.'); return; }
        setBusy(true); setError('');
        try {
            // Netlify Forms is a deploy-time service; Vite's fallback must not look like success.
            if (['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) || window.location.hostname.endsWith('.localhost')) {
                throw new Error('Sending is available on the deployed site. You can also email queerclubdirectory@gmail.com.');
            }
            const response = await fetch('/contact-form.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
            if (!response.ok) throw new Error('Your message could not be sent. Please try again or email queerclubdirectory@gmail.com.');
            setSent(true);
        } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send your message. Please try again.'); }
        finally { setBusy(false); }
    };
    return <dialog ref={dialog} aria-labelledby="contact-heading" onCancel={event => { if (busy) event.preventDefault(); else close(); }} className="rounded p-6 w-full max-w-lg max-h-[90vh] overflow-auto backdrop:bg-black/50">
        <div className="flex justify-between items-center gap-4 mb-4">
            <h2 id="contact-heading" className="text-2xl">Contact us</h2>
            <button type="button" disabled={busy} onClick={close} aria-label="Close contact form" className="rounded hover:bg-gray-200 p-1"
            ><svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                    />
                </svg></button>
        </div>
        {sent ? <div role="status"><p className="mb-4">Thanks! Your message has been submitted.</p>
            <button className="primaryBtn" onClick={close}>Done</button></div> : <>
            <p className="mb-2">Send us an email if you've got any feedback, questions, or feature requests.</p>
            <p className="mb-4 text-sm">You can also email us at <a href="mailto:queerclubdirectory@gmail.com" className="underline">queerclubdirectory@gmail.com</a>.</p>
            {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
            <form name="contact" method="POST" action="/contact-form.html" onSubmit={submit} className="flex flex-col gap-4">
                <input type="hidden" name="form-name" value="contact" />
                <div className="sr-only" aria-hidden="true">
                    <label>Leave this empty<input name="bot-field" tabIndex={-1} autoComplete="off" />
                    </label>
                </div>
                <div className="fieldGroup">
                    <label htmlFor="contact-name">Name</label>
                    <input className="field" id="contact-name" name="name" autoComplete="name" required maxLength={200} disabled={busy} />
                </div>
                <div className="fieldGroup">
                    <label htmlFor="contact-email">Email</label>
                    <input className="field" id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={busy} />
                </div>
                <div className="fieldGroup">
                    <label htmlFor="contact-message">Message</label>
                    <textarea className="field" id="contact-message" name="message" rows={6} required maxLength={5000} disabled={busy} />
                </div>
                <button className="primaryBtn" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
            </form>
        </>}
    </dialog>;
}
