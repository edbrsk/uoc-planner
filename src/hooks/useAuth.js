import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleProvider, isInitialized } from '../lib/firebase';
import { isOffline } from '../lib/store';

const OFFLINE_USER = { uid: 'offline', displayName: 'Offline', email: '', photoURL: null };

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOffline()) {
            setUser(OFFLINE_USER);
            setLoading(false);
            return;
        }
        if (!isInitialized() || !auth) { setLoading(false); return; }
        const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
        return unsub;
    }, []);

    const signIn = () => {
        if (isOffline() || !auth) return Promise.resolve();
        return signInWithPopup(auth, googleProvider);
    };

    const signOut = () => {
        if (isOffline() || !auth) return Promise.resolve();
        return fbSignOut(auth);
    };

    return { user, loading, signIn, signOut };
}
