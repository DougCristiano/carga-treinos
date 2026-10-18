import { weekStart, monthStart, formatShort } from './dates.js';

const byDate = (a, b) => new Date(a.startedAt) - new Date(b.startedAt);

export function sessionVolume(session) {
  let total = 0;
  for (const e of session.entries) for (const s of e.sets) if (s.done) total += (Number(s.load) || 0) * (Number(s.reps) || 0);
  return total;
}

export function sessionSetCount(session) {
  return session.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
}

/** Exercícios que aparecem no histórico, do mais frequente para o menos. */
export function exercisesWithHistory(sessions) {
  const map = new Map();
  for (const s of sessions)
    for (const e of s.entries)
      if (e.sets.some((x) => x.done)) {
        const cur = map.get(e.exerciseId) || { id: e.exerciseId, name: e.name, count: 0 };
        cur.count += 1;
        cur.name = e.name;
        map.set(e.exerciseId, cur);
      }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Série temporal de um exercício: carga máxima, reps na carga máxima e volume. */
export function exerciseSeries(sessions, exerciseId) {
  const out = [];
  for (const s of [...sessions].sort(byDate)) {
    const entry = s.entries.find((e) => e.exerciseId === exerciseId);
    if (!entry) continue;
    const done = entry.sets.filter((x) => x.done);
    if (!done.length) continue;
    const maxLoad = Math.max(...done.map((x) => Number(x.load) || 0));
    const repsAtMax = Math.max(...done.filter((x) => (Number(x.load) || 0) === maxLoad).map((x) => Number(x.reps) || 0));
    const totalReps = done.reduce((n, x) => n + (Number(x.reps) || 0), 0);
    const volume = done.reduce((n, x) => n + (Number(x.load) || 0) * (Number(x.reps) || 0), 0);
    out.push({ date: s.startedAt, label: formatShort(s.startedAt), load: maxLoad, reps: repsAtMax, totalReps, volume });
  }
  return out;
}

/** Treinos e tonelagem agrupados por semana ou mês (inclui períodos vazios). */
export function periodTotals(sessions, period = 'week', count = 8) {
  const keyOf = period === 'week' ? weekStart : monthStart;
  const buckets = [];
  const now = keyOf(new Date());
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (period === 'week') d.setDate(d.getDate() - i * 7);
    else d.setMonth(d.getMonth() - i);
    buckets.push({ key: d.getTime(), date: d, sessions: 0, volume: 0, minutes: 0 });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const s of sessions) {
    const b = index.get(keyOf(s.startedAt).getTime());
    if (!b) continue;
    b.sessions += 1;
    b.volume += sessionVolume(s);
    b.minutes += Math.round((s.durationSec || 0) / 60);
  }
  return buckets.map((b) => ({
    ...b,
    label:
      period === 'week'
        ? formatShort(b.date)
        : b.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    tons: Math.round(b.volume / 100) / 10,
  }));
}

export function effortSeries(sessions, limit = 20) {
  return [...sessions]
    .filter((s) => s.effort)
    .sort(byDate)
    .slice(-limit)
    .map((s) => ({ date: s.startedAt, label: formatShort(s.startedAt), effort: s.effort, letter: s.letter }));
}

export function summary(sessions) {
  const total = sessions.length;
  const now = new Date();
  const thisWeek = weekStart(now).getTime();
  const thisMonth = monthStart(now).getTime();
  const week = sessions.filter((s) => weekStart(s.startedAt).getTime() === thisWeek).length;
  const month = sessions.filter((s) => monthStart(s.startedAt).getTime() === thisMonth).length;
  const efforts = sessions.filter((s) => s.effort);
  const avgEffort = efforts.length ? efforts.reduce((n, s) => n + s.effort, 0) / efforts.length : 0;
  const avgDuration = total ? sessions.reduce((n, s) => n + (s.durationSec || 0), 0) / total : 0;
  const volume = sessions.reduce((n, s) => n + sessionVolume(s), 0);
  return { total, week, month, avgEffort, avgDuration, volume };
}

/** Última carga/reps registradas de um exercício (para pré-preencher o treino). */
export function lastPerformance(sessions, exerciseId) {
  const sorted = [...sessions].sort(byDate).reverse();
  for (const s of sorted) {
    const entry = s.entries.find((e) => e.exerciseId === exerciseId);
    const done = entry?.sets.filter((x) => x.done);
    if (done?.length) return { date: s.startedAt, sets: done };
  }
  return null;
}

/** Próxima ficha na rotação (depois da última realizada). */
export function suggestedPlan(plans, sessions) {
  if (!plans.length) return null;
  const last = [...sessions].sort(byDate).pop();
  if (!last) return plans[0];
  const idx = plans.findIndex((p) => p.id === last.planId);
  return plans[(idx + 1) % plans.length] || plans[0];
}
