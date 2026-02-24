import { useState } from 'react';
import { validateConfig, saveConfig, initFirebase } from '../lib/firebase';
import { setMode } from '../lib/store';

const EXAMPLE_CONFIG = `{
  "apiKey": "AIzaSy...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "storageBucket": "your-project.firebasestorage.app",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abc123"
}`;

export default function SetupScreen({ onConfigured }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleSetup = () => {
        setError('');
        let config;
        try {
            config = JSON.parse(input.trim());
        } catch {
            setError('JSON inválido. Copia el objeto firebaseConfig exacto de la consola de Firebase.');
            return;
        }

        if (!validateConfig(config)) {
            setError('Faltan campos obligatorios: apiKey, authDomain, projectId');
            return;
        }

        try {
            initFirebase(config);
            saveConfig(config);
            setMode('firebase');
            onConfigured();
        } catch (err) {
            setError('Error al inicializar Firebase: ' + err.message);
        }
    };

    const handleOffline = () => {
        setMode('offline');
        onConfigured();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-blue-50 p-4">
            <div className="w-full max-w-lg space-y-6 animate-fade-in">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                        <span className="text-2xl">📚</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-blue-600 bg-clip-text text-transparent">
                        UOC Planner
                    </h1>
                    <p className="text-xs text-slate-400">Developed by Edgar <a href="https://github.com/edbrsk/" target="_blank" rel="noopener" className="text-violet-500 hover:text-violet-700 transition-colors">@edbrsk</a></p>
                    <p className="text-slate-500">Elige cómo guardar tus datos</p>
                </div>

                {/* Option 1: Firebase */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <h2 className="font-semibold text-slate-700 text-sm">☁️ Opción 1 — Firebase (sincronización en la nube)</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Cada usuario usa su propio proyecto Firebase — tus datos son solo tuyos y se sincronizan entre dispositivos.
                    </p>
                    <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
                        <li>Ve a <a href="https://console.firebase.google.com" target="_blank" rel="noopener" className="text-violet-600 underline">console.firebase.google.com</a></li>
                        <li>Crea un proyecto (plan Spark gratuito)</li>
                        <li>Añade una <b>app web</b> y copia el objeto <code className="bg-slate-100 px-1 rounded text-[11px]">firebaseConfig</code></li>
                        <li>Activa <b>Authentication → Google</b></li>
                        <li>Crea una <b>Firestore Database</b> (modo test)</li>
                        <li>Pega la configuración aquí abajo ↓</li>
                    </ol>

                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={EXAMPLE_CONFIG}
                        rows={7}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                    />
                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                    )}
                    <button onClick={handleSetup}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 transition-all">
                        Conectar Firebase
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">o bien</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Option 2: Offline */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <h2 className="font-semibold text-slate-700 text-sm">💾 Opción 2 — Offline (solo este navegador)</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Tus datos se guardan en el almacenamiento local del navegador. No necesitas cuenta ni configuración.
                        Ideal para usar rápidamente sin registro.
                    </p>
                    <button onClick={handleOffline}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all">
                        Usar sin cuenta (offline)
                    </button>
                </div>

                <p className="text-center text-[11px] text-slate-400">
                    La configuración se guarda localmente en tu navegador. Nunca se envía a terceros.
                </p>
            </div>
        </div>
    );
}
