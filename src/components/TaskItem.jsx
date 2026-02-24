import { getColor } from '../lib/constants';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
    const c = getColor(task.course);
    return (
        <li className="flex items-start gap-2 py-1.5 group">
            <input type="checkbox" checked={!!task.done}
                onChange={e => onToggle(task.id, e.target.checked)}
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded accent-violet-600 cursor-pointer" />
            <span className={`flex-1 text-sm leading-snug select-none ${task.done ? 'line-through opacity-40' : ''}`}>
                <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-1.5 ${c.badge}`}>{task.course}</span>
                {task.text}
            </span>
            <span className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(task)} className="text-slate-400 hover:text-violet-500 p-0.5 text-xs" title="Editar">✏️</button>
                <button onClick={() => onDelete(task.id)} className="text-slate-400 hover:text-red-500 p-0.5 text-xs" title="Eliminar">🗑️</button>
            </span>
        </li>
    );
}
