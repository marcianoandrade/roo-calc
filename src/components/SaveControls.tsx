import { useEffect, useState, type ReactNode } from 'react';

interface SaveControlsProps {
  onSave: (label: string) => void;
  count: number;
  max: number;
  className: string;
  /** Extra buttons rendered next to the save button (e.g. Reset). */
  children?: ReactNode;
}

export function SaveControls({ onSave, count, max, className, children }: SaveControlsProps) {
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

  const status =
    count > 0 ? `${count} of ${max} snapshots stored in this browser's cookies.` : 'Snapshots are stored in this browser’s cookies.';

  return (
    <div className={className}>
      <input
        className="label-input"
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
      <button type="button" className="save-button" onClick={save}>
        Save snapshot
      </button>
      {children}
      <p className="save-feedback" aria-live="polite">
        {feedback || status}
      </p>
    </div>
  );
}
