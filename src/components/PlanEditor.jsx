import { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, X, Plus, Search, Trash2, Check } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { ExerciseMedia } from './ExerciseMedia.jsx';
import { Sheet, Button, ConfirmButton, Plate } from './ui.jsx';

const PLATES = [
  { value: 'red', label: 'Vermelha' },
  { value: 'blue', label: 'Azul' },
  { value: 'yellow', label: 'Amarela' },
  { value: 'black', label: 'Preta' },
];

const nextLetter = (plans) => {
  const used = new Set(plans.map((p) => p.letter));
  return 'ABCDEFGH'.split('').find((l) => !used.has(l)) || '';
};

export function PlanEditor({ plan, onClose }) {
  const { state, actions, notify } = useStore();
  const editing = !!plan?.id;
  const [form, setForm] = useState(() =>
    plan
      ? { ...plan, items: plan.items.map((i) => ({ ...i })) }
      : { letter: nextLetter(state.plans), name: '', plate: PLATES[state.plans.length % PLATES.length].value, items: [] }
  );
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');
  const exById = useMemo(() => Object.fromEntries(state.exercises.map((e) => [e.id, e])), [state.exercises]);

  const setItem = (idx, patch) => setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  const move = (idx, dir) =>
    setForm((f) => {
      const items = [...f.items];
      const j = idx + dir;
      if (j < 0 || j >= items.length) return f;
      [items[idx], items[j]] = [items[j], items[idx]];
      return { ...f, items };
    });
  const toggleExercise = (id) =>
    setForm((f) =>
      f.items.some((i) => i.exerciseId === id)
        ? { ...f, items: f.items.filter((i) => i.exerciseId !== id) }
        : { ...f, items: [...f.items, { exerciseId: id, sets: 3, reps: 12, load: 0, rest: state.settings.restSeconds }] }
    );

  const save = () => {
    if (!form.letter.trim() || !form.name.trim()) {
      setError('Preencha a letra e o nome da ficha.');
      return;
    }
    actions.savePlan({ ...form, letter: form.letter.trim().toUpperCase(), name: form.name.trim() });
    notify(editing ? 'Ficha atualizada' : 'Ficha criada');
    onClose();
  };

  if (picking)
    return (
      <ExercisePicker
        exercises={state.exercises}
        selected={new Set(form.items.map((i) => i.exerciseId))}
        onToggle={toggleExercise}
        onDone={() => setPicking(false)}
      />
    );

  return (
    <Sheet
      open
      wide
      onClose={onClose}
      title={editing ? `Editar treino ${plan.letter}` : 'Nova ficha'}
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={save}>
            {editing ? 'Salvar ficha' : 'Criar ficha'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-[80px_1fr] gap-3">
          <label htmlFor="plan-letter" className="flex flex-col gap-1 text-sm font-medium">
            Letra
            <input id="plan-letter" maxLength={2} className="field num text-xl text-center uppercase font-bold" value={form.letter} onChange={(e) => setForm({ ...form, letter: e.target.value })} />
          </label>
          <label htmlFor="plan-name" className="flex flex-col gap-1 text-sm font-medium">
            Nome da ficha
            <input id="plan-name" className="field" placeholder="Ex.: Peito e tríceps" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-medium mb-2">Cor da anilha</legend>
          <div className="flex gap-3">
            {PLATES.map((p) => (
              <button
                key={p.value}
                type="button"
                aria-pressed={form.plate === p.value}
                aria-label={p.label}
                title={p.label}
                onClick={() => setForm({ ...form, plate: p.value })}
                className={`rounded-full p-0.5 border-2 ${form.plate === p.value ? 'border-ink' : 'border-transparent'}`}
              >
                <Plate letter={form.letter || '?'} plate={p.value} size={42} />
              </button>
            ))}
          </div>
        </fieldset>
        {error && <p className="text-sm text-red -mt-2">{error}</p>}

        <section aria-label="Exercícios da ficha" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Exercícios ({form.items.length})</h3>
            <Button size="sm" variant="outline" onClick={() => setPicking(true)}>
              <Plus size={15} /> Adicionar
            </Button>
          </div>
          {!form.items.length && <p className="text-sm text-muted">Adicione exercícios da sua biblioteca.</p>}
          <ol className="flex flex-col gap-2">
            {form.items.map((it, idx) => {
              const ex = exById[it.exerciseId];
              return (
                <li key={it.exerciseId} className="card p-2.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <ExerciseMedia media={ex?.media} alt="" animate={false} className="h-11 w-11 flex-none" rounded="rounded-lg" iconSize={16} />
                    <span className="min-w-0 flex-1 font-semibold text-[15px] leading-tight">{ex?.name || 'Exercício removido'}</span>
                    <div className="flex">
                      <button type="button" aria-label="Mover para cima" disabled={idx === 0} onClick={() => move(idx, -1)} className="h-8 w-8 grid place-items-center text-muted hover:text-ink disabled:opacity-30">
                        <ArrowUp size={16} />
                      </button>
                      <button type="button" aria-label="Mover para baixo" disabled={idx === form.items.length - 1} onClick={() => move(idx, 1)} className="h-8 w-8 grid place-items-center text-muted hover:text-ink disabled:opacity-30">
                        <ArrowDown size={16} />
                      </button>
                      <button type="button" aria-label="Remover da ficha" onClick={() => toggleExercise(it.exerciseId)} className="h-8 w-8 grid place-items-center text-muted hover:text-red">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ['sets', 'Séries'],
                      ['reps', 'Reps'],
                      ['load', 'Carga kg'],
                      ['rest', 'Descanso s'],
                    ].map(([key, label]) => (
                      <label key={key} htmlFor={`pi-${idx}-${key}`} className="flex flex-col gap-0.5 text-[11px] font-semibold text-muted">
                        {label}
                        <input
                          id={`pi-${idx}-${key}`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          className="field num text-lg text-center !py-1.5 !px-1"
                          value={it[key]}
                          onChange={(e) => setItem(idx, { [key]: e.target.value === '' ? '' : Number(e.target.value) })}
                        />
                      </label>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {editing && (
          <section className="border-t border-line pt-4">
            <ConfirmButton
              icon={<Trash2 size={15} />}
              label="Excluir ficha"
              question="Excluir esta ficha? O histórico é mantido."
              confirmLabel="Excluir"
              onConfirm={() => {
                actions.deletePlan(plan.id);
                notify('Ficha excluída');
                onClose();
              }}
            />
          </section>
        )}
      </div>
    </Sheet>
  );
}

function ExercisePicker({ exercises, selected, onToggle, onDone }) {
  const [q, setQ] = useState('');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = exercises.filter((e) => norm(`${e.name} ${e.muscle}`).includes(norm(q))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return (
    <Sheet
      open
      wide
      onClose={onDone}
      title="Adicionar exercícios"
      footer={
        <Button className="flex-1" onClick={onDone}>
          Concluir ({selected.size} na ficha)
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <label htmlFor="pick-search" className="relative">
          <span className="sr-only">Filtrar exercícios</span>
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input id="pick-search" className="field pl-9" placeholder="Filtrar por nome ou músculo" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <p className="text-xs text-muted">Precisa de um exercício novo? Cadastre na aba Exercícios e volte aqui.</p>
        <ul className="flex flex-col gap-1.5">
          {list.map((e) => {
            const on = selected.has(e.id);
            return (
              <li key={e.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggle(e.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left ${on ? 'border-green bg-green-soft' : 'border-line bg-surface hover:bg-surface-2'}`}
                >
                  <ExerciseMedia media={e.media} alt="" animate={false} className="h-11 w-11 flex-none" rounded="rounded-lg" iconSize={16} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[15px] leading-tight">{e.name}</span>
                    <span className="block text-sm text-muted">{e.muscle}</span>
                  </span>
                  <span className={`h-7 w-7 rounded-full grid place-items-center border-2 ${on ? 'bg-green border-green text-white' : 'border-line'}`}>{on && <Check size={15} strokeWidth={3} />}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Sheet>
  );
}
