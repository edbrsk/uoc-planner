import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isOffline, offlineGetDeadlines, offlineAddDeadline, offlineUpdateDeadline, offlineDeleteDeadline } from '../lib/store';

export function useDeadlines(userId, semesterId) {
    const [deadlines, setDeadlines] = useState([]);
    const [rev, setRev] = useState(0);

    const reload = useCallback(() => setRev(r => r + 1), []);

    useEffect(() => {
        if (isOffline()) {
            setDeadlines(semesterId ? offlineGetDeadlines(semesterId) : []);
            return;
        }
        if (!userId || !semesterId) { setDeadlines([]); return; }
        const ref = collection(db, 'users', userId, 'semesters', semesterId, 'deadlines');
        const unsub = onSnapshot(ref, snap => {
            setDeadlines(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, [userId, semesterId, rev]);

    const saveDeadline = useCallback(async (date, label, course, urgent, dlId) => {
        if (isOffline()) {
            if (dlId) { offlineUpdateDeadline(semesterId, dlId, { date, label, course, urgent }); }
            else {
                const order = offlineGetDeadlines(semesterId).length;
                offlineAddDeadline(semesterId, { date, label, course, urgent: !!urgent, order });
            }
            reload();
            return;
        }
        const ref = collection(db, 'users', userId, 'semesters', semesterId, 'deadlines');
        if (dlId) {
            await updateDoc(doc(db, 'users', userId, 'semesters', semesterId, 'deadlines', dlId), { date, label, course, urgent });
        } else {
            const order = deadlines.length;
            await addDoc(ref, { date, label, course, urgent: !!urgent, order });
        }
    }, [userId, semesterId, deadlines, reload]);

    const removeDeadline = useCallback(async (dlId) => {
        if (isOffline()) { offlineDeleteDeadline(semesterId, dlId); reload(); return; }
        await deleteDoc(doc(db, 'users', userId, 'semesters', semesterId, 'deadlines', dlId));
    }, [userId, semesterId, reload]);

    return { deadlines, saveDeadline, removeDeadline };
}
