import { useEffect, useState, type ReactNode } from 'react';

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
    setFeedback('Snapshot saved to cookies.');
  };

  const calculate = () => {
    onCalculate?.();
    setFeedback('Recalculated from the current inputs.');
  };

  const status =
    count > 0 ? `${count} of ${max} snapshots stored in this browser's cookies.` : 'Snapshots are stored in this browser’s cookies.';

  return (
    <div className="ro-actions">
      <input
        className="ro-input"
        aria-label="Snapshot label"
        placeholder="Label (optional), e.g. after +10 armor"
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
          Calculate
        </button>
      )}
      <button type="button" className="ro-button ro-button-primary" onClick={save}>
        Save snapshot
      </button>
      {children}
      <p className="ro-feedback" aria-live="polite">
        {feedback || status}
      </p>
    </div>
  );
}
