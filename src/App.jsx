import { useState, useMemo, useEffect, useRef } from 'react';
import { doc, collection, updateDoc, writeBatch } from 'firebase/firestore';
import { db, isInitialized, clearConfig } from './lib/firebase';
import { addDays } from './lib/constants';
import { isOffline, offlineImportSemester, offlineUpdateSemester, getMode, setMode, clearMode } from './lib/store';
import { useAuth } from './hooks/useAuth';
import { useSemesters } from './hooks/useSemesters';
import { useTasks } from './hooks/useTasks';
import { useDeadlines } from './hooks/useDeadlines';
import { useToast, ToastProvider } from './components/Toast';
import AuthScreen from './components/AuthScreen';
import SetupScreen from './components/SetupScreen';
import Header from './components/Header';
import CoursePills from './components/CoursePills';
import DeadlinesSection from './components/DeadlinesSection';
import WeekCard from './components/WeekCard';
import TaskModal from './components/TaskModal';
import DeadlineModal from './components/DeadlineModal';
import ImportModal from './components/ImportModal';
import RoadmapView from './components/RoadmapView';
import { SemesterModal, WeekModal } from './components/SemesterModal';

function AppContent() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { semesters, current, currentId, loading: semLoading, switchSemester, createSemester, deleteSemester, reload } = useSemesters(user?.uid);
  const { tasks, toggleTask, saveTask, removeTask } = useTasks(user?.uid, currentId);
  const { deadlines, saveDeadline, removeDeadline } = useDeadlines(user?.uid, currentId);
  const showToast = useToast();

  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const weeksRef = useRef(null);

  // Derived data
  const weeks = useMemo(() => {
    if (!current?.weeks) return [];
    return Object.entries(current.weeks)
      .map(([num, data]) => ({ num: parseInt(num), ...data }))
      .sort((a, b) => a.num - b.num);
  }, [current]);

  const getWeekTasks = (weekNum) => {
    return tasks
      .filter(t => t.weekNum === weekNum)
      .filter(t => filter === 'All' || t.course === filter)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const courses = useMemo(() => {
    const set = new Set(tasks.map(t => t.course));
    return ['All', ...Array.from(set).sort()];
  }, [tasks]);

  const currentWeekNum = useMemo(() => {
    if (!current?.startDate) return 1;
    const diff = Math.floor((new Date() - new Date(current.startDate)) / 6048e5) + 1;
    const max = weeks.length > 0 ? Math.max(...weeks.map(w => w.num)) : 1;
    return Math.max(1, Math.min(max, diff));
  }, [current, weeks]);

  const progress = useMemo(() => {
    let d = 0, t = 0;
    weeks.forEach(w => {
      const wt = getWeekTasks(w.num);
      t += wt.length;
      d += wt.filter(x => x.done).length;
    });
    return t ? Math.round(d / t * 100) : 0;
  }, [weeks, tasks, filter]);

  // Scroll to current week on load
  useEffect(() => {
    if (weeks.length > 0) {
      const el = document.getElementById('wc' + currentWeekNum);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [currentId]);

  // ── Import JSON ──
  const handleImportJSON = async (data) => {
    try {
      if (isOffline()) {
        offlineImportSemester(data);
        reload();
        toast('✅ Semestre importado: ' + (data.semester.label || data.semester.name));
        return;
      }
      const semName = data.semester.name;
      const semRef = doc(collection(doc(db, 'users', user.uid), 'semesters'));
      await updateDoc(doc(db, 'users', user.uid), {}).catch(() => { });

      const { setDoc, addDoc, collection: col, serverTimestamp } = await import('firebase/firestore');
      await setDoc(semRef, {
        name: semName,
        label: data.semester.label || ('Semestre ' + semName),
        startDate: data.semester.startDate || '',
        endDate: data.semester.endDate || '',
        weeks: data.weeks || {},
        createdAt: serverTimestamp(),
      });

      const tasksCol = col(semRef, 'tasks');
      for (const task of data.tasks) {
        await addDoc(tasksCol, { ...task, done: task.done || false });
      }

      const dlCol = col(semRef, 'deadlines');
      for (const dl of data.deadlines) {
        await addDoc(dlCol, dl);
      }

      toast('✅ Semestre importado: ' + (data.semester.label || semName));
    } catch (err) {
      console.error(err);
      toast('Error al importar: ' + err.message);
    }
  };

  // ── Export JSON ──
  const handleExportJSON = () => {
    if (!current) return;
    const exportData = {
      semester: {
        name: current.name || '',
        label: current.label || '',
        startDate: current.startDate || '',
        endDate: current.endDate || '',
      },
      weeks: current.weeks || {},
      tasks: tasks.map(({ id, ...t }) => ({ weekNum: t.weekNum, course: t.course, text: t.text, order: t.order ?? 0, done: !!t.done })),
      deadlines: deadlines.map(({ id, ...d }) => ({ date: d.date, label: d.label, course: d.course, urgent: !!d.urgent, order: d.order ?? 0 })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uoc_planner_${current.name || 'semester'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON exportado', 'success');
  };

  // ── Week CRUD ──
  const saveWeek = async (num, startDate, endDate, title, isNew) => {
    try {
      const updatedWeeks = { ...(current.weeks || {}) };
      updatedWeeks[num] = { startDate, endDate, title };

      // Recalculate surrounding weeks
      const sorted = Object.keys(updatedWeeks).map(Number).sort((a, b) => a - b);
      const idx = sorted.indexOf(num);

      // Recalculate weeks BEFORE this one (going backward)
      for (let i = idx - 1; i >= 0; i--) {
        const wn = sorted[i];
        const prevWn = sorted[i + 1];
        const prevStart = updatedWeeks[prevWn].startDate;
        const newEnd = addDays(prevStart, -1);
        const newStart = addDays(newEnd, -6);
        updatedWeeks[wn] = { ...updatedWeeks[wn], startDate: newStart, endDate: newEnd };
      }

      // Recalculate weeks AFTER this one (going forward)
      for (let i = idx + 1; i < sorted.length; i++) {
        const wn = sorted[i];
        const prevWn = sorted[i - 1];
        const prevEnd = updatedWeeks[prevWn].endDate;
        const newStart = addDays(prevEnd, 1);
        const newEnd = addDays(newStart, 6);
        updatedWeeks[wn] = { ...updatedWeeks[wn], startDate: newStart, endDate: newEnd };
      }

      // Also update the semester's start/end dates
      const firstWeek = updatedWeeks[sorted[0]];
      const lastWeek = updatedWeeks[sorted[sorted.length - 1]];
      if (isOffline()) {
        offlineUpdateSemester(currentId, { weeks: updatedWeeks, startDate: firstWeek.startDate, endDate: lastWeek.endDate });
        reload();
      } else {
        await updateDoc(doc(db, 'users', user.uid, 'semesters', currentId), {
          weeks: updatedWeeks,
          startDate: firstWeek.startDate,
          endDate: lastWeek.endDate,
        });
      }

      const recalculated = sorted.length - 1;
      showToast(
        isNew ? 'Semana añadida' : `Semana actualizada${recalculated > 0 ? ` (${recalculated} semanas recalculadas)` : ''}`,
        'success'
      );
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  const removeWeek = async (num) => {
    if (!confirm('¿Eliminar esta semana y todas sus tareas?')) return;
    try {
      if (isOffline()) {
        const { offlineDeleteTask } = await import('./lib/store');
        tasks.filter(t => t.weekNum === num).forEach(t => offlineDeleteTask(currentId, t.id));
        const updatedWeeks = { ...(current.weeks || {}) };
        delete updatedWeeks[num];
        offlineUpdateSemester(currentId, { weeks: updatedWeeks });
        reload();
      } else {
        const batch = writeBatch(db);
        tasks.filter(t => t.weekNum === num).forEach(t =>
          batch.delete(doc(db, 'users', user.uid, 'semesters', currentId, 'tasks', t.id))
        );
        const updatedWeeks = { ...(current.weeks || {}) };
        delete updatedWeeks[num];
        batch.update(doc(db, 'users', user.uid, 'semesters', currentId), { weeks: updatedWeeks });
        await batch.commit();
      }
      showToast('Semana eliminada', 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  const resetAll = async () => {
    if (!confirm('¿Resetear todo el progreso de este semestre?')) return;
    try {
      if (isOffline()) {
        const { offlineUpdateTask } = await import('./lib/store');
        tasks.forEach(t => offlineUpdateTask(currentId, t.id, { done: false }));
        reload();
      } else {
        const batch = writeBatch(db);
        tasks.forEach(t => batch.update(doc(db, 'users', user.uid, 'semesters', currentId, 'tasks', t.id), { done: false }));
        await batch.commit();
      }
      showToast('Progreso reseteado', 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  // ── Wrapped CRUD with toasts ──
  const handleToggleTask = async (id, done) => {
    try { await toggleTask(id, done); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  const handleSaveTask = async (weekNum, course, text, id) => {
    try {
      await saveTask(weekNum, course, text, id);
      showToast(id ? 'Tarea actualizada' : 'Tarea añadida', 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try { await removeTask(id); showToast('Tarea eliminada', 'success'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  const handleSaveDeadline = async (date, label, course, urgent, id) => {
    try {
      await saveDeadline(date, label, course, urgent, id);
      showToast(id ? 'Entrega actualizada' : 'Entrega añadida', 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  const handleDeleteDeadline = async (id) => {
    if (!confirm('¿Eliminar esta entrega?')) return;
    try { await removeDeadline(id); showToast('Entrega eliminada', 'success'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  const handleCreateSemester = async (name) => {
    try {
      await createSemester(name);
      showToast(`Semestre "${name}" creado`, 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  // ── Loading / Auth states ──
  if (authLoading || semLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSignIn={signIn} onOffline={() => window.location.reload()} />;
  }

  const courseList = courses.filter(c => c !== 'All');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header semesters={semesters} currentId={currentId} onSwitch={switchSemester}
        onNewSemester={() => setModal({ type: 'semester' })} progress={progress} user={user} onSignOut={signOut}
        onImport={() => setModal({ type: 'import' })} onExport={handleExportJSON} />

      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-[57px] z-[9]">
        <CoursePills courses={courses} filter={filter} onFilter={setFilter} />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRoadmap(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg text-xs font-medium hover:shadow-md hover:-translate-y-0.5 transition-all">
            <span>📊</span> Roadmap
          </button>
        </div>

        <DeadlinesSection deadlines={deadlines}
          onAdd={() => setModal({ type: 'deadline' })}
          onEdit={dl => setModal({ type: 'deadline', dl })}
          onDelete={handleDeleteDeadline} />

        <div ref={weeksRef} className="space-y-2">
          {weeks.length === 0 && (
            <p className="text-center text-slate-400 py-8">Añade semanas para empezar</p>
          )}
          {weeks.map(w => {
            const wTasks = getWeekTasks(w.num);
            if (wTasks.length === 0 && filter !== 'All') return null;
            return (
              <div key={w.num} id={`wc${w.num}`}>
                <WeekCard week={w} tasks={wTasks} isCurrent={w.num === currentWeekNum}
                  onToggleTask={handleToggleTask}
                  onEditTask={task => setModal({ type: 'task', weekNum: w.num, task })}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={num => setModal({ type: 'task', weekNum: num })}
                  onEditWeek={num => setModal({ type: 'week', weekNum: num, week: current.weeks[num] })}
                  onDeleteWeek={removeWeek} />
              </div>
            );
          })}
        </div>

        <button onClick={() => setModal({ type: 'week', weekNum: Math.max(0, ...weeks.map(w => w.num)) + 1 })}
          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-all text-sm font-medium">
          + Añadir semana
        </button>
      </main>

      <footer className="max-w-3xl mx-auto px-4 py-6 text-center text-xs text-slate-400 space-x-2">
        <span>UOC Planner — by Edgar <a href="https://github.com/edbrsk/" target="_blank" rel="noopener" className="text-violet-500 hover:text-violet-600 transition-colors">@edbrsk</a></span>
        <span>·</span>
        <button onClick={() => window.print()} className="underline hover:text-slate-600">Imprimir</button>
        <span>·</span>
        <button onClick={resetAll} className="underline hover:text-red-500">Reset semestre</button>
        <span>·</span>
        <button onClick={() => {
          if (isOffline()) {
            clearConfig();
            clearMode();
            window.location.reload();
            return;
          }
          setTimeout(async () => {
            if (!window.confirm('¿Cambiar configuración? Se cerrará la sesión.')) return;
            try { await signOut(); } catch { }
            clearConfig();
            clearMode();
            window.location.reload();
          }, 0);
        }} className="underline hover:text-slate-600">Cambiar configuración</button>
      </footer>

      {/* ── Modals ── */}
      {modal?.type === 'task' && (
        <TaskModal weekNum={modal.weekNum} task={modal.task} courses={courseList.length > 0 ? courseList : ['AL', 'Prob', 'Prog', 'Redes', 'Lab']}
          onSave={handleSaveTask} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'deadline' && (
        <DeadlineModal deadline={modal.dl} courses={courseList.length > 0 ? courseList : ['AL', 'Prob', 'Prog', 'Redes', 'Lab']}
          onSave={handleSaveDeadline} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'semester' && (
        <SemesterModal onSave={handleCreateSemester} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'import' && (
        <ImportModal onImport={handleImportJSON} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'week' && (
        <WeekModal weekNum={modal.weekNum} week={modal.week} semesterName={current?.name}
          onSave={saveWeek} onClose={() => setModal(null)} />
      )}

      {showRoadmap && (
        <RoadmapView deadlines={deadlines} tasks={tasks} weeks={weeks} onClose={() => setShowRoadmap(false)} />
      )}
    </div>
  );
}

export default function App() {
  // Auto-migrate: if Firebase was configured before offline mode existed, set the mode
  const [configReady, setConfigReady] = useState(() => {
    const mode = getMode();
    if (mode) return true; // mode already set (either 'firebase' or 'offline')
    if (isInitialized()) { setMode('firebase'); return true; } // legacy: was configured before mode existed
    return false;
  });

  if (!configReady) {
    return <SetupScreen onConfigured={() => setConfigReady(true)} />;
  }

  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
