const DAY = 86400000;

/** 'AAAA-MM-DD' -> Date local (meia-noite). */
export function parseISODate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(iso, from = new Date()) {
  return Math.round((parseISODate(iso) - startOfDay(from)) / DAY);
}

export function formatDateBR(value) {
  const d = typeof value === 'string' && value.length === 10 ? parseISODate(value) : new Date(value);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatShort(value) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

export function formatWeekday(value) {
  return new Date(value).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

export function formatDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h) return `${h}h${String(m).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function formatMinutes(sec = 0) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

/** Segunda-feira da semana da data (chave de agrupamento). */
export function weekStart(value) {
  const d = startOfDay(new Date(value));
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return d;
}

export function monthStart(value) {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function relativeDay(value) {
  const diff = Math.round((startOfDay() - startOfDay(new Date(value))) / DAY);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7) return `há ${diff} dias`;
  return formatShort(value);
}

export const DAY_MS = DAY;
