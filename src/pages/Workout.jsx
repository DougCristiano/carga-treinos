import { useMemo, useState, useEffect, useRef } from 'react';
import { Flag, Timer, X, ChevronRight, Plus } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { ExerciseRunCard } from '../components/ExerciseRunCard.jsx';
import { EffortScreen } from '../components/EffortScreen.jsx';
import { Plate, Button, ConfirmButton, Empty } from '../components/ui.jsx';
import { suggestedPlan, lastPerformance } from '../lib/stats.js';
import { formatDuration, relativeDay } from '../lib/dates.js';
import { useNow } from '../lib/useNow.js';

export default function Workout({ navigate }) {
  const { state } = useStore();
  return state.active ? <ActiveWorkout navigate={navigate} /> : <PlanPicker navigate={navigate} />;
}

function PlanPicker({ navigate }) {
  const { state, actions } = useStore();
  const { plans, sessions } = state;
  const suggested = suggestedPlan(plans, sessions);
  const lastByPlan = useMemo(() => {
    const m = {};
    for (const s of sessions) if (!m[s.planId] || s.startedAt > m[s.planId]) m[s.planId] = s.startedAt;
    return m;
  }, [sessions]);

  return (
    <>
      <PageHeader title="Treinar" subtitle="Escolha a ficha de hoje" />
      <div className="gutter pt-4 flex flex-col gap-2">
        {plans.length === 0 && (
          <Empty title="Nenhuma ficha cadastrada" action={<Button onClick={() => navigate('exercicios')}><Plus size={16} /> Criar ficha</Button>}>
            Monte uma ficha com seus exercícios para começar.
          </Empty>
        )}
        {plans.map((p) => {
          const isSuggested = suggested?.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={!p.items.length}
              onClick={() => actions.startWorkout(p.id)}
              className={`card p-4 flex items-center gap-3 text-left hover:bg-surface-2 transition-colors disabled:opacity-50 ${isSuggested ? 'raised border-ink/30' : ''}`}
            >
              <Plate letter={p.letter} plate={p.plate} size={52} />
              <span className="min-w-0 flex-1">
                {isSuggested && <span className="inline-block text-xs font-semibold text-red mb-0.5">Sugerido para hoje</span>}
                <span className="block font-display text-2xl font-semibold leading-tight">Treino {p.letter}</span>
                <span className="block text-sm text-muted truncate">{p.name}</span>
                <span className="block text-sm text-muted">
                  {p.items.length} exercícios{lastByPlan[p.id] ? `, feito ${relativeDay(lastByPlan[p.id])}` : ', ainda não realizado'}
                </span>
              </span>
              <ChevronRight size={20} className="text-muted" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </>
  );
}

function ActiveWorkout({ navigate }) {
  const { state, actions, notify } = useStore();
  const { active, exercises, sessions, settings } = state;
  const [openIdx, setOpenIdx] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const now = useNow(1000);

  const exById = useMemo(() => Object.fromEntries(exercises.map((e) => [e.id, e])), [exercises]);
  const lastById = useMemo(
    () => Object.fromEntries(active.entries.map((e) => [e.exerciseId, lastPerformance(sessions, e.exerciseId)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, active.id]
  );

  const doneEntries = active.entries.filter((e) => e.sets.length && e.sets.every((s) => s.done)).length;
  const elapsed = (now - new Date(active.startedAt)) / 1000;

  const patchEntry = (idx, fn) =>
    actions.updateActive((a) => ({ ...a, entries: a.entries.map((e, i) => (i === idx ? fn(e) : e)) }));

  const toggleSet = (idx, setIdx) => {
    const entry = active.entries[idx];
    const willBeDone = !entry.sets[setIdx].done;
    const sets = entry.sets.map((s, i) => (i === setIdx ? { ...s, done: willBeDone } : s));
    const entryComplete = sets.every((s) => s.done);
    const allComplete = active.entries.every((e, i) => (i === idx ? entryComplete : e.sets.every((s) => s.done)));
    const restSec = Number(entry.target?.rest) || settings.restSeconds;

    actions.updateActive((a) => ({
      ...a,
      entries: a.entries.map((e, i) => (i === idx ? { ...e, sets } : e)),
      rest: willBeDone && !allComplete && restSec > 0 ? { endAt: Date.now() + restSec * 1000, total: restSec } : a.rest,
    }));

    if (willBeDone && entryComplete) {
      setOpenIdx(null);
      if (allComplete) notify('Todos os exercícios concluídos. Finalize o treino.');
    }
  };

  const save = (effort) => {
    const removedDemo = actions.finishWorkout(effort);
    notify(removedDemo ? 'Treino salvo. Os exemplos foram removidos.' : 'Treino salvo');
    navigate('inicio');
  };

  return (
    <>
      <PageHeader
        title={`Treino ${active.letter}`}
        subtitle={active.planName}
        actions={
          <span className="num text-2xl font-bold tabular-nums px-2" aria-label="Tempo de treino">
            {formatDuration(elapsed)}
          </span>
        }
      >
        <div className="flex gap-1" aria-label={`${doneEntries} de ${active.entries.length} exercícios concluídos`} role="img">
          {active.entries.map((e, i) => {
            const done = e.sets.every((s) => s.done);
            const partial = !done && e.sets.some((s) => s.done);
            return <span key={i} className={`h-1.5 flex-1 rounded-full ${done ? 'bg-green' : partial ? 'bg-green/40' : 'bg-surface-2'}`} />;
          })}
        </div>
      </PageHeader>

      <div className="gutter pt-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Plate letter={active.letter} plate={active.plate} size={36} />
          <p className="text-sm text-muted flex-1">
            <span className="num text-lg font-bold text-ink">{doneEntries}</span> de {active.entries.length} exercícios. Toque em um exercício para abrir as séries.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {active.entries.map((entry, idx) => (
            <ExerciseRunCard
              key={entry.exerciseId + idx}
              index={idx}
              entry={entry}
              exercise={exById[entry.exerciseId]}
              last={lastById[entry.exerciseId]}
              open={openIdx === idx}
              onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
              onSetChange={(i, patch) => patchEntry(idx, (e) => ({ ...e, sets: e.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) }))}
              onToggleSet={(i) => toggleSet(idx, i)}
              onAddSet={() =>
                patchEntry(idx, (e) => ({ ...e, sets: [...e.sets, { ...(e.sets[e.sets.length - 1] || { load: 0, reps: 10 }), done: false }] }))
              }
              onRemoveSet={() => patchEntry(idx, (e) => ({ ...e, sets: e.sets.slice(0, -1) }))}
            />
          ))}
        </ul>

        <div className="flex flex-col gap-2 pt-2">
          <Button size="lg" variant={doneEntries === active.entries.length ? 'success' : 'dark'} onClick={() => setFinishing(true)}>
            <Flag size={18} /> Finalizar treino
          </Button>
          <ConfirmButton
            className="self-center"
            variant="ghost"
            label="Descartar treino"
            question="Descartar sem salvar?"
            confirmLabel="Descartar"
            onConfirm={() => {
              actions.cancelWorkout();
              notify('Treino descartado');
            }}
          />
        </div>
      </div>

      {active.rest && <RestTimer rest={active.rest} onChange={(rest) => actions.updateActive((a) => ({ ...a, rest }))} />}
      {finishing && <EffortScreen active={active} onBack={() => setFinishing(false)} onSave={save} />}
    </>
  );
}

function RestTimer({ rest, onChange }) {
  const now = useNow(250);
  const remaining = Math.max(0, Math.ceil((rest.endAt - now) / 1000));
  const over = remaining === 0;
  const buzzed = useRef(false);

  useEffect(() => {
    if (over && !buzzed.current) {
      buzzed.current = true;
      try {
        navigator.vibrate?.([180, 80, 180]);
      } catch {
        /* sem vibração */
      }
      const t = setTimeout(() => onChange(null), 4000);
      return () => clearTimeout(t);
    }
    if (!over) buzzed.current = false;
  }, [over, onChange]);

  const pct = Math.min(100, ((rest.total - remaining) / rest.total) * 100);

  return (
    <div
      className="fixed left-0 right-0 z-30 flex justify-center pointer-events-none"
      style={{ bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))', paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
    >
      <div role="timer" aria-live="polite" className={`pointer-events-auto relative overflow-hidden flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full shadow-lg ${over ? 'bg-green text-white' : 'bg-ink text-bg'}`}>
        <span className="absolute inset-y-0 left-0 bg-white/12" style={{ width: `${pct}%` }} aria-hidden="true" />
        <Timer size={17} className="relative" aria-hidden="true" />
        <span className="relative text-sm font-semibold">{over ? 'Descanso concluído' : 'Descanso'}</span>
        {!over && <span className="relative num text-2xl font-bold w-[64px] text-center">{formatDuration(remaining)}</span>}
        {!over && (
          <button type="button" onClick={() => onChange({ ...rest, endAt: rest.endAt + 15000, total: rest.total + 15 })} className="relative h-8 px-2.5 rounded-full bg-white/15 text-sm font-semibold">
            +15s
          </button>
        )}
        <button type="button" onClick={() => onChange(null)} aria-label="Encerrar descanso" className="relative h-8 w-8 rounded-full bg-white/15 grid place-items-center">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
