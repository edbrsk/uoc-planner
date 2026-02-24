import { useState, useRef, useEffect } from 'react';

export default function Header({ semesters, currentId, onSwitch, onNewSemester, progress, user, onSignOut, onImport, onExport }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    return (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-slate-100">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                {/* Title + Semester Selector */}
                <div className="flex items-center gap-2.5">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-violet-700 to-blue-600 bg-clip-text text-transparent">
                        UOC Planner
                    </h1>
                    <select value={currentId || ''} onChange={e => onSwitch(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer transition-shadow hover:shadow-sm">
                        {semesters.map(s => (
                            <option key={s.id} value={s.id}>{s.name || s.id}</option>
                        ))}
                    </select>
                    <button onClick={onNewSemester} title="Nuevo semestre"
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-all hover:shadow-sm text-sm font-medium">
                        +
                    </button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2.5 flex-1 min-w-[100px] max-w-[180px]">
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap font-medium tabular-nums">{progress}%</span>
                </div>

                {/* User profile + dropdown */}
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(o => !o)}
                        className="flex items-center gap-1.5 rounded-full hover:ring-2 hover:ring-violet-200 transition-all cursor-pointer">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-bold border-2 border-white shadow-sm">
                                {user?.displayName?.charAt(0) || '?'}
                            </div>
                        )}
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fade-in">
                            {/* User info */}
                            <div className="px-3 py-2 border-b border-slate-100">
                                <p className="text-sm font-medium text-slate-700 truncate">{user?.displayName}</p>
                                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                            </div>

                            {/* Actions */}
                            <button onClick={() => { setMenuOpen(false); onImport(); }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 flex items-center gap-2 transition-colors">
                                <span>⬆️</span> Importar JSON
                            </button>
                            <button onClick={() => { setMenuOpen(false); onExport(); }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors">
                                <span>⬇️</span> Exportar JSON
                            </button>
                            <button onClick={() => { setMenuOpen(false); window.print(); }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                <span>🖨️</span> Imprimir
                            </button>
                            <div className="border-t border-slate-100 mt-1 pt-1">
                                <button onClick={() => { setMenuOpen(false); onSignOut(); }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                    <span>🚪</span> Cerrar sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
