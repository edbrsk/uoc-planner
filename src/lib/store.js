// ── Offline localStorage data store ──
// Mirrors the Firestore structure: semesters → tasks/deadlines

const STORE_KEY = 'uoc_planner_offline_data';
const MODE_KEY = 'uoc_planner_mode'; // 'firebase' | 'offline'

// ── Mode ──

export function getMode() {
    return localStorage.getItem(MODE_KEY) || null;
}

export function setMode(mode) {
    localStorage.setItem(MODE_KEY, mode);
}

export function clearMode() {
    localStorage.removeItem(MODE_KEY);
}

export function isOffline() {
    return getMode() === 'offline';
}

// ── Store CRUD ──

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getStore() {
    try {
        return JSON.parse(localStorage.getItem(STORE_KEY)) || { semesters: {}, lastSemId: null };
    } catch { return { semesters: {}, lastSemId: null }; }
}

function saveStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

// ── Semesters ──

export function offlineGetSemesters() {
    const store = getStore();
    return Object.entries(store.semesters).map(([id, data]) => ({
        id,
        ...data,
        tasks: undefined,
        deadlines: undefined,
    }));
}

export function offlineGetLastSemId() {
    return getStore().lastSemId;
}

export function offlineSetLastSemId(id) {
    const store = getStore();
    store.lastSemId = id;
    saveStore(store);
}

export function offlineGetSemester(id) {
    const store = getStore();
    const sem = store.semesters[id];
    if (!sem) return null;
    return { id, ...sem, tasks: undefined, deadlines: undefined };
}

export function offlineCreateSemester(name) {
    const store = getStore();
    const id = genId();
    store.semesters[id] = {
        name,
        label: 'Semestre ' + name,
        startDate: '',
        endDate: '',
        weeks: {},
        tasks: [],
        deadlines: [],
        createdAt: new Date().toISOString(),
    };
    store.lastSemId = id;
    saveStore(store);
    return id;
}

export function offlineUpdateSemester(id, updates) {
    const store = getStore();
    if (!store.semesters[id]) return;
    Object.assign(store.semesters[id], updates);
    saveStore(store);
}

export function offlineDeleteSemester(id) {
    const store = getStore();
    delete store.semesters[id];
    if (store.lastSemId === id) {
        const ids = Object.keys(store.semesters);
        store.lastSemId = ids.length > 0 ? ids[0] : null;
    }
    saveStore(store);
    return store.lastSemId;
}

// ── Tasks ──

export function offlineGetTasks(semId) {
    const store = getStore();
    return (store.semesters[semId]?.tasks || []).map(t => ({ ...t }));
}

export function offlineAddTask(semId, task) {
    const store = getStore();
    if (!store.semesters[semId]) return null;
    const id = genId();
    store.semesters[semId].tasks.push({ id, ...task, done: task.done || false });
    saveStore(store);
    return id;
}

export function offlineUpdateTask(semId, taskId, updates) {
    const store = getStore();
    const tasks = store.semesters[semId]?.tasks;
    if (!tasks) return;
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx >= 0) Object.assign(tasks[idx], updates);
    saveStore(store);
}

export function offlineDeleteTask(semId, taskId) {
    const store = getStore();
    const sem = store.semesters[semId];
    if (!sem) return;
    sem.tasks = sem.tasks.filter(t => t.id !== taskId);
    saveStore(store);
}

// ── Deadlines ──

export function offlineGetDeadlines(semId) {
    const store = getStore();
    return (store.semesters[semId]?.deadlines || []).map(d => ({ ...d }));
}

export function offlineAddDeadline(semId, dl) {
    const store = getStore();
    if (!store.semesters[semId]) return null;
    const id = genId();
    store.semesters[semId].deadlines.push({ id, ...dl });
    saveStore(store);
    return id;
}

export function offlineUpdateDeadline(semId, dlId, updates) {
    const store = getStore();
    const dls = store.semesters[semId]?.deadlines;
    if (!dls) return;
    const idx = dls.findIndex(d => d.id === dlId);
    if (idx >= 0) Object.assign(dls[idx], updates);
    saveStore(store);
}

export function offlineDeleteDeadline(semId, dlId) {
    const store = getStore();
    const sem = store.semesters[semId];
    if (!sem) return;
    sem.deadlines = sem.deadlines.filter(d => d.id !== dlId);
    saveStore(store);
}

// ── Import (creates a full semester from JSON) ──

export function offlineImportSemester(data) {
    const store = getStore();
    const id = genId();
    const tasks = (data.tasks || []).map(t => ({ id: genId(), ...t, done: t.done || false }));
    const deadlines = (data.deadlines || []).map(d => ({ id: genId(), ...d }));
    store.semesters[id] = {
        name: data.semester.name,
        label: data.semester.label || ('Semestre ' + data.semester.name),
        startDate: data.semester.startDate || '',
        endDate: data.semester.endDate || '',
        weeks: data.weeks || {},
        tasks,
        deadlines,
        createdAt: new Date().toISOString(),
    };
    store.lastSemId = id;
    saveStore(store);
    return id;
}
