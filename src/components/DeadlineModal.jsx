import { useState } from 'react';
import Modal from './Modal';

export default function DeadlineModal({ deadline, courses, onSave, onClose }) {
    const [date, setDate] = useState(deadline?.date || '');
    const [label, setLabel] = useState(deadline?.label || '');
    const [course, setCourse] = useState(deadline?.course || courses[0] || 'AL');
    const [newCourse, setNewCourse] = useState('');
    const [urgent, setUrgent] = useState(deadline?.urgent || false);

    const handleSave = () => {
        const finalCourse = course === '__new' ? newCourse.trim() : course;
        if (!date || !finalCourse || !label.trim()) return;
        onSave(date, label.trim(), finalCourse, urgent, deadline?.id || null);
        onClose();
    };

    return (
        <Modal title={deadline ? 'Editar entrega' : 'Añadir entrega'} onClose={onClose} onSave={handleSave}>
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Fecha</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </div>
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
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nombre</label>
                    <input value={newCourse} onChange={e => setNewCourse(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
            )}
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Descripción</label>
                <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Descripción de la entrega"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} className="accent-red-500" />
                Urgente
            </label>
        </Modal>
    );
}
