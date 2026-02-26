import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isOffline, offlineGetNotes, offlineAddNote, offlineUpdateNote, offlineDeleteNote } from '../lib/store';

export function useNotes(userId, semesterId) {
    const [notes, setNotes] = useState([]);
    const [rev, setRev] = useState(0);

    const reload = useCallback(() => setRev(r => r + 1), []);

    useEffect(() => {
        if (isOffline()) {
            setNotes(semesterId ? offlineGetNotes(semesterId) : []);
            return;
        }
        if (!userId || !semesterId) { setNotes([]); return; }
        const ref = collection(db, 'users', userId, 'semesters', semesterId, 'notes');
        const unsub = onSnapshot(ref, snap => {
            setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, [userId, semesterId, rev]);

    const saveNote = useCallback(async (taskId, text, noteId) => {
        if (isOffline()) {
            if (noteId) { offlineUpdateNote(semesterId, noteId, { text }); }
            else { offlineAddNote(semesterId, { taskId, text }); }
            reload();
            return;
        }
        const ref = collection(db, 'users', userId, 'semesters', semesterId, 'notes');
        if (noteId) {
            await updateDoc(doc(db, 'users', userId, 'semesters', semesterId, 'notes', noteId), { text });
        } else {
            await addDoc(ref, { taskId, text, createdAt: serverTimestamp() });
        }
    }, [userId, semesterId, reload]);

    const removeNote = useCallback(async (noteId) => {
        if (isOffline()) { offlineDeleteNote(semesterId, noteId); reload(); return; }
        await deleteDoc(doc(db, 'users', userId, 'semesters', semesterId, 'notes', noteId));
    }, [userId, semesterId, reload]);

    // Set of task IDs that have at least one note
    const taskIdsWithNotes = useMemo(() => {
        return new Set(notes.map(n => n.taskId));
    }, [notes]);

    return { notes, saveNote, removeNote, taskIdsWithNotes };
}
