const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function SearchHighlight({ text, query = '' }: { text: string; query?: string }) {
    const words = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return <>{text}</>;
    // Map normalized character offsets back to the original text, including accents.
    let normalized = '';
    const offsets: { start: number; end: number }[] = [];
    let offset = 0;
    for (const char of text) {
        const part = normalizeSearch(char);
        for (let i = 0; i < part.length; i++) offsets.push({ start: offset, end: offset + char.length });
        normalized += part; offset += char.length;
    }
    const matches = new Set<number>();
    for (const word of words) {
        let start = normalized.indexOf(word);
        while (start !== -1) {
            for (let i = start; i < start + word.length; i++) for (let j = offsets[i].start; j < offsets[i].end; j++) matches.add(j);
            start = normalized.indexOf(word, start + 1);
        }
    }
    const parts = [];
    for (let start = 0; start < text.length;) {
        const marked = matches.has(start); let end = start + 1;
        while (end < text.length && matches.has(end) === marked) end++;
        parts.push(marked ? <mark key={start} className="bg-yellow-200 text-black rounded-sm">{text.slice(start, end)}</mark> : <span key={start}>{text.slice(start, end)}</span>);
        start = end;
    }
    return <>{parts}</>;
}
