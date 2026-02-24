import { useState } from 'react';
import Modal from './Modal';

const EXAMPLE_HINT = `{
  "semester": { "name": "2025-2", "label": "...", "startDate": "2026-02-17", "endDate": "..." },
  "weeks": { "1": { "dates": "Feb 17 – 23", "title": "..." }, ... },
  "tasks": [ { "weekNum": 1, "course": "AL", "text": "...", "order": 0, "done": false } ],
  "deadlines": [ { "date": "2026-03-10", "label": "...", "course": "Prob", "urgent": false, "order": 0 } ]
}`;

export default function ImportModal({ onImport, onClose }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);

    const handleParse = () => {
        setError('');
        setPreview(null);
        let data;
        try {
            data = JSON.parse(input.trim());
        } catch {
            setError('JSON inválido. Asegúrate de copiar el JSON completo.');
            return;
        }

        // Validate required fields
        if (!data.semester?.name) { setError('Falta "semester.name"'); return; }
        if (!data.weeks || typeof data.weeks !== 'object') { setError('Falta "weeks"'); return; }
        if (!Array.isArray(data.tasks)) { setError('"tasks" debe ser un array'); return; }
        if (!Array.isArray(data.deadlines)) { setError('"deadlines" debe ser un array'); return; }

        const weekCount = Object.keys(data.weeks).length;
        const courses = new Set([...data.tasks.map(t => t.course), ...data.deadlines.map(d => d.course)]);

        setPreview({
            name: data.semester.label || data.semester.name,
            weeks: weekCount,
            tasks: data.tasks.length,
            deadlines: data.deadlines.length,
            courses: Array.from(courses).sort(),
            data,
        });
    };

    return (
        <Modal title="⬆️ Importar JSON del semestre" onClose={onClose}>
            <p className="text-xs text-slate-500 mb-3">
                Pega el JSON generado por tu LLM (Claude, ChatGPT, etc.) con la estructura de semestre, tareas y entregas.
            </p>

            <textarea
                value={input}
                onChange={e => { setInput(e.target.value); setPreview(null); }}
                placeholder={EXAMPLE_HINT}
                rows={10}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none mb-2"
            />

            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-2">{error}</p>}

            {!preview && (
                <button onClick={handleParse}
                    className="w-full py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                    Validar JSON
                </button>
            )}

            {preview && (
                <div className="space-y-3 animate-fade-in">
                    <div className="bg-violet-50 rounded-lg p-3 text-sm space-y-1">
                        <p className="font-semibold text-violet-800">📋 {preview.name}</p>
                        <p className="text-violet-600 text-xs">{preview.weeks} semanas · {preview.tasks} tareas · {preview.deadlines} entregas</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {preview.courses.map(c => (
                                <span key={c} className="bg-violet-200 text-violet-800 px-2 py-0.5 rounded text-[11px] font-medium">{c}</span>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => { onImport(preview.data); onClose(); }}
                        className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        Importar semestre
                    </button>
                </div>
            )}
        </Modal>
    );
}
