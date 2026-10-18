import { useMemo, useState } from 'react';
import { Settings, Play, Dumbbell, LineChart, Info, ChevronRight, Clock } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { SeriesReminder } from '../components/SeriesReminder.jsx';
import { SettingsSheet } from '../components/SettingsSheet.jsx';
import { Plate, Button, IconButton } from '../components/ui.jsx';
import { summary, suggestedPlan, sessionVolume } from '../lib/stats.js';
import { formatWeekday, relativeDay, formatMinutes, formatDuration } from '../lib/dates.js';
import { EFFORT_SCALE } from '../config/app.config.js';

export default function Dashboard({ navigate }) {
  const { state, series, actions } = useStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { sessions, plans, active } = state;

  const stats = useMemo(() => summary(sessions), [sessions]);
  const plan = useMemo(() => suggestedPlan(plans, sessions), [plans, sessions]);
  const last = useMemo(() => [...sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0], [sessions]);
  const hasDemo = sessions.some((s) => s.demo);

  const start = () => {
    if (!active && plan) actions.startWorkout(plan.id);
    navigate('treino');
  };

  return (
    <>
      <PageHeader
        title="Carga"
        subtitle={formatWeekday(new Date())}
        actions={
          <IconButton label="Configurações" onClick={() => setSettingsOpen(true)}>
            <Settings size={20} />
          </IconButton>
        }
      />

      <div className="gutter pt-4 flex flex-col gap-4">
        {hasDemo && (
          <div className="flex gap-2.5 items-start rounded-xl bg-surface-2 px-3.5 py-3 text-sm">
            <Info size={18} className="text-blue flex-none mt-0.5" aria-hidden="true" />
            <p>
              Você está vendo <strong>treinos de exemplo</strong> para conhecer os gráficos. Eles somem sozinhos quando você concluir seu primeiro treino.
            </p>
          </div>
        )}

        <SeriesReminder series={series} onEdit={() => setSettingsOpen(true)} />

        <section aria-label="Resumo" className="grid grid-cols-[1.2fr_1fr_1fr] gap-2">
          <div className="card p-3.5">
            <p className="num text-[44px] leading-none font-bold">{stats.total}</p>
            <p className="text-sm text-muted mt-1.5">treinos realizados</p>
          </div>
          <div className="card p-3.5">
            <p className="num text-[30px] leading-none font-bold">{stats.week}</p>
            <p className="text-sm text-muted mt-1.5">nesta semana</p>
          </div>
          <div className="card p-3.5">
            <p className="num text-[30px] leading-none font-bold">{stats.month}</p>
            <p className="text-sm text-muted mt-1.5">neste mês</p>
          </div>
        </section>

        <section aria-label="Treino do dia" className="card raised p-4 flex flex-col gap-4">
          {active ? (
            <div className="flex items-center gap-3">
              <Plate letter={active.letter} plate={active.plate} size={52} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-red font-semibold">Treino em andamento</p>
                <p className="font-display text-2xl font-semibold leading-tight truncate">{active.planName}</p>
                <p className="text-sm text-muted">
                  {active.entries.filter((e) => e.sets.every((s) => s.done)).length} de {active.entries.length} exercícios concluídos
                </p>
              </div>
            </div>
          ) : plan ? (
            <div className="flex items-center gap-3">
              <Plate letter={plan.letter} plate={plan.plate} size={52} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">Treino do dia</p>
                <p className="font-display text-2xl font-semibold leading-tight truncate">
                  Treino {plan.letter} · {plan.name}
                </p>
                <p className="text-sm text-muted">
                  {plan.items.length} exercícios · {plan.items.reduce((n, i) => n + Number(i.sets || 0), 0)} séries
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Crie uma ficha para começar a treinar.</p>
          )}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button size="lg" onClick={plan || active ? start : () => navigate('exercicios')}>
              <Play size={18} fill="currentColor" />
              {active ? 'Continuar treino' : plan ? 'Iniciar treino' : 'Criar ficha'}
            </Button>
            {!active && plans.length > 1 && (
              <Button size="lg" variant="outline" onClick={() => navigate('treino')}>
                Outra ficha
              </Button>
            )}
          </div>
        </section>

        <section aria-label="Atalhos" className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => navigate('exercicios')} className="card p-4 text-left hover:bg-surface-2 transition-colors flex flex-col gap-3">
            <Dumbbell size={22} className="text-blue" aria-hidden="true" />
            <span>
              <span className="block font-semibold">Gerenciar exercícios</span>
              <span className="block text-sm text-muted">
                {state.exercises.length} exercícios · {plans.length} fichas
              </span>
            </span>
          </button>
          <button type="button" onClick={() => navigate('evolucao')} className="card p-4 text-left hover:bg-surface-2 transition-colors flex flex-col gap-3">
            <LineChart size={22} className="text-blue" aria-hidden="true" />
            <span>
              <span className="block font-semibold">Ver evolução</span>
              <span className="block text-sm text-muted">Cargas, volume e esforço</span>
            </span>
          </button>
        </section>

        {last && (
          <section aria-label="Último treino">
            <button
              type="button"
              onClick={() => navigate('evolucao')}
              className="w-full card p-3.5 flex items-center gap-3 text-left hover:bg-surface-2 transition-colors"
            >
              <Plate letter={last.letter} plate={last.plate} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-muted">Último treino · {relativeDay(last.startedAt)}</span>
                <span className="block font-semibold truncate">
                  {last.planName}
                </span>
                <span className="flex flex-wrap gap-x-3 text-sm text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} aria-hidden="true" />
                    {formatMinutes(last.durationSec)}
                  </span>
                  <span>{Math.round(sessionVolume(last)).toLocaleString('pt-BR')} kg</span>
                  {last.effort && <span>Esforço {last.effort}/5 · {EFFORT_SCALE[last.effort - 1]?.label}</span>}
                </span>
              </span>
              <ChevronRight size={18} className="text-muted" aria-hidden="true" />
            </button>
          </section>
        )}

        {stats.total > 0 && (
          <p className="text-xs text-muted text-center">
            Duração média {formatDuration(stats.avgDuration)} · esforço médio {stats.avgEffort.toFixed(1).replace('.', ',')}/5
          </p>
        )}
      </div>

      {settingsOpen && <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
