import { useState } from 'react';
import TaskItem from './TaskItem';
import { weekDatesLabel } from '../lib/constants';

export default function WeekCard({ week, tasks, isCurrent, onToggleTask, onEditTask, onDeleteTask, onAddTask, onEditWeek, onDeleteWeek, onOpenNotes, taskIdsWithNotes }) {
    const [collapsed, setCollapsed] = useState(!isCurrent);
    const done = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;

    return (
        <div className={`rounded-xl shadow-sm border overflow-hidden transition-all
      ${isCurrent ? 'border-violet-200 bg-violet-50/50 ring-1 ring-violet-100' : 'border-slate-200 bg-white'}`}>
            {/* Header */}
            <div className="flex items-center group">
                <button onClick={() => setCollapsed(c => !c)}
                    className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors text-left">
                    <div className="flex items-center gap-2 min-w-0">
                        {isCurrent && <span className="flex-shrink-0 w-2 h-2 bg-violet-500 rounded-full animate-pulse" />}
                        <span className="font-semibold text-slate-700 text-sm">S{week.num}</span>
                        <span className="text-slate-400 text-xs truncate">{weekDatesLabel(week)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {pct === 100 && total > 0 && <span className="text-emerald-500 text-sm">✓</span>}
                        {total > 0 && <span className="text-xs text-slate-400 tabular-nums">{pct}%</span>}
                        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
                <span className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEditWeek(week.num)} className="text-slate-400 hover:text-violet-500 p-1 text-xs" title="Editar semana">✏️</button>
                    <button onClick={() => onDeleteWeek(week.num)} className="text-slate-400 hover:text-red-500 p-1 text-xs" title="Eliminar semana">🗑️</button>
                </span>
            </div>

            {/* Body */}
            {!collapsed && (
                <div className="animate-fade-in">
                    <div className="px-4 pb-1">
                        <p className="text-xs font-medium text-slate-500 mb-2">{week.title}</p>
                        {tasks.length > 0 ? (
                            <ul className="space-y-0.5">
                                {tasks.map(t => (
                                    <TaskItem key={t.id} task={t} onToggle={onToggleTask} onEdit={onEditTask} onDelete={onDeleteTask} hasNotes={taskIdsWithNotes?.has(t.id)} onOpenNotes={onOpenNotes} />
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-slate-400 italic py-2">Sin tareas</p>
                        )}
                        <button onClick={() => onAddTask(week.num)}
                            className="mt-2 mb-2 w-full py-1.5 border border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-violet-300 hover:text-violet-500 transition-all text-xs">
                            + Añadir tarea
                        </button>
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                        <div className="px-4 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-1.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-violet-400'}`}
                                        style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-slate-400 tabular-nums">{done}/{total}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
