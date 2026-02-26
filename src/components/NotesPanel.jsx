import { useState, useRef, useEffect } from 'react';
import { getColor } from '../lib/constants';

export default function NotesPanel({ task, notes, onSave, onDelete, onClose }) {
    const [text, setText] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const c = getColor(task?.course);
    const bottomRef = useRef(null);

    // Sort notes oldest to newest naturally
    const sortedNotes = [...notes].sort((a, b) => {
        const t1 = a.createdAt ? (typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
        const t2 = b.createdAt ? (typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;
        return t1 - t2;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        await onSave(task.id, text.trim());
        setText('');
    };

    // Scroll to bottom when notes change
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [sortedNotes.length]);

    if (!task) return null;

    return (
        <>
            {/* Invisible full-screen overlay to detect clicks outside the panel */}
            <div className="fixed inset-0 bg-transparent z-40" onClick={onClose} />

            <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-[rgba(0,0,0,0.1)_0px_0px_50px_0px] z-50 flex flex-col border-l border-slate-200"
                style={{ animation: 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <style>{`
                    @keyframes slideRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}</style>

                {/* Header */}
                <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 bg-white shadow-sm z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${c.badge}`}>{task.course}</span>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Notas</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-800 leading-snug">{task.text}</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                    {sortedNotes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                            <span className="text-4xl opacity-40">📝</span>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Sin notas todavía</p>
                                <p className="text-xs mt-1 text-slate-400">Añade enlaces, pensamientos o recordatorios.</p>
                            </div>
                        </div>
                    ) : (
                        sortedNotes.map(n => {
                            let relTime = '';
                            if (n.createdAt) {
                                let dateObj = n.createdAt;
                                if (typeof n.createdAt === 'object' && n.createdAt.toDate) {
                                    dateObj = n.createdAt.toDate();
                                } else if (typeof n.createdAt === 'string' || typeof n.createdAt === 'number') {
                                    dateObj = new Date(n.createdAt);
                                }

                                const ms = Date.now() - dateObj.getTime();
                                const mins = Math.floor(ms / 60000);
                                const hrs = Math.floor(mins / 60);
                                const days = Math.floor(hrs / 24);
                                if (days > 0) relTime = `hace ${days}d`;
                                else if (hrs > 0) relTime = `hace ${hrs}h`;
                                else if (mins > 0) relTime = `hace ${mins}m`;
                                else relTime = 'ahora';
                            }
                            return (
                                <div key={n.id} className="relative bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 group hover:border-violet-100 transition-colors">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{n.text}</p>
                                    <div className="mt-2.5 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 font-medium">{relTime}</span>
                                    </div>
                                    {confirmDeleteId === n.id ? (
                                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2 z-10 animate-fade-in">
                                            <span className="text-xs font-semibold text-slate-600">¿Eliminar?</span>
                                            <button onClick={() => { setConfirmDeleteId(null); onDelete(n.id); }} className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors shadow-sm">Sí</button>
                                            <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">No</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDeleteId(n.id)}
                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 text-slate-300 hover:text-red-500 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                            title="Eliminar nota"
                                        >
                                            <svg className="w-3.5 h-3.5 block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-10">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Escribe una nota..."
                            className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 transition-all resize-none max-h-[120px]"
                            rows={text.includes('\n') ? 2 : 1}
                        />
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="bg-violet-600 text-white rounded-xl px-4 font-medium text-sm hover:bg-violet-700 hover:shadow-md disabled:opacity-50 disabled:hover:bg-violet-600 disabled:hover:shadow-none transition-all flex items-center justify-center shrink-0"
                            title="Guardar (Enter)"
                        >
                            <svg className="w-4 h-4 block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                    <div className="mt-2 text-center">
                        <span className="text-[10px] text-slate-400 font-medium">Pulsa <kbd className="font-sans px-1 py-0.5 rounded bg-slate-100 border border-slate-200">Enter</kbd> para enviar, <kbd className="font-sans px-1 py-0.5 rounded bg-slate-100 border border-slate-200">Shift+Enter</kbd> para nueva línea</span>
                    </div>
                </div>
            </div>
        </>
    );
}
