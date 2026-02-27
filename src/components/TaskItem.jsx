import { getColor } from '../lib/constants';

export default function TaskItem({ task, onToggle, onEdit, onDelete, hasNotes, onOpenNotes }) {
    const c = getColor(task.course);
    return (
        <li className="flex items-start gap-2 py-1.5 group">
            <input type="checkbox" checked={!!task.done}
                onChange={e => onToggle(task.id, e.target.checked)}
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded accent-violet-600 cursor-pointer" />
            <span className={`flex-1 text-sm leading-snug select-none ${task.done ? 'line-through opacity-40' : ''}`}>
                <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-1.5 ${c.badge}`}>{task.course}</span>
                {task.url
                    ? <a href={task.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-violet-600 transition-colors">{task.text}</a>
                    : task.text}
            </span>
            <span className={`flex items-center gap-1 flex-shrink-0 transition-opacity ${hasNotes ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button onClick={() => onOpenNotes(task)} className="relative text-slate-400 hover:text-blue-500 p-1 text-sm cursor-pointer" title="Notas">
                    📝
                    {hasNotes && <span className="absolute top-0 right-0 w-2 h-2 bg-violet-600 shadow-[0_0_0_2px_white] rounded-full" />}
                </button>
                <button onClick={() => onEdit(task)} className="text-slate-400 hover:text-violet-500 p-1 text-sm cursor-pointer" title="Editar">✏️</button>
                <button onClick={() => onDelete(task.id)} className="text-slate-400 hover:text-red-500 p-1 text-sm cursor-pointer" title="Eliminar">🗑️</button>
            </span>
        </li>
    );
}
