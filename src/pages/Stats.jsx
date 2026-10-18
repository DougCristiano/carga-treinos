import { useMemo, useState } from 'react';
import { ChevronDown, Trash2, TrendingUp, TrendingDown, Minus, Info, BarChart3 } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { Segmented, Plate, ConfirmButton, Empty, Button, SectionTitle } from '../components/ui.jsx';
import { TrendChart, PeriodBars, EffortChart, DataTable } from '../components/charts.jsx';
import { summary, exercisesWithHistory, exerciseSeries, periodTotals, effortSeries, sessionVolume, sessionSetCount } from '../lib/stats.js';
import { formatShort, formatMinutes, formatDateBR } from '../lib/dates.js';
import { EFFORT_SCALE } from '../config/app.config.js';

const METRICS = {
  load: { label: 'Carga', unit: 'kg', title: 'Carga máxima por treino' },
  reps: { label: 'Reps', unit: 'reps', title: 'Repetições na carga máxima' },
  volume: { label: 'Volume', unit: 'kg', title: 'Volume do exercício (carga × reps)' },
};

const fmt = (n, d = 0) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: d });

export default function Stats({ navigate }) {
  const { state } = useStore();
  const { sessions } = state;
  const hasDemo = sessions.some((s) => s.demo);

  if (!sessions.length)
    return (
      <>
        <PageHeader title="Evolução" subtitle="Histórico e gráficos" />
        <div className="gutter pt-4">
          <Empty icon={<BarChart3 size={32} />} title="Seu histórico começa no primeiro treino" action={<Button onClick={() => navigate('treino')}>Começar um treino</Button>}>
            Cada treino finalizado alimenta os gráficos de carga, volume e esforço.
          </Empty>
        </div>
      </>
    );

  return (
    <>
      <PageHeader title="Evolução" subtitle="Histórico e gráficos" />
      <div className="gutter pt-4 flex flex-col gap-6">
        {hasDemo && (
          <p className="flex gap-2 items-start rounded-xl bg-surface-2 px-3.5 py-3 text-sm">
            <Info size={17} className="text-blue flex-none mt-0.5" aria-hidden="true" />
            Gráficos com treinos de exemplo. Seus treinos reais substituem estes dados.
          </p>
        )}
        <Overview sessions={sessions} />
        <ExerciseEvolution sessions={sessions} />
        <PeriodVolume sessions={sessions} />
        <EffortHistory sessions={sessions} />
        <History sessions={sessions} />
      </div>
    </>
  );
}

function Overview({ sessions }) {
  const s = useMemo(() => summary(sessions), [sessions]);
  const tiles = [
    ['Treinos', fmt(s.total), 'no total'],
    ['Volume', fmt(s.volume / 1000, 1), 'toneladas'],
    ['Esforço', fmt(s.avgEffort, 1), 'média de 5'],
    ['Duração', fmt(s.avgDuration / 60), 'min por treino'],
  ];
  return (
    <section aria-label="Resumo geral" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {tiles.map(([k, v, u]) => (
        <div key={k} className="card p-3">
          <p className="text-xs text-muted">{k}</p>
          <p className="num text-[30px] font-bold leading-none mt-1">{v}</p>
          <p className="text-xs text-muted mt-1">{u}</p>
        </div>
      ))}
    </section>
  );
}

function ExerciseEvolution({ sessions }) {
  const options = useMemo(() => exercisesWithHistory(sessions), [sessions]);
  const [exId, setExId] = useState(options[0]?.id);
  const [metric, setMetric] = useState('load');
  const current = options.find((o) => o.id === exId) ? exId : options[0]?.id;
  const data = useMemo(() => exerciseSeries(sessions, current), [sessions, current]);
  const m = METRICS[metric];

  const first = data[0]?.[metric];
  const last = data[data.length - 1]?.[metric];
  const delta = data.length > 1 ? last - first : 0;
  const pct = first ? (delta / first) * 100 : 0;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  if (!options.length) return null;
  return (
    <section aria-labelledby="evo-title" className="card p-4 flex flex-col gap-3">
      <SectionTitle>
        <span id="evo-title">Evolução por exercício</span>
      </SectionTitle>
      <label htmlFor="evo-ex" className="sr-only">
        Exercício
      </label>
      <select id="evo-ex" className="field font-semibold" value={current} onChange={(e) => setExId(e.target.value)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} ({o.count} treinos)
          </option>
        ))}
      </select>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Segmented
          label="Métrica"
          value={metric}
          onChange={setMetric}
          options={Object.entries(METRICS).map(([value, v]) => ({ value, label: v.label }))}
        />
        {data.length > 1 && (
          <p className={`flex items-center gap-1 text-sm font-semibold ${delta > 0 ? 'text-green' : delta < 0 ? 'text-red' : 'text-muted'}`}>
            <TrendIcon size={16} aria-hidden="true" />
            <span className="num text-lg">
              {delta > 0 ? '+' : ''}
              {fmt(delta, 1)} {m.unit}
            </span>
            <span className="text-muted font-normal">({pct > 0 ? '+' : ''}{fmt(pct, 0)}%)</span>
          </p>
        )}
      </div>
      <div>
        <p className="text-sm text-muted mb-1">{m.title}</p>
        <TrendChart data={data} dataKey={metric} unit={m.unit} />
        <DataTable
          columns={[
            { key: 'label', label: 'Data' },
            { key: 'load', label: 'Carga máx (kg)', format: (v) => fmt(v, 1) },
            { key: 'reps', label: 'Reps' },
            { key: 'volume', label: 'Volume (kg)', format: (v) => fmt(v) },
          ]}
          rows={data}
        />
      </div>
    </section>
  );
}

