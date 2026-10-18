import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { EFFORT_SCALE } from '../config/app.config.js';
import { Button } from './ui.jsx';
import { formatDuration } from '../lib/dates.js';

/** Tela de encerramento: registra apenas o nível de esforço (1 a 5). */
export function EffortScreen({ active, onSave, onBack }) {
  const [effort, setEffort] = useState(null);
  const sets = active.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const volume = active.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).reduce((m, s) => m + (Number(s.load) || 0) * (Number(s.reps) || 0), 0), 0);
  const incomplete = active.entries.filter((e) => !e.sets.every((s) => s.done)).length;
  const duration = (Date.now() - new Date(active.startedAt)) / 1000;

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="effort-title">
      <div
        className="gutter mx-auto max-w-xl flex flex-col gap-5"
        style={{ paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div>
          <p className="text-sm text-muted">Treino {active.letter} finalizado</p>
          <h1 id="effort-title" className="font-display text-[34px] leading-[1.05] font-bold">
            Qual foi o esforço deste treino?
          </h1>
          <p className="text-sm text-muted mt-1">Escala de 1 (muito leve) a 5 (máximo).</p>
        </div>

        <dl className="grid grid-cols-3 gap-2">
          {[
            ['Duração', formatDuration(duration)],
            ['Séries', sets],
            ['Volume', `${Math.round(volume).toLocaleString('pt-BR')} kg`],
          ].map(([k, v]) => (
            <div key={k} className="card p-3">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="num text-[22px] font-bold leading-tight whitespace-nowrap">{v}</dd>
            </div>
          ))}
        </dl>

        {incomplete > 0 && (
          <p className="flex gap-2 items-start text-sm bg-surface-2 rounded-xl px-3 py-2.5">
            <AlertTriangle size={17} className="text-yellow flex-none mt-0.5" aria-hidden="true" />
            {incomplete === 1 ? '1 exercício ficou incompleto.' : `${incomplete} exercícios ficaram incompletos.`} Só as séries marcadas entram no histórico.
          </p>
        )}

        <div role="radiogroup" aria-label="Nível de esforço" className="flex flex-col gap-2">
          {EFFORT_SCALE.map((o) => {
            const selected = effort === o.value;
            const intensity = 18 + o.value * 16;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setEffort(o.value)}
                className={`flex items-center gap-4 p-3 rounded-2xl border-2 text-left transition-colors ${
                  selected ? 'border-ink bg-surface' : 'border-transparent bg-surface hover:border-line'
                }`}
              >
                <span
                  className="num grid place-items-center h-14 w-14 rounded-full text-[30px] font-bold flex-none"
                  style={{
                    background: `color-mix(in oklab, var(--red) ${intensity}%, var(--surface-2))`,
                    color: o.value >= 3 ? '#fff' : 'var(--ink)',
                  }}
                >
                  {o.value}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-2xl font-semibold leading-tight">{o.label}</span>
                  <span className="block text-sm text-muted">{o.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-2 pt-1">
          <Button variant="outline" size="lg" onClick={onBack}>
            Voltar
          </Button>
          <Button size="lg" disabled={!effort} onClick={() => onSave(effort)}>
            {effort ? `Salvar treino com esforço ${effort}` : 'Escolha o esforço'}
          </Button>
        </div>
      </div>
    </div>
  );
}
