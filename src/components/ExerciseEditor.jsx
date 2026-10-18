import { useMemo, useState } from 'react';
import { Search, Link2, ExternalLink, Trash2, ImageOff, Check } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { MUSCLE_GROUPS } from '../data/muscles.js';
import { searchExerciseDb, resolveMedia, webGifSearchUrl, DB_SOURCE_URL } from '../lib/media.js';
import { ExerciseMedia } from './ExerciseMedia.jsx';
import { Sheet, Button, Segmented, ConfirmButton } from './ui.jsx';

const EMPTY = { name: '', muscle: 'Peito', notes: '', media: null };

export function ExerciseEditor({ exercise, onClose, onSaved }) {
  const { actions, notify, state } = useStore();
  const editing = !!exercise?.id;
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(exercise || {}) }));
  const [mode, setMode] = useState(form.media?.type === 'url' ? 'url' : 'db');
  const [query, setQuery] = useState(exercise?.name || '');
  const [url, setUrl] = useState(form.media?.type === 'url' ? form.media.url : '');
  const [error, setError] = useState('');

  const results = useMemo(() => searchExerciseDb(query), [query]);
  const usedIn = editing ? state.plans.filter((p) => p.items.some((i) => i.exerciseId === exercise.id)) : [];
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    if (!form.name.trim()) {
      setError('Dê um nome ao exercício.');
      return;
    }
    const id = actions.saveExercise({ ...form, name: form.name.trim() });
    notify(editing ? 'Exercício atualizado' : 'Exercício criado');
    onSaved?.(id);
    onClose();
  };

  const pickDb = (r) => {
    set({
      media: { type: 'db', id: r.id },
      ...(form.name.trim() ? {} : { name: r.name }),
      ...(editing || form.name.trim() ? {} : { muscle: r.muscle }),
    });
  };

  const validUrl = /^https?:\/\/\S+$/i.test(url.trim());

  return (
    <Sheet
      open
      wide
      onClose={onClose}
      title={editing ? 'Editar exercício' : 'Novo exercício'}
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={save}>
            {editing ? 'Salvar alterações' : 'Criar exercício'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label htmlFor="ex-name" className="flex flex-col gap-1 text-sm font-medium">
            Nome
            <input
              id="ex-name"
              className="field"
              value={form.name}
              placeholder="Ex.: Supino reto com barra"
              onChange={(e) => {
                set({ name: e.target.value });
                setError('');
              }}
            />
          </label>
          <label htmlFor="ex-muscle" className="flex flex-col gap-1 text-sm font-medium">
            Grupo muscular
            <select id="ex-muscle" className="field" value={form.muscle} onChange={(e) => set({ muscle: e.target.value })}>
              {MUSCLE_GROUPS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="text-sm text-red -mt-3">{error}</p>}

        <label htmlFor="ex-notes" className="flex flex-col gap-1 text-sm font-medium">
          Observações de execução
          <textarea id="ex-notes" rows={2} className="field resize-y" value={form.notes} placeholder="Postura, amplitude, cadência..." onChange={(e) => set({ notes: e.target.value })} />
        </label>

        <section className="flex flex-col gap-3" aria-label="Demonstração do movimento">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold">Demonstração</h3>
            {form.media && (
              <button type="button" className="text-sm font-semibold text-muted hover:text-red inline-flex items-center gap-1" onClick={() => set({ media: null })}>
                <ImageOff size={15} /> Remover
              </button>
            )}
          </div>
          <ExerciseMedia media={form.media} alt={`Demonstração: ${form.name}`} className="w-full aspect-[4/3] max-h-60 border border-line" iconSize={40} />

          <Segmented
            label="Origem da imagem"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'db', label: 'Buscar na base' },
              { value: 'url', label: 'Colar URL ou GIF' },
            ]}
          />

          {mode === 'db' ? (
            <div className="flex flex-col gap-3">
              <label htmlFor="ex-search" className="relative">
                <span className="sr-only">Buscar movimento</span>
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="ex-search"
                  className="field pl-9"
                  value={query}
                  placeholder="Buscar: supino, puxada, rosca, agachamento..."
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {query.trim() && !results.length && (
                <p className="text-sm text-muted">Nada encontrado para “{query}”. Tente outro termo ou cole a URL de um GIF.</p>
              )}
              {results.length > 0 && (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {results.map((r) => {
                    const selected = form.media?.type === 'db' && form.media.id === r.id;
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => pickDb(r)}
                          aria-pressed={selected}
                          className={`w-full text-left rounded-xl border-2 p-1.5 transition-colors ${selected ? 'border-green bg-green-soft' : 'border-line bg-surface hover:border-ink/30'}`}
                        >
                          <span className="relative block">
                            <ExerciseMedia media={{ type: 'db', id: r.id }} alt="" animate={false} className="w-full aspect-[4/3]" rounded="rounded-lg" iconSize={20} />
                            {selected && (
                              <span className="absolute top-1 right-1 h-6 w-6 rounded-full bg-green text-white grid place-items-center">
                                <Check size={14} strokeWidth={3} />
                              </span>
                            )}
                          </span>
                          <span className="block text-[13px] font-semibold leading-tight mt-1.5 line-clamp-2">{r.name}</span>
                          <span className="block text-xs text-muted">{[r.muscle, r.equipment].filter(Boolean).join(', ')}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="text-xs text-muted">
                Fotos da base aberta{' '}
                <a className="underline" href={DB_SOURCE_URL} target="_blank" rel="noreferrer">
                  free-exercise-db
                </a>{' '}
                (domínio público). As duas posições do movimento se alternam como um GIF.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label htmlFor="ex-url" className="relative">
                <span className="sr-only">URL da imagem ou GIF</span>
                <Link2 size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input id="ex-url" className="field pl-9" value={url} inputMode="url" placeholder="https://.../exercicio.gif" onChange={(e) => setUrl(e.target.value)} />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="dark" disabled={!validUrl} onClick={() => set({ media: { type: 'url', url: url.trim() } })}>
                  Usar esta imagem
                </Button>
                <a
                  href={webGifSearchUrl(form.name || query || 'exercicio')}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-line bg-surface text-sm font-semibold hover:bg-surface-2"
                >
                  <ExternalLink size={15} /> Procurar GIF na web
                </a>
              </div>
              <p className="text-xs text-muted">Abra a busca, copie o endereço da imagem (“Copiar endereço da imagem”) e cole aqui. Funciona com JPG, PNG, WEBP e GIF.</p>
            </div>
          )}
        </section>

        {editing && (
          <section className="border-t border-line pt-4 flex flex-col gap-2">
            {usedIn.length > 0 && <p className="text-sm text-muted">Usado em: {usedIn.map((p) => `Treino ${p.letter}`).join(', ')}. Excluir remove das fichas; o histórico é mantido.</p>}
            <ConfirmButton
              icon={<Trash2 size={15} />}
              label="Excluir exercício"
              question="Excluir este exercício?"
              confirmLabel="Excluir"
              onConfirm={() => {
                actions.deleteExercise(exercise.id);
                notify('Exercício excluído');
                onClose();
              }}
            />
          </section>
        )}
      </div>
    </Sheet>
  );
}

export function hasMedia(ex) {
  return resolveMedia(ex?.media).length > 0;
}
