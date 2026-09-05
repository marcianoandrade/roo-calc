interface FieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description: string;
}

export function Field({ id, label, value, onChange, placeholder, description }: FieldProps) {
  const inputId =
    id ??
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <input
        id={inputId}
        aria-label={label}
        value={value}
        placeholder={placeholder}
        inputMode="decimal"
        onChange={(e) => onChange(e.target.value)}
      />
      <small className="field-description">{description}</small>
    </label>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  tone?: 'purple' | 'blue' | 'gold';
}

export function MetricCard({ label, value, tone }: MetricCardProps) {
  return (
    <div className={`metric-card ${tone ? `metric-card-${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
