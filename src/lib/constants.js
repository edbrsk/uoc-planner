export const COLORS = {
    AL: { badge: 'bg-violet-200 text-violet-800', pill: 'text-violet-700 border-violet-300', pillOn: 'bg-violet-100 text-violet-800 border-violet-300' },
    Prob: { badge: 'bg-blue-200 text-blue-800', pill: 'text-blue-700 border-blue-300', pillOn: 'bg-blue-100 text-blue-800 border-blue-300' },
    Prog: { badge: 'bg-emerald-200 text-emerald-800', pill: 'text-emerald-700 border-emerald-300', pillOn: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    Redes: { badge: 'bg-orange-200 text-orange-800', pill: 'text-orange-700 border-orange-300', pillOn: 'bg-orange-100 text-orange-800 border-orange-300' },
    Lab: { badge: 'bg-teal-200 text-teal-800', pill: 'text-teal-700 border-teal-300', pillOn: 'bg-teal-100 text-teal-800 border-teal-300' },
};

const FALLBACK = { badge: 'bg-gray-200 text-gray-800', pill: 'text-gray-700 border-gray-300', pillOn: 'bg-gray-100 text-gray-800 border-gray-300' };

export function getColor(course) {
    return COLORS[course] || FALLBACK;
}

export function daysUntil(dateStr) {
    return Math.ceil((new Date(dateStr + 'T23:59:59') - new Date()) / 864e5);
}

export function cdClass(d) {
    if (d < 0) return 'text-slate-400 line-through';
    if (d <= 3) return 'text-red-600 font-bold';
    if (d <= 7) return 'text-orange-500 font-semibold';
    return 'text-emerald-600';
}

export function cdLabel(d) {
    if (d < 0) return `hace ${Math.abs(d)}d`;
    if (d === 0) return 'Hoy!';
    if (d === 1) return 'Mañana!';
    return `${d} días`;
}

// ── Date helpers for week ranges ──

const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Format an ISO date string like "2026-02-24" → "Feb 24" */
export function fmtShort(iso) {
    const d = new Date(iso + 'T00:00:00');
    return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** Format a date range: e.g. "Feb 24 – Mar 2" or "Feb 24 – 28" when same month */
export function fmtRange(startIso, endIso) {
    if (!startIso || !endIso) return '';
    const s = new Date(startIso + 'T00:00:00');
    const e = new Date(endIso + 'T00:00:00');
    if (s.getMonth() === e.getMonth()) {
        return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${e.getDate()}`;
    }
    return `${fmtShort(startIso)} – ${fmtShort(endIso)}`;
}

/** Add n days to an ISO date string, return new ISO string */
export function addDays(iso, n) {
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
}

/** Get the display text for a week's dates — supports both old "dates" string and new startDate/endDate */
export function weekDatesLabel(week) {
    if (week.startDate && week.endDate) return fmtRange(week.startDate, week.endDate);
    return week.dates || '';
}

const MONTH_MAP = { Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5, Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11 };

/** Parse old text dates like "Feb 24 – Mar 2" or "Feb 17 – 23" into { startDate, endDate } ISO strings.
 *  Uses `year` (default: current year) for the year component. */
export function parseDatesText(text, year) {
    if (!text) return { startDate: '', endDate: '' };
    const y = year || new Date().getFullYear();
    // Normalize dashes/spaces
    const parts = text.replace(/–/g, '-').replace(/—/g, '-').split('-').map(s => s.trim());
    if (parts.length !== 2) return { startDate: '', endDate: '' };

    // Parse start: "Feb 24"
    const startMatch = parts[0].match(/([A-Za-z]+)\s+(\d+)/);
    if (!startMatch) return { startDate: '', endDate: '' };
    const startMonth = MONTH_MAP[startMatch[1]];
    const startDay = parseInt(startMatch[2]);
    if (startMonth === undefined) return { startDate: '', endDate: '' };

    // Parse end: could be "Mar 2" or just "23"
    const endMatch = parts[1].match(/([A-Za-z]+)\s+(\d+)/);
    let endMonth, endDay;
    if (endMatch) {
        endMonth = MONTH_MAP[endMatch[1]];
        endDay = parseInt(endMatch[2]);
        if (endMonth === undefined) return { startDate: '', endDate: '' };
    } else {
        endMonth = startMonth;
        endDay = parseInt(parts[1]);
    }

    const sd = new Date(y, startMonth, startDay);
    const ed = new Date(y, endMonth, endDay);
    return {
        startDate: sd.toISOString().slice(0, 10),
        endDate: ed.toISOString().slice(0, 10),
    };
}


