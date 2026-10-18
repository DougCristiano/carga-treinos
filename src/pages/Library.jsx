import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, ChevronRight } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { ExerciseMedia } from '../components/ExerciseMedia.jsx';
import { ExerciseEditor } from '../components/ExerciseEditor.jsx';
import { PlanEditor } from '../components/PlanEditor.jsx';
import { Segmented, Button, Plate, Empty } from '../components/ui.jsx';
import { MUSCLE_GROUPS } from '../data/muscles.js';

export default function Library() {
  const [tab, setTab] = useState('fichas');
  const [editingExercise, setEditingExercise] = useState(undefined);
  const [editingPlan, setEditingPlan] = useState(undefined);

  return (
    <>
      <PageHeader
        title={tab === 'fichas' ? 'Fichas' : 'Exercícios'}
        subtitle="Monte e ajuste sua série"
        actions={
          <Button size="sm" onClick={() => (tab === 'fichas' ? setEditingPlan(null) : setEditingExercise(null))}>
            <Plus size={16} /> {tab === 'fichas' ? 'Ficha' : 'Exercício'}
          </Button>
        }
      >
        <Segmented
          label="Seção"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'fichas', label: 'Fichas de treino' },
            { value: 'exercicios', label: 'Biblioteca de exercícios' },
          ]}
        />
      </PageHeader>

      <div className="gutter pt-4">
        {tab === 'fichas' ? <PlanList onEdit={setEditingPlan} /> : <ExerciseList onEdit={setEditingExercise} />}
      </div>

      {editingExercise !== undefined && <ExerciseEditor exercise={editingExercise} onClose={() => setEditingExercise(undefined)} />}
      {editingPlan !== undefined && <PlanEditor plan={editingPlan} onClose={() => setEditingPlan(undefined)} />}
    </>
  );
}

function PlanList({ onEdit }) {
  const { state } = useStore();
  const exById = useMemo(() => Object.fromEntries(state.exercises.map((e) => [e.id, e])), [state.exercises]);
  if (!state.plans.length)
    return (
      <Empty title="Nenhuma ficha ainda" action={<Button onClick={() => onEdit(null)}><Plus size={16} /> Criar ficha</Button>}>
        Uma ficha agrupa os exercícios de um dia de treino, como Treino A, B e C.
      </Empty>
    );
  return (
    <ul className="flex flex-col gap-3">
      {state.plans.map((p) => (
        <li key={p.id} className="card overflow-hidden">
          <button type="button" onClick={() => onEdit(p)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2 transition-colors">
            <Plate letter={p.letter} plate={p.plate} size={52} />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-2xl font-semibold leading-tight">Treino {p.letter}</span>
              <span className="block text-sm text-muted truncate">{p.name}</span>
            </span>
            <Pencil size={17} className="text-muted" aria-hidden="true" />
          </button>
          <ol className="border-t border-line divide-y divide-line">
            {p.items.map((it, i) => (
              <li key={it.exerciseId} className="flex items-center gap-3 px-4 py-2">
                <span className="num text-base font-semibold text-muted w-4 text-right">{i + 1}</span>
                <span className="min-w-0 flex-1 text-[15px] truncate">{exById[it.exerciseId]?.name || 'Exercício removido'}</span>
                <span className="num text-[15px] text-muted whitespace-nowrap">
                  {it.sets}×{it.reps}
                  {Number(it.load) > 0 ? `  ${it.load} kg` : ''}
                </span>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
  );
}

function ExerciseList({ onEdit }) {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState('');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const groups = MUSCLE_GROUPS.filter((m) => state.exercises.some((e) => e.muscle === m));
  const list = state.exercises
    .filter((e) => (!muscle || e.muscle === muscle) && norm(e.name).includes(norm(q)))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="lib-search" className="relative">
        <span className="sr-only">Buscar exercício</span>
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input id="lib-search" className="field pl-9" placeholder="Buscar na sua biblioteca" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="scroll-x -mx-4 px-4 flex gap-1.5" role="group" aria-label="Filtrar por músculo">
        {['', ...groups].map((m) => (
          <button
            key={m || 'todos'}
            type="button"
            aria-pressed={muscle === m}
            onClick={() => setMuscle(m)}
            className={`flex-none h-8 px-3 rounded-full text-sm font-semibold border transition-colors ${
              muscle === m ? 'bg-ink text-bg border-ink' : 'bg-surface border-line text-muted hover:text-ink'
            }`}
          >
            {m || 'Todos'}
          </button>
        ))}
      </div>

      {!list.length ? (
        <Empty title="Nenhum exercício encontrado" action={<Button onClick={() => onEdit(null)}><Plus size={16} /> Cadastrar exercício</Button>}>
          Cadastre o movimento e escolha uma demonstração na base de imagens.
        </Empty>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {list.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => onEdit(e)} className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-surface-2 transition-colors">
                <ExerciseMedia media={e.media} alt="" animate={false} className="h-14 w-14 flex-none" rounded="rounded-lg" iconSize={18} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-tight">{e.name}</span>
                  <span className="block text-sm text-muted">{e.muscle}</span>
                </span>
                <ChevronRight size={18} className="text-muted" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted text-center pt-1">{state.exercises.length} exercícios cadastrados</p>
    </div>
  );
}
