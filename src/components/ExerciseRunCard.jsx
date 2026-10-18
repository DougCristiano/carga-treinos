import { Check, ChevronDown, Plus, Minus, History } from 'lucide-react';
import { ExerciseMedia } from './ExerciseMedia.jsx';
import { Stepper } from './ui.jsx';
import { formatShort } from '../lib/dates.js';

/**
 * Card do acordeão na execução do treino. Começa fechado; ao marcar a
 * última série, o card fecha sozinho e fica verde com o check.
 */
export function ExerciseRunCard({ entry, index, exercise, last, open, onToggle, onSetChange, onToggleSet, onAddSet, onRemoveSet }) {
  const doneCount = entry.sets.filter((s) => s.done).length;
  const complete = entry.sets.length > 0 && doneCount === entry.sets.length;
  const loads = [...new Set(entry.sets.map((s) => Number(s.load) || 0))];
  const loadText = loads.length === 1 ? `${loads[0].toLocaleString('pt-BR')} kg` : `${Math.min(...loads)}–${Math.max(...loads)} kg`;
  const bodyId = `ex-body-${index}`;

  return (
    <li className={`card transition-colors duration-300 ${complete ? 'done-card' : ''} ${open ? 'raised' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <ExerciseMedia media={exercise?.media} alt="" animate={false} className="h-14 w-14 flex-none" rounded="rounded-lg" iconSize={20} />
        <span className="min-w-0 flex-1">
          <span className={`block font-semibold leading-snug ${complete ? 'text-green' : ''}`}>{entry.name}</span>
          <span className="block text-sm text-muted num text-[15px]">
            {complete ? `${entry.sets.length} séries concluídas` : `${entry.sets.length} × ${entry.target?.reps ?? entry.sets[0]?.reps} reps · ${loadText}`}
          </span>
        </span>
        {complete ? (
          <span className="pop grid place-items-center h-9 w-9 rounded-full bg-green text-white flex-none" aria-label="Concluído">
            <Check size={20} strokeWidth={3} />
          </span>
        ) : (
          <span className="flex items-center gap-1.5 flex-none">
            {doneCount > 0 && (
              <span className="num text-[15px] font-semibold text-muted" aria-label={`${doneCount} de ${entry.sets.length} séries`}>
                {doneCount}/{entry.sets.length}
              </span>
            )}
            <ChevronDown size={20} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </span>
        )}
      </button>

      <div className="acc-body" data-open={open} id={bodyId}>
        <div>
          <div className="px-3 pb-3 flex flex-col gap-3">
            {open && (
              <ExerciseMedia media={exercise?.media} alt={`Demonstração: ${entry.name}`} className="w-full aspect-[4/3] max-h-64 border border-line" />
            )}
            {exercise?.notes && <p className="text-sm text-muted">{exercise.notes}</p>}
            {last && (
              <p className="text-sm text-muted">
                <History size={14} className="inline -mt-0.5 mr-1" aria-hidden="true" />
                Última vez ({formatShort(last.date)}):{' '}
                <span className="num text-[15px] text-ink">
                  {last.sets.map((s) => `${s.load}×${s.reps}`).join(' · ')}
                </span>
              </p>
            )}

            <div role="table" aria-label={`Séries de ${entry.name}`} className="flex flex-col gap-1.5">
              <div role="row" className="grid grid-cols-[28px_1fr_1fr_44px] gap-2 text-xs font-semibold text-muted px-0.5">
                <span role="columnheader">Série</span>
                <span role="columnheader" className="text-center">Carga (kg)</span>
                <span role="columnheader" className="text-center">Reps</span>
                <span role="columnheader" className="sr-only">Feita</span>
              </div>
              {entry.sets.map((set, i) => (
                <div
                  role="row"
                  key={i}
                  className={`grid grid-cols-[28px_1fr_1fr_44px] gap-2 items-center rounded-lg p-0.5 ${set.done ? 'opacity-70' : ''}`}
                >
                  <span role="cell" className="num text-xl font-bold text-center text-muted">
                    {i + 1}
                  </span>
                  <span role="cell">
                    <Stepper
                      id={`set-${index}-${i}-load`}
                      compact
                      label={`carga da série ${i + 1}`}
                      value={set.load}
                      step={Number(set.load) >= 20 ? 2.5 : 1}
                      onChange={(v) => onSetChange(i, { load: v })}
                    />
                  </span>
                  <span role="cell">
                    <Stepper id={`set-${index}-${i}-reps`} compact label={`repetições da série ${i + 1}`} value={set.reps} onChange={(v) => onSetChange(i, { reps: v })} />
                  </span>
                  <span role="cell">
                    <button
                      type="button"
                      onClick={() => onToggleSet(i)}
                      aria-pressed={set.done}
                      aria-label={set.done ? `Desmarcar série ${i + 1}` : `Concluir série ${i + 1}`}
                      className={`h-11 w-11 rounded-xl grid place-items-center border-2 transition-colors ${
                        set.done ? 'bg-green border-green text-white' : 'border-line text-muted hover:border-green hover:text-green'
                      }`}
                    >
                      <Check size={22} strokeWidth={3} />
                    </button>
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={onAddSet} className="flex-1 h-9 rounded-lg border border-dashed border-line text-sm font-semibold text-muted hover:text-ink inline-flex items-center justify-center gap-1">
                <Plus size={15} /> Série
              </button>
              {entry.sets.length > 1 && (
                <button type="button" onClick={onRemoveSet} className="flex-1 h-9 rounded-lg border border-dashed border-line text-sm font-semibold text-muted hover:text-ink inline-flex items-center justify-center gap-1">
                  <Minus size={15} /> Remover última
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
