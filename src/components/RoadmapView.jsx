import { useMemo } from 'react';
import { fmtShort, parseDatesText } from '../lib/constants';

// ── Dynamic color palette — supports any number of courses ──
const PALETTE = [
    { bg: '#fff7ed', card: '#ffedd5', border: '#fb923c' }, // orange
    { bg: '#f0fdf4', card: '#dcfce7', border: '#4ade80' }, // green
    { bg: '#faf5ff', card: '#f3e8ff', border: '#c084fc' }, // purple
    { bg: '#f0f9ff', card: '#e0f2fe', border: '#38bdf8' }, // sky
    { bg: '#fef2f2', card: '#fce7e7', border: '#f87171' }, // red
    { bg: '#f0fdfa', card: '#ccfbf1', border: '#2dd4bf' }, // teal
    { bg: '#fefce8', card: '#fef9c3', border: '#facc15' }, // yellow
    { bg: '#fdf2f8', card: '#fce7f3', border: '#f472b6' }, // pink
    { bg: '#eff6ff', card: '#dbeafe', border: '#60a5fa' }, // blue
    { bg: '#ecfdf5', card: '#d1fae5', border: '#34d399' }, // emerald
];

const DAY_PX = 18;       // pixels per day — generous since we scroll horizontally
const CARD_W = 260;      // card width in px
const CARD_H = 70;       // card height in px
const CARD_GAP = 8;      // vertical gap between stacked cards
const LABEL_W = 280;     // left label column width
const LANE_PAD = 12;     // top/bottom padding inside each lane

