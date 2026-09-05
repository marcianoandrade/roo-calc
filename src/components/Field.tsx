interface StatRowProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description: string;
}

/** One line of the "Status" window: label, input and a small caption. */
export function StatRow({ id, label, value, onChange, placeholder, description }: StatRowProps) {
  const inputId =
    id ??
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const helpId = `${inputId}-help`;
  return (
    <div className="ro-row">
      <div className="ro-row-head">
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          className="ro-input"
          value={value}
          placeholder={placeholder}
          inputMode="decimal"
          aria-describedby={helpId}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <small id={helpId}>{description}</small>
    </div>
  );
}

interface MeterProps {
  label: string;
  /** 0..1 */
  progress: number;
  /** Text shown at the right of the bar (e.g. "3,038 / 4,000"). */
  text: string;
  tone?: 'hp' | 'sp';
}

/** HP/SP/EXP-style bar. */
export function Meter({ label, progress, text, tone = 'hp' }: MeterProps) {
  const percent = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <div className="ro-bar-row">
      <label>{label}</label>
      <div
        className={`ro-bar ${tone === 'sp' ? 'ro-bar-sp' : ''}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <i style={{ width: `${percent}%` }} />
      </div>
      <output>{text}</output>
    </div>
  );
}
