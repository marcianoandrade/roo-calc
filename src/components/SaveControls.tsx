import { useEffect, useState, type ReactNode } from 'react';
import { useLocale } from '../i18n/LocaleContext';

interface SaveControlsProps {
  onSave: (label: string) => void;
  /** Re-runs the calculation on demand (the values already update live while typing). */
  onCalculate?: () => void;
  count: number;
  max: number;
  /** Extra buttons rendered after the save button (e.g. Reset). */
  children?: ReactNode;
}

export function SaveControls({ onSave, onCalculate, count, max, children }: SaveControlsProps) {
  const { t } = useLocale();
  const [label, setLabel] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 2500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const save = () => {
    onSave(label);
    setLabel('');
    setFeedback(t.actions.saved);
  };

  const calculate = () => {
    onCalculate?.();
    setFeedback(t.actions.recalculated);
  };

  const status = count > 0 ? t.actions.stored(count, max) : t.actions.storedNone;

  return (
    <div className="ro-actions">
      <input
        className="ro-input"
        aria-label={t.actions.labelAria}
        placeholder={t.actions.labelPlaceholder}
        value={label}
        maxLength={40}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            save();
          }
        }}
      />
      {onCalculate && (
        <button type="button" className="ro-button" onClick={calculate}>
          {t.actions.calculate}
        </button>
      )}
      <button type="button" className="ro-button ro-button-primary" onClick={save}>
        {t.actions.save}
      </button>
      {children}
      <p className="ro-feedback" aria-live="polite">
        {feedback || status}
      </p>
    </div>
  );
}