export default function RoadmapView({ deadlines, tasks, weeks, onClose }) {
    const roadmap = useMemo(() => {
        // Build a week→date lookup (supports both new startDate and old text dates)
        const weekDateMap = {};
        weeks.forEach(w => {
            if (w.startDate) {
                weekDateMap[w.num] = w.startDate;
            } else if (w.dates) {
                const parsed = parseDatesText(w.dates);
                if (parsed.startDate) weekDateMap[w.num] = parsed.startDate;
            }
        });

        // Collect ALL events: tasks (positioned by week start) + deadlines (positioned by exact date)
        const events = [];

        // Add tasks
        tasks.forEach(t => {
            const date = weekDateMap[t.weekNum];
            if (!date || !t.course) return;
            events.push({ id: 'task-' + t.id, date, label: t.text, course: t.course, type: 'task', done: t.done });
        });

        // Add deadlines
        deadlines.forEach(d => {
            if (!d.date || !d.course) return;
            events.push({ id: 'dl-' + d.id, date: d.date, label: d.label, course: d.course, type: 'deadline', urgent: d.urgent });
        });

        if (events.length === 0) return null;

        // Discover courses dynamically
        const courseSet = new Set(events.map(e => e.course));
        const courses = Array.from(courseSet).sort();
        const colorMap = {};
        courses.forEach((c, i) => { colorMap[c] = PALETTE[i % PALETTE.length]; });

        // Timeline bounds
        const allDates = events.map(e => new Date(e.date + 'T00:00:00').getTime());
        weeks.forEach(w => {
            if (w.startDate) allDates.push(new Date(w.startDate + 'T00:00:00').getTime());
            if (w.endDate) allDates.push(new Date(w.endDate + 'T00:00:00').getTime());
        });

        const minMs = Math.min(...allDates);
        const maxMs = Math.max(...allDates);
        const startDate = new Date(minMs);
        startDate.setDate(1); // align to month start
        const endDate = new Date(maxMs);
        endDate.setMonth(endDate.getMonth() + 1, 0); // align to month end

        const startMs = startDate.getTime();
        const totalDays = Math.ceil((endDate.getTime() - startMs) / 864e5) + 1;
        const totalWidth = totalDays * DAY_PX + LABEL_W + CARD_W + 60; // extra space so last cards aren't clipped

        // Month markers
        const months = [];
        const dt = new Date(startDate);
        const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        while (dt <= endDate) {
            const offset = Math.round((dt.getTime() - startMs) / 864e5) * DAY_PX + LABEL_W;
            months.push({ label: `${MONTHS_ES[dt.getMonth()]} ${dt.getFullYear()}`, offset });
            dt.setMonth(dt.getMonth() + 1);
        }

        // Today position
        const todayOffset = Math.round((Date.now() - startMs) / 864e5) * DAY_PX + LABEL_W;

        // Build lanes — group events by course, sort by date, stack to avoid overlaps
        const posX = (dateStr) => Math.round((new Date(dateStr + 'T00:00:00').getTime() - startMs) / 864e5) * DAY_PX + LABEL_W;

        const lanes = courses.map(course => {
            const items = events.filter(e => e.course === course).sort((a, b) => a.date.localeCompare(b.date));
            const rowEnds = []; // track the right edge of each stacking row
            const placed = items.map(item => {
                const x = posX(item.date);
                let row = 0;
                while (rowEnds[row] !== undefined && rowEnds[row] > x - 10) row++;
                rowEnds[row] = x + CARD_W;
                return { ...item, x, row };
            });
            const maxRow = placed.length > 0 ? Math.max(...placed.map(p => p.row)) : 0;
            const laneHeight = LANE_PAD * 2 + (maxRow + 1) * (CARD_H + CARD_GAP);
            return { course, items: placed, laneHeight, color: colorMap[course] };
        });

        return { courses, lanes, months, totalWidth, todayOffset, startMs };
    }, [deadlines, tasks, weeks]);

    // No data state
    if (!roadmap) {
        return (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
                <div className="bg-white rounded-xl p-8 text-center max-w-sm" onClick={e => e.stopPropagation()}>
                    <p className="text-slate-500">No hay datos para mostrar en el roadmap.</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm">Cerrar</button>
                </div>
            </div>
        );
    }

    const { lanes, months, totalWidth, todayOffset } = roadmap;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
            {/* ── Header bar ── */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white flex-shrink-0">
                <h2 className="font-bold text-lg tracking-tight">📊 Roadmap del Semestre</h2>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Scroll horizontal para navegar</span>
                    <button onClick={onClose}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                        ✕ Cerrar
                    </button>
                </div>
            </div>

            {/* ── Scrollable chart ── */}
            <div className="flex-1 overflow-auto">
                <div style={{ width: totalWidth, minHeight: '100%' }} className="relative">

                    {/* Month header */}
                    <div className="sticky top-0 z-20 flex items-end bg-slate-800" style={{ width: totalWidth, height: 44 }}>
                        <div style={{ width: LABEL_W }} className="flex-shrink-0 h-full bg-slate-900 flex items-center px-5">
                            <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Asignatura</span>
                        </div>
                        {months.map((m, i) => (
                            <div key={i} className="absolute flex items-center gap-1.5" style={{ left: m.offset, top: 0, height: 44 }}>
                                <div className="w-px h-5 bg-white/40" />
                                <span className="text-white text-xs font-bold whitespace-nowrap">{m.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Today marker */}
                    <div className="absolute z-10 pointer-events-none" style={{ left: todayOffset - 1, top: 44, bottom: 0, width: 2 }}>
                        <div className="w-full h-full bg-red-500/50" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-b-md whitespace-nowrap shadow-sm">
                            Hoy
                        </div>
                    </div>

                    {/* Swimlanes */}
                    {lanes.map(lane => (
                        <div key={lane.course} className="relative border-b-2 border-white" style={{ height: lane.laneHeight, backgroundColor: lane.color.bg }}>
                            {/* Course label */}
                            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-slate-200 flex items-center px-5 z-10" style={{ width: LABEL_W }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color.border }} />
                                    <span className="font-bold text-slate-700 text-sm">{lane.course}</span>
                                    <span className="text-[10px] text-slate-400 ml-1">{lane.items.length} eventos</span>
                                </div>
                            </div>

                            {/* Event cards */}
                            {lane.items.map(item => (
                                <div key={item.id}
                                    className="absolute rounded-lg px-3 py-2 shadow-sm transition-shadow hover:shadow-md cursor-default"
                                    style={{
                                        left: item.x,
                                        top: LANE_PAD + item.row * (CARD_H + CARD_GAP),
                                        width: CARD_W,
                                        height: CARD_H,
                                        backgroundColor: lane.color.card,
                                        border: `2px solid ${lane.color.border}`,
                                    }}>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-bold text-slate-600">{fmtShort(item.date)}</span>
                                        {item.type === 'deadline' && (
                                            <span className="text-[9px] bg-slate-700 text-white px-1 py-px rounded font-medium">ENTREGA</span>
                                        )}
                                        {item.done && (
                                            <span className="text-[9px] bg-emerald-600 text-white px-1 py-px rounded font-medium">✓</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-800 leading-tight mt-1 line-clamp-2">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Legend ── */}
            <div className="flex items-center justify-between px-5 py-2 bg-slate-50 border-t border-slate-200 flex-shrink-0 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Hoy</span>
                    <span className="flex items-center gap-1"><span className="text-[9px] bg-slate-700 text-white px-1 py-px rounded">ENTREGA</span> Entrega</span>
                    <span className="flex items-center gap-1"><span className="text-[9px] bg-emerald-600 text-white px-1 py-px rounded">✓</span> Completada</span>
                </div>
                <span>{lanes.reduce((sum, l) => sum + l.items.length, 0)} eventos · {lanes.length} asignaturas</span>
            </div>
        </div>
    );
}
