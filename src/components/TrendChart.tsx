import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatAxisDate, formatCompact, formatDateTime } from '../lib/format';

export interface TrendSeries {
  key: string;
  name: string;
}

export interface TrendPoint {
  at: number;
  label: string;
  [key: string]: number | string;
}

/** Fixed categorical order (validated for CVD on the #0c1223 surface). Never reassigned by rank. */
export const SERIES_COLORS = ['#3987e5', '#d95926', '#199e70'] as const;
const SURFACE = '#0c1223';
const GRID = 'rgba(148,163,184,0.14)';
const AXIS = 'rgba(148,163,184,0.3)';
const TICK = { fill: '#94a3b8', fontSize: 12 };

interface TooltipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: TrendPoint;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  unit: string;
  decimals: number;
}

function valueFormatter(decimals: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function ChartTooltip({ active, payload, unit, decimals }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const fmt = valueFormatter(decimals);
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-head">
        {point ? formatDateTime(point.at) : ''}
        {point?.label ? ` · ${point.label}` : ''}
      </p>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={String(entry.dataKey)}>
          <span className="chart-tooltip-key" style={{ background: entry.color }} />
          <span>{String(entry.name ?? '')}</span>
          <strong>{typeof entry.value === 'number' ? `${fmt.format(entry.value)}${unit}` : String(entry.value ?? '')}</strong>
        </div>
      ))}
    </div>
  );
}

interface TrendChartProps {
  title: string;
  points: TrendPoint[];
  series: TrendSeries[];
  unit?: string;
  decimals?: number;
}

export function TrendChart({ title, points, series, unit = '', decimals = 0 }: TrendChartProps) {
  if (points.length === 0) {
    return (
      <div className="chart-card">
        <h3>{title}</h3>
        <p className="chart-empty">Save a snapshot to start tracking.</p>
      </div>
    );
  }

  const data = points.map((point, index) => ({ ...point, x: index }));

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-plot">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="x"
              type="category"
              tickFormatter={(index: number) => formatAxisDate(points[index]?.at ?? 0)}
              tick={TICK}
              tickLine={false}
              axisLine={{ stroke: AXIS }}
              minTickGap={28}
            />
            <YAxis
              tickFormatter={formatCompact}
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={52}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={<ChartTooltip unit={unit} decimals={decimals} />}
              cursor={{ stroke: AXIS, strokeWidth: 1 }}
            />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: '#cbd5e1', paddingTop: 8 }} />
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 4, fill: SERIES_COLORS[i % SERIES_COLORS.length], stroke: SURFACE, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: SERIES_COLORS[i % SERIES_COLORS.length], stroke: SURFACE, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
