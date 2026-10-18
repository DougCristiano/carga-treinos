import { CalendarClock, Pencil } from 'lucide-react';
import { daysUntil, formatDateBR } from '../lib/dates.js';
import { Plate } from './ui.jsx';

/**
 * Lembrete fixo do vencimento da série. A cor da anilha indica urgência:
 * azul (folga), amarelo (até 14 dias), vermelho (até 7 dias ou vencida).
 */
export function SeriesReminder({ series, onEdit }) {
  const days = daysUntil(series.dueDate);
  const overdue = days < 0;
  const plate = overdue || days <= 7 ? 'red' : days <= 14 ? 'yellow' : 'blue';

  let status;
  if (overdue) status = `Venceu há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}. Hora de montar a próxima série.`;
  else if (days === 0) status = 'Vence hoje. Combine a troca da ficha.';
  else if (days <= 7) status = 'Última semana desta série. Aproveite para testar as cargas.';
  else status = 'Mantenha a frequência para chegar ao fim da série evoluindo.';

  return (
    <section aria-label="Vencimento da série" className="card raised overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <Plate plate={plate} size={112} className="text-center">
          <span className="flex flex-col items-center leading-none">
            <span className="text-[44px] font-bold">{overdue ? '!' : Math.max(days, 0)}</span>
            <span className="text-[13px] font-semibold tracking-wide mt-0.5">{overdue ? 'vencida' : days === 1 ? 'dia' : 'dias'}</span>
          </span>
        </Plate>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <CalendarClock size={15} aria-hidden="true" />
            {series.label} vence em
          </p>
          <p className="num text-[34px] leading-none font-bold mt-1">{formatDateBR(series.dueDate)}</p>
          <p className="text-sm mt-2 text-ink/85">{status}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="w-full flex items-center justify-center gap-1.5 border-t border-line py-2.5 text-sm font-semibold text-muted hover:text-ink hover:bg-surface-2 transition-colors"
      >
        <Pencil size={14} aria-hidden="true" /> Alterar data da série
      </button>
    </section>
  );
}
