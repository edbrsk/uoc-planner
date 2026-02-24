import { useState } from 'react';
import Modal from './Modal';

export function SemesterModal({ onSave, onClose }) {
    const [name, setName] = useState('');

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name.trim());
        onClose();
    };

    return (
        <Modal title="Nuevo semestre" onClose={onClose} onSave={handleSave}>
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre del semestre</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: 2026-1"
                    autoFocus
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </div>
        </Modal>
    );
}

import { parseDatesText } from '../lib/constants';

export function WeekModal({ weekNum, week, semesterName, onSave, onClose }) {
    const isNew = !week;
    const [num, setNum] = useState(weekNum || 1);

    // Parse old text dates into ISO if no startDate/endDate exist
    const parsed = (!week?.startDate && week?.dates)
        ? parseDatesText(week.dates, semesterName ? parseInt(semesterName) || undefined : undefined)
        : { startDate: '', endDate: '' };

    const [startDate, setStartDate] = useState(week?.startDate || parsed.startDate || '');
    const [endDate, setEndDate] = useState(week?.endDate || parsed.endDate || '');
    const [title, setTitle] = useState(week?.title || '');

    // Auto-fill end date when start date changes (7-day week)
    const handleStartChange = (val) => {
        setStartDate(val);
        if (val) {
            const d = new Date(val + 'T00:00:00');
            d.setDate(d.getDate() + 6);
            setEndDate(d.toISOString().slice(0, 10));
        }
    };

    const handleSave = () => {
        if (!num || !startDate || !endDate || !title.trim()) return;
        onSave(parseInt(num), startDate, endDate, title.trim(), isNew);
        onClose();
    };

    return (
        <Modal title={isNew ? 'Añadir semana' : `Editar semana ${weekNum}`} onClose={onClose} onSave={handleSave}>
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Número de semana</label>
                <input type="number" min="1" value={num} onChange={e => setNum(e.target.value)} disabled={!isNew}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Fecha inicio</label>
                    <input type="date" value={startDate} onChange={e => handleStartChange(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Fecha fin</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tema principal de la semana"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </div>
        </Modal>
    );
}

