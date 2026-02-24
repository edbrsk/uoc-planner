import { useState } from 'react';
import { getColor, daysUntil, cdClass, cdLabel, fmtShort } from '../lib/constants';

export default function DeadlinesSection({ deadlines, onAdd, onEdit, onDelete }) {
    const [open, setOpen] = useState(true);
    const sorted = [...deadlines].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1;
        return (a.order || 0) - (b.order || 0);
    });

    return (
        <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <span>Próximas Entregas</span>
                <div className="flex items-center gap-2">
                    <span onClick={e => { e.stopPropagation(); onAdd(); }} title="Añadir entrega"
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-violet-100 text-violet-500 text-sm font-bold opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity">+</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {open && (
                <div className="overflow-x-auto animate-fade-in">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-2 text-left">Fecha</th>
                                <th className="px-4 py-2 text-left">Entregable</th>
                                <th className="px-4 py-2 text-right">Días</th>
                                <th className="px-4 py-2 w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(d => {
                                const days = daysUntil(d.date);
                                const c = getColor(d.course);
                                const imminent = days >= 0 && days <= 10;
                                return (
                                    <tr key={d.id} className={`border-t border-slate-100 group transition-colors
                                      ${days < 0 ? 'opacity-40' : ''}
                                      ${imminent ? 'bg-amber-50/80 border-l-2 border-l-amber-400' : ''}`}>
                                        <td className="px-4 py-2 whitespace-nowrap text-slate-500 text-xs">
                                            {fmtShort(d.date)}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-1.5 ${c.badge}`}>{d.course}</span>
                                            {d.urgent ? <b>{d.label}</b> : d.label}
                                        </td>
                                        <td className={`px-4 py-2 text-right whitespace-nowrap text-xs ${cdClass(days)}`}>{cdLabel(days)}</td>
                                        <td className="px-4 py-2 text-right whitespace-nowrap">
                                            <button onClick={() => onEdit(d)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-violet-500 p-1 transition-opacity" title="Editar">✏️</button>
                                            <button onClick={() => onDelete(d.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity" title="Eliminar">🗑️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 border-t border-slate-100">
                        <button onClick={onAdd} className="w-full py-1.5 border border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-violet-300 hover:text-violet-500 transition-all text-xs">
                            + Añadir entrega
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
