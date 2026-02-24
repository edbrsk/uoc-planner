export default function Modal({ title, children, onClose, onSave, saveLabel = 'Guardar' }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <div className="px-5 py-4 space-y-3">{children}</div>
                <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-lg">Cancelar</button>
                    <button onClick={onSave} className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium">{saveLabel}</button>
                </div>
            </div>
        </div>
    );
}
