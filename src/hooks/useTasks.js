import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isOffline, offlineGetTasks, offlineAddTask, offlineUpdateTask, offlineDeleteTask } from '../lib/store';

export function useTasks(userId, semesterId) {
    const [tasks, setTasks] = useState([]);
    const [rev, setRev] = useState(0);

    const reload = useCallback(() => setRev(r => r + 1), []);

    useEffect(() => {
        if (isOffline()) {
            setTasks(semesterId ? offlineGetTasks(semesterId) : []);
            return;
        }
        if (!userId || !semesterId) { setTasks([]); return; }
        const ref = collection(db, 'users', userId, 'semesters', semesterId, 'tasks');
        const unsub = onSnapshot(ref, snap => {
            setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, [userId, semesterId, rev]);

    const toggleTask = useCallback(async (taskId, done) => {
        if (isOffline()) { offlineUpdateTask(semesterId, taskId, { done }); reload(); return; }
        await updateDoc(doc(db, 'users', userId, 'semesters', semesterId, 'tasks', taskId), { done });
    }, [userId, semesterId, reload]);

    const saveTask = useCallback(async (weekNum, course, text, taskId) => {
        if (isOffline()) {
            if (taskId) { offlineUpdateTask(semesterId, taskId, { course, text }); }
            else {
                const order = offlineGetTasks(semesterId).filter(t => t.weekNum === weekNum).length;
                offlineAddTask(semesterId, { weekNum, course, text, done: false, order });
            }
            reload();
            return;
        }
        const ref = collection(db, 'users', userId, 'semesters', semesterId, 'tasks');
        if (taskId) {
            await updateDoc(doc(db, 'users', userId, 'semesters', semesterId, 'tasks', taskId), { course, text });
        } else {
            const order = tasks.filter(t => t.weekNum === weekNum).length;
            await addDoc(ref, { weekNum, course, text, done: false, order });
        }
    }, [userId, semesterId, tasks, reload]);

    const removeTask = useCallback(async (taskId) => {
        if (isOffline()) { offlineDeleteTask(semesterId, taskId); reload(); return; }
        await deleteDoc(doc(db, 'users', userId, 'semesters', semesterId, 'tasks', taskId));
    }, [userId, semesterId, reload]);

    return { tasks, toggleTask, saveTask, removeTask };
}