function PeriodVolume({ sessions }) {
  const [period, setPeriod] = useState('week');
  const [metric, setMetric] = useState('sessions');
  const data = useMemo(() => periodTotals(sessions, period, period === 'week' ? 8 : 6), [sessions, period]);
  const total = data.reduce((n, d) => n + (metric === 'sessions' ? d.sessions : d.tons), 0);
  return (
    <section aria-labelledby="vol-title" className="card p-4 flex flex-col gap-3">
      <SectionTitle>
        <span id="vol-title">Volume de treinos</span>
      </SectionTitle>
      <div className="flex flex-wrap gap-2 justify-between">
        <Segmented label="Período" value={period} onChange={setPeriod} options={[{ value: 'week', label: 'Semana' }, { value: 'month', label: 'Mês' }]} />
        <Segmented label="Medida" value={metric} onChange={setMetric} options={[{ value: 'sessions', label: 'Treinos' }, { value: 'tons', label: 'Toneladas' }]} />
      </div>
      <p className="text-sm text-muted">
        {metric === 'sessions' ? 'Treinos realizados' : 'Tonelagem levantada (carga × reps)'} {period === 'week' ? 'nas últimas 8 semanas' : 'nos últimos 6 meses'}:{' '}
        <span className="num text-lg font-bold text-ink">{fmt(total, 1)}</span>
      </p>
      <PeriodBars data={data} dataKey={metric} unit="t" />
      <DataTable
        columns={[
          { key: 'label', label: period === 'week' ? 'Semana de' : 'Mês' },
          { key: 'sessions', label: 'Treinos' },
          { key: 'tons', label: 'Toneladas', format: (v) => fmt(v, 1) },
          { key: 'minutes', label: 'Minutos' },
        ]}
        rows={data}
      />
    </section>
  );
}

function EffortHistory({ sessions }) {
  const data = useMemo(() => effortSeries(sessions, 20), [sessions]);
  const avg = data.length ? data.reduce((n, d) => n + d.effort, 0) / data.length : 0;
  const dist = EFFORT_SCALE.map((o) => ({ ...o, count: data.filter((d) => d.effort === o.value).length }));
  if (!data.length) return null;
  return (
    <section aria-labelledby="eff-title" className="card p-4 flex flex-col gap-3">
      <SectionTitle>
        <span id="eff-title">Esforço reportado</span>
      </SectionTitle>
      <p className="text-sm text-muted">Últimos {data.length} treinos, na escala de 1 a 5.</p>
      <EffortChart data={data} average={avg} />
      <ul className="grid grid-cols-5 gap-1.5" aria-label="Distribuição do esforço">
        {dist.map((d) => (
          <li key={d.value} className="rounded-lg bg-surface-2 px-1.5 py-2 text-center">
            <p className="num text-xl font-bold leading-none">{d.count}</p>
            <p className="text-[11px] text-muted mt-1 leading-tight">{d.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function History({ sessions }) {
  const { actions, notify } = useStore();
  const [open, setOpen] = useState(null);
  const [limit, setLimit] = useState(10);
  const sorted = useMemo(() => [...sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)), [sessions]);

  return (
    <section aria-labelledby="hist-title" className="flex flex-col gap-2">
      <SectionTitle>
        <span id="hist-title">Histórico detalhado</span>
      </SectionTitle>
      <ul className="flex flex-col gap-2">
        {sorted.slice(0, limit).map((s) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} className="card overflow-hidden">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-2 transition-colors">
                <Plate letter={s.letter} plate={s.plate} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-tight truncate">{s.planName}</span>
                  <span className="block text-sm text-muted">
                    {formatDateBR(s.startedAt)}, {formatMinutes(s.durationSec)}, {fmt(sessionVolume(s))} kg
                  </span>
                </span>
                {s.effort && (
                  <span className="num text-lg font-bold text-muted" title={EFFORT_SCALE[s.effort - 1]?.label}>
                    {s.effort}/5
                  </span>
                )}
                <ChevronDown size={18} className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {isOpen && (
                <div className="border-t border-line px-3 py-3 flex flex-col gap-3">
                  <p className="text-sm text-muted">
                    {sessionSetCount(s)} séries concluídas. Esforço: {s.effort ? `${s.effort} (${EFFORT_SCALE[s.effort - 1]?.label})` : 'não informado'}.
                  </p>
                  <ul className="flex flex-col gap-2">
                    {s.entries.map((e) => (
                      <li key={e.exerciseId}>
                        <p className="font-semibold text-[15px]">{e.name}</p>
                        <p className="num text-[15px] text-muted">
                          {e.sets.filter((x) => x.done).length
                            ? e.sets
                                .filter((x) => x.done)
                                .map((x) => `${fmt(x.load, 1)} kg × ${x.reps}`)
                                .join('   ')
                            : 'Não realizado'}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <ConfirmButton
                    className="self-start"
                    icon={<Trash2 size={15} />}
                    label="Excluir treino"
                    question="Excluir do histórico?"
                    confirmLabel="Excluir"
                    onConfirm={() => {
                      actions.deleteSession(s.id);
                      notify('Treino excluído do histórico');
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {sorted.length > limit && (
        <Button variant="outline" onClick={() => setLimit((l) => l + 10)}>
          Mostrar mais ({sorted.length - limit} restantes)
        </Button>
      )}
      <p className="text-xs text-muted text-center">Primeiro registro em {formatShort(sorted[sorted.length - 1].startedAt)}</p>
    </section>
  );
}
