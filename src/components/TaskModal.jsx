import { useState } from 'react';
import Modal from './Modal';

export default function TaskModal({ weekNum, task, courses, onSave, onClose }) {
    const [course, setCourse] = useState(task?.course || courses[0] || 'AL');
    const [newCourse, setNewCourse] = useState('');
    const [text, setText] = useState(task?.text || '');

    const handleSave = () => {
        const finalCourse = course === '__new' ? newCourse.trim() : course;
        if (!finalCourse || !text.trim()) return;
        onSave(weekNum, finalCourse, text.trim(), task?.id || null);
        onClose();
    };

    return (
        <Modal title={task ? 'Editar tarea' : `Añadir tarea — Semana ${weekNum}`} onClose={onClose} onSave={handleSave}>
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Asignatura</label>
                <select value={course} onChange={e => setCourse(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white">
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__new">+ Nueva asignatura...</option>
                </select>
            </div>
            {course === '__new' && (
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de la asignatura</label>
                    <input value={newCourse} onChange={e => setNewCourse(e.target.value)} placeholder="Ej: Cálculo"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
            )}
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Descripción</label>
                <input value={text} onChange={e => setText(e.target.value)} placeholder="Qué hay que hacer..."
                    autoFocus
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </div>
        </Modal>
    );
}
