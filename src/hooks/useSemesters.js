import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isOffline, offlineGetSemesters, offlineGetLastSemId, offlineSetLastSemId, offlineCreateSemester, offlineDeleteSemester, offlineGetSemester } from '../lib/store';

export function useSemesters(userId) {
    const [semesters, setSemesters] = useState([]);
    const [currentId, setCurrentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rev, setRev] = useState(0); // offline: force re-read

    const reload = useCallback(() => setRev(r => r + 1), []);

    useEffect(() => {
        if (isOffline()) {
            const list = offlineGetSemesters();
            setSemesters(list);
            setLoading(false);
            if (list.length > 0 && !currentId) {
                const saved = offlineGetLastSemId();
                const target = list.find(s => s.id === saved) ? saved : list[0].id;
                setCurrentId(target);
            }
            return;
        }

        // Firebase mode
        if (!userId) { setLoading(false); return; }
        const q = query(collection(db, 'users', userId, 'semesters'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setSemesters(list);
            setLoading(false);
            if (list.length > 0 && !currentId) {
                const saved = localStorage.getItem('uoc_lastSem_' + userId);
                const target = list.find(s => s.id === saved) ? saved : list[0].id;
                setCurrentId(target);
            }
        });
        return unsub;
    }, [userId, rev]);

    const switchSemester = useCallback((id) => {
        setCurrentId(id);
        if (isOffline()) { offlineSetLastSemId(id); }
        else if (userId) { localStorage.setItem('uoc_lastSem_' + userId, id); }
    }, [userId]);

    const createSemester = useCallback(async (name) => {
        if (isOffline()) {
            const id = offlineCreateSemester(name);
            setCurrentId(id);
            reload();
            return id;
        }
        const ref = await addDoc(collection(db, 'users', userId, 'semesters'), {
            name, label: 'Semestre ' + name, startDate: '', endDate: '', weeks: {},
            createdAt: serverTimestamp(),
        });
        setCurrentId(ref.id);
        return ref.id;
    }, [userId, reload]);

    const deleteSemester = useCallback(async (semId) => {
        if (isOffline()) {
            const nextId = offlineDeleteSemester(semId);
            if (currentId === semId) setCurrentId(nextId);
            reload();
            return;
        }
        const semRef = doc(db, 'users', userId, 'semesters', semId);
        const batch = writeBatch(db);
        const tasksSnap = await import('firebase/firestore').then(m => m.getDocs(collection(semRef, 'tasks')));
        const dlSnap = await import('firebase/firestore').then(m => m.getDocs(collection(semRef, 'deadlines')));
        tasksSnap.docs.forEach(d => batch.delete(d.ref));
        dlSnap.docs.forEach(d => batch.delete(d.ref));
        batch.delete(semRef);
        await batch.commit();
        if (currentId === semId) {
            const remaining = semesters.filter(s => s.id !== semId);
            setCurrentId(remaining.length > 0 ? remaining[0].id : null);
        }
    }, [userId, currentId, semesters, reload]);

    // Build current semester (offline needs to merge stored data)
    const current = isOffline()
        ? (currentId ? { ...offlineGetSemester(currentId), ...(semesters.find(s => s.id === currentId) || {}) } : null)
        : (semesters.find(s => s.id === currentId) || null);

    return { semesters, current, currentId, loading, switchSemester, createSemester, deleteSemester, reload };
}
