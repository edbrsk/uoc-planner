import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const STORAGE_KEY = 'uoc_planner_firebase_config';

// ── Config management (localStorage) ──

export function getSavedConfig() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearConfig() {
    localStorage.removeItem(STORAGE_KEY);
}

export function validateConfig(config) {
    const required = ['apiKey', 'authDomain', 'projectId'];
    return required.every(k => config[k] && typeof config[k] === 'string' && config[k].trim() !== '');
}

// ── Firebase singleton ──

let db = null;
let auth = null;
let googleProvider = null;
let initialized = false;

export function isInitialized() {
    return initialized;
}

export function initFirebase(config) {
    // Clean up any previous app
    if (getApps().length > 0) {
        getApps().forEach(app => deleteApp(app));
    }

    const app = initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    initialized = true;

    // Enable offline persistence
    enableMultiTabIndexedDbPersistence(db).catch(err => {
        if (err.code === 'failed-precondition')
            console.warn('Persistence failed: multiple tabs open');
        else if (err.code === 'unimplemented')
            console.warn('Persistence not available in this browser');
    });

    return { db, auth, googleProvider };
}

// Auto-initialize from localStorage or env vars on import
const saved = getSavedConfig();
if (saved && validateConfig(saved)) {
    initFirebase(saved);
} else {
    // Fallback: try env vars (dev mode)
    const envConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    if (validateConfig(envConfig)) {
        initFirebase(envConfig);
        saveConfig(envConfig); // persist so it works offline too
    }
}

export { db, auth, googleProvider };
