import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { APP, SERIES } from '../config/app.config.js';
import { SEED_EXERCISES, SEED_PLANS, buildDemoSessions } from '../data/seed.js';
import { loadState, saveState, clearState } from '../lib/storage.js';
import { uid } from '../lib/ids.js';
import { lastPerformance } from '../lib/stats.js';

const StoreContext = createContext(null);
const VERSION = 1;

function freshState() {
  return {
    version: VERSION,
    exercises: SEED_EXERCISES,
    plans: SEED_PLANS,
    sessions: buildDemoSessions(SEED_PLANS, SEED_EXERCISES),
    active: null,
    settings: { seriesDueDate: null, seriesLabel: null, restSeconds: APP.defaultRestSeconds },
  };
}

function hydrate() {
  const saved = loadState();
  if (!saved || saved.version !== VERSION) return freshState();
  const base = freshState();
  return { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) } };
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(hydrate);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ message, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const actions = useMemo(
    () => ({
      saveExercise(exercise) {
        const id = exercise.id || uid('ex');
        setState((s) => {
          const exists = s.exercises.some((e) => e.id === id);
          const next = { ...exercise, id };
          return {
            ...s,
            exercises: exists ? s.exercises.map((e) => (e.id === id ? next : e)) : [...s.exercises, next],
          };
        });
        return id;
      },
      deleteExercise(id) {
        setState((s) => ({
          ...s,
          exercises: s.exercises.filter((e) => e.id !== id),
          plans: s.plans.map((p) => ({ ...p, items: p.items.filter((i) => i.exerciseId !== id) })),
        }));
      },
      savePlan(plan) {
        const id = plan.id || uid('plan');
        setState((s) => {
          const exists = s.plans.some((p) => p.id === id);
          const next = { ...plan, id };
          return { ...s, plans: exists ? s.plans.map((p) => (p.id === id ? next : p)) : [...s.plans, next] };
        });
        return id;
      },
      deletePlan(id) {
        setState((s) => ({ ...s, plans: s.plans.filter((p) => p.id !== id) }));
      },
      startWorkout(planId) {
        setState((s) => {
          const plan = s.plans.find((p) => p.id === planId);
          if (!plan) return s;
          const names = Object.fromEntries(s.exercises.map((e) => [e.id, e.name]));
          const entries = plan.items
            .filter((item) => names[item.exerciseId])
            .map((item) => {
              const last = lastPerformance(s.sessions, item.exerciseId);
              return {
                exerciseId: item.exerciseId,
                name: names[item.exerciseId],
                target: { sets: item.sets, reps: item.reps, load: item.load, rest: item.rest },
                sets: Array.from({ length: item.sets }, (_, i) => ({
                  load: last ? Number(last.sets[Math.min(i, last.sets.length - 1)].load) : Number(item.load) || 0,
                  reps: Number(item.reps) || 0,
                  done: false,
                })),
              };
            });
          return {
            ...s,
            active: {
              id: uid('sess'),
              planId: plan.id,
              planName: plan.name,
              letter: plan.letter,
              plate: plan.plate,
              startedAt: new Date().toISOString(),
              entries,
              rest: null,
            },
          };
        });
      },
      updateActive(updater) {
        setState((s) => (s.active ? { ...s, active: updater(s.active) } : s));
      },
      cancelWorkout() {
        setState((s) => ({ ...s, active: null }));
      },
      finishWorkout(effort) {
        const removedDemo = stateRef.current.sessions.some((x) => x.demo);
        setState((s) => {
          if (!s.active) return s;
          const finishedAt = new Date();
          const { rest, ...active } = s.active;
          const session = {
            ...active,
            entries: active.entries.map(({ target, ...e }) => e),
            finishedAt: finishedAt.toISOString(),
            durationSec: Math.round((finishedAt - new Date(active.startedAt)) / 1000),
            effort,
          };
          return { ...s, active: null, sessions: [...s.sessions.filter((x) => !x.demo), session] };
        });
        return removedDemo;
      },
      deleteSession(id) {
        setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
      },
      clearDemo() {
        setState((s) => ({ ...s, sessions: s.sessions.filter((x) => !x.demo) }));
      },
      updateSettings(patch) {
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
      },
      importData(data) {
        if (!data || !Array.isArray(data.exercises) || !Array.isArray(data.plans) || !Array.isArray(data.sessions)) {
          throw new Error('Arquivo inválido: faltam exercícios, fichas ou histórico.');
        }
        setState({ ...freshState(), ...data, version: VERSION, active: null });
      },
      resetAll() {
        clearState();
        setState(freshState());
      },
    }),
    []
  );

  const series = {
    label: state.settings.seriesLabel || SERIES.label,
    dueDate: state.settings.seriesDueDate || SERIES.dueDate,
    fromConfig: !state.settings.seriesDueDate,
  };

  const value = { state, series, actions, toast, notify };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore precisa estar dentro de <StoreProvider>');
  return ctx;
}
