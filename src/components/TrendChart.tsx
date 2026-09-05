import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Locale } from '../i18n';
import { useLocale } from '../i18n/LocaleContext';
import { formatAxisDate, formatCompact, formatDateTime, formatFixed } from '../lib/format';

export interface TrendSeries {
  key: string;
  name: string;
}

export interface TrendPoint {
  at: number;
  label: string;
  [key: string]: number | string;
}

/** Fixed categorical order (validated for CVD on the light #fbfcfd surface). Never reassigned by rank. */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a'] as const;
const SURFACE = '#fbfcfd';
const GRID = '#dfe6ee';
const AXIS = '#9aa9b8';
const TICK = { fill: '#5a6978', fontSize: 10 };

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
  locale: Locale;
}

function ChartTooltip({ active, payload, unit, decimals, locale }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-head">
        {point ? formatDateTime(point.at, locale) : ''}
        {point?.label ? ` · ${point.label}` : ''}
      </p>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={String(entry.dataKey)}>
          <span className="chart-tooltip-key" style={{ background: entry.color }} />
          <span>{String(entry.name ?? '')}</span>
          <strong>
            {typeof entry.value === 'number'
              ? `${formatFixed(entry.value, decimals, locale)}${unit}`
              : String(entry.value ?? '')}
          </strong>
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
  const { t, locale } = useLocale();

  if (points.length === 0) {
    return (
      <div className="ro-chart">
        <h3>{title}</h3>
        <p className="ro-chart-empty">{t.tracking.empty}</p>
      </div>
    );
  }

  const data = points.map((point, index) => ({ ...point, x: index }));

  return (
    <div className="ro-chart">
      <h3>{title}</h3>
      <div className="chart-plot">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="x"
              type="category"
              tickFormatter={(index: number) => formatAxisDate(points[index]?.at ?? 0, locale)}
              tick={TICK}
              tickLine={false}
              axisLine={{ stroke: AXIS }}
              minTickGap={28}
            />
            <YAxis
              tickFormatter={(value: number) => formatCompact(value, locale)}
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={46}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={<ChartTooltip unit={unit} decimals={decimals} locale={locale} />}
              cursor={{ stroke: AXIS, strokeWidth: 1 }}
            />
            {series.length > 1 && (
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 10, color: '#3a4b5e', paddingTop: 6 }} />
            )}
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
