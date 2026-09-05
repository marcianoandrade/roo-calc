import type { ReactNode } from 'react';

export function InputSection({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="sandbox-panel sandbox-input-section">
      <h2>{title}</h2>
      <p className="sandbox-section-note">{note}</p>
      <div className="sandbox-controls">{children}</div>
    </section>
  );
}

export function ResultColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sandbox-result-column">
      <h3>{title}</h3>
      <div className="sandbox-grid sandbox-compact">{children}</div>
    </section>
  );
}

function InfoBubble({ text }: { text: string }) {
  return (
    <span className="sandbox-info-bubble" title={text}>
      ?
    </span>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  help: string;
  step?: number;
}

export function NumberField({ label, value, onChange, help, step = 1 }: NumberFieldProps) {
  return (
    <label className="sandbox-field">
      <span className="sandbox-label-row">
        {label}
        <InfoBubble text={help} />
      </span>
      <input type="number" value={value} step={step} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help: string;
  options: readonly (readonly [label: string, value: string])[];
}

export function SelectField({ label, value, onChange, help, options }: SelectFieldProps) {
  return (
    <label className="sandbox-field">
      <span className="sandbox-label-row">
        {label}
        <InfoBubble text={help} />
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([text, optionValue]) => (
          <option key={optionValue} value={optionValue}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LayerRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="sandbox-layer-row">
      <span>{label}</span>
      <strong>{(value * 100).toFixed(2)}%</strong>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: number;
  highlight?: boolean;
  suffix?: string;
  decimals?: number;
}

export function ResultCard({ label, value, highlight, suffix = '', decimals = 0 }: ResultCardProps) {
  return (
    <article className={highlight ? 'sandbox-card sandbox-highlight' : 'sandbox-card'}>
      <span>{label}</span>
      <strong>
        {value.toFixed(decimals)}
        {suffix}
      </strong>
    </article>
  );
}
