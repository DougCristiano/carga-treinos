import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useThemeColors } from '../lib/useThemeColors.js';
import { EFFORT_SCALE } from '../config/app.config.js';

const fmt = (n, digits = 0) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: digits });

function ChartTooltip({ active, payload, format }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-lg text-sm">
      <p className="text-muted text-xs">{p.payload.tip || p.payload.label}</p>
      <p className="num text-xl font-bold leading-tight">{format(p.value, p.payload)}</p>
    </div>
  );
}

const axisProps = (c) => ({
  tickLine: false,
  axisLine: { stroke: c.line },
  tick: { fill: c.muted, fontSize: 12 },
});

/** Linha com área suave: evolução de carga/reps/volume de um exercício. */
export function TrendChart({ data, dataKey, unit, height = 220 }) {
  const c = useThemeColors();
  const id = `grad-${dataKey}`;
  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.blue} stopOpacity={0.22} />
              <stop offset="100%" stopColor={c.blue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={c.line} strokeDasharray="0" strokeOpacity={0.7} />
          <XAxis dataKey="label" {...axisProps(c)} minTickGap={24} />
          <YAxis {...axisProps(c)} axisLine={false} width={44} domain={['auto', 'auto']} allowDecimals={dataKey !== 'reps'} tickFormatter={(v) => fmt(v)} />
          <Tooltip cursor={{ stroke: c.muted, strokeDasharray: '3 3' }} content={<ChartTooltip format={(v) => `${fmt(v, 1)} ${unit}`} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={c.blue}
            strokeWidth={2}
            fill={`url(#${id})`}
            dot={{ r: 3.5, fill: c.surface, stroke: c.blue, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: c.blue, stroke: c.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barras por semana/mês. */
export function PeriodBars({ data, dataKey, unit, height = 200 }) {
  const c = useThemeColors();
  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={c.line} strokeOpacity={0.7} />
          <XAxis dataKey="label" {...axisProps(c)} interval="preserveStartEnd" />
          <YAxis {...axisProps(c)} axisLine={false} width={36} allowDecimals={dataKey !== 'sessions'} tickFormatter={(v) => fmt(v, 1)} />
          <Tooltip
            cursor={{ fill: c['surface-2'] }}
            content={<ChartTooltip format={(v) => (dataKey === 'sessions' ? `${v} ${v === 1 ? 'treino' : 'treinos'}` : `${fmt(v, 1)} ${unit}`)} />}
          />
          <Bar dataKey={dataKey} fill={c.blue} radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Esforço reportado (1 a 5) por treino, com a média tracejada. */
export function EffortChart({ data, average, height = 200 }) {
  const c = useThemeColors();
  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={c.line} strokeOpacity={0.7} />
          <XAxis dataKey="label" {...axisProps(c)} minTickGap={24} />
          <YAxis {...axisProps(c)} axisLine={false} width={28} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} allowDecimals={false} />
          {average > 0 && (
            <ReferenceLine
              y={average}
              stroke={c.muted}
              strokeDasharray="4 4"
              label={{ value: `média ${fmt(average, 1)}`, position: 'insideTopRight', fill: c.muted, fontSize: 12 }}
            />
          )}
          <Tooltip
            cursor={{ stroke: c.muted, strokeDasharray: '3 3' }}
            content={<ChartTooltip format={(v) => `${v}/5 · ${EFFORT_SCALE[v - 1]?.label ?? ''}`} />}
          />
          <Line
            type="linear"
            dataKey="effort"
            stroke={c.red}
            strokeWidth={2}
            dot={{ r: 4, fill: c.red, stroke: c.surface, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: c.red, stroke: c.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Tabela com os mesmos dados do gráfico (acessibilidade). */
export function DataTable({ columns, rows }) {
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-muted font-semibold select-none">Ver dados em tabela</summary>
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left">
          <thead>
            <tr className="text-muted text-xs">
              {columns.map((col) => (
                <th key={col.key} className="py-1 pr-3 font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="num text-[15px]">
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line">
                {columns.map((col) => (
                  <td key={col.key} className="py-1 pr-3">
                    {col.format ? col.format(r[col.key], r) : r[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
