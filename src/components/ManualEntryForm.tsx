import { useState } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { parseDefenseValue, type RawDefenseReading } from '../lib/defense';
import { parseDateTimeInput, toDateTimeInputValue } from '../lib/format';

interface ManualEntryFormProps {
  /** Records a reading taken elsewhere, timestamped at `at`. */
  onAdd: (reading: RawDefenseReading, label: string, at: number) => void;
}

/** Backfills the history with readings taken elsewhere (e.g. the original calculator). */
export function ManualEntryForm({ onAdd }: ManualEntryFormProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState(() => toDateTimeInputValue(Date.now()));
  const [rawPdef, setRawPdef] = useState('');
  const [rawMdef, setRawMdef] = useState('');
  const [pdefPercent, setPdefPercent] = useState('');
  const [mdefPercent, setMdefPercent] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const close = () => {
    setOpen(false);
    setError('');
  };

  const submit = () => {
    const at = parseDateTimeInput(when);
    const pdef = parseDefenseValue(rawPdef);
    const mdef = parseDefenseValue(rawMdef);
    if (at === null || pdef === null || mdef === null) {
      setError(t.manual.invalid);
      setFeedback('');
      return;
    }
    // The percentages are optional: blank ones simply leave raw DEF = equipment DEF.
    onAdd({ rawPdef: pdef, rawMdef: mdef, equipPdefPercent: pdefPercent, equipMdefPercent: mdefPercent }, label, at);
    setRawPdef('');
    setRawMdef('');
    setPdefPercent('');
    setMdefPercent('');
    setLabel('');
    setWhen(toDateTimeInputValue(Date.now()));
    setError('');
    setFeedback(t.manual.added);
  };

  if (!open) {
    return (
      <div className="ro-manual-toggle">
        <button type="button" className="ro-button" onClick={() => setOpen(true)}>
          {t.manual.toggle}
        </button>
        {feedback && (
          <p className="ro-feedback" aria-live="polite">
            {feedback}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="ro-manual"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p className="ro-section-title">{t.manual.title}</p>
      <p className="ro-help">{t.manual.help}</p>
      {/* Same field order as the Status window: PDEF, MDEF, PDEF %, MDEF %. */}
      <div className="ro-manual-grid">
        <label className="ro-manual-field ro-manual-field-wide">
          <span>{t.manual.when}</span>
          <input className="ro-input" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        <label className="ro-manual-field ro-manual-field-wide">
          <span>{t.manual.label}</span>
          <input
            className="ro-input"
            maxLength={40}
            placeholder={t.manual.labelPlaceholder}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <label className="ro-manual-field">
          <span>{t.manual.rawPdef}</span>
          <input
            className="ro-input"
            inputMode="decimal"
            placeholder={t.manual.rawPlaceholder}
            value={rawPdef}
            onChange={(e) => setRawPdef(e.target.value)}
          />
        </label>
        <label className="ro-manual-field">
          <span>{t.manual.rawMdef}</span>
          <input
            className="ro-input"
            inputMode="decimal"
            placeholder={t.manual.rawPlaceholder}
            value={rawMdef}
            onChange={(e) => setRawMdef(e.target.value)}
          />
        </label>
        <label className="ro-manual-field">
          <span>{t.manual.pdefPercent}</span>
          <input
            className="ro-input"
            inputMode="decimal"
            placeholder={t.status.pdefPercentPlaceholder}
            value={pdefPercent}
            onChange={(e) => setPdefPercent(e.target.value)}
          />
        </label>
        <label className="ro-manual-field">
          <span>{t.manual.mdefPercent}</span>
          <input
            className="ro-input"
            inputMode="decimal"
            placeholder={t.status.mdefPercentPlaceholder}
            value={mdefPercent}
            onChange={(e) => setMdefPercent(e.target.value)}
          />
        </label>
      </div>
      <div className="ro-manual-actions">
        <button type="submit" className="ro-button ro-button-primary">
          {t.manual.add}
        </button>
        <button type="button" className="ro-button" onClick={close}>
          {t.manual.cancel}
        </button>
        <p className={error ? 'ro-feedback ro-feedback-error' : 'ro-feedback'} aria-live="polite">
          {error || feedback || t.manual.note}
        </p>
      </div>
    </form>
  );
}
