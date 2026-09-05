import { useState } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { formatDateTime } from '../lib/format';
import type { Snapshot } from '../lib/history';

export interface HistoryColumn<T> {
  key: string;
  label: string;
  render: (data: T) => string;
}

interface HistoryTableProps<T> {
  entries: Snapshot<T>[];
  columns: HistoryColumn<T>[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onLoad?: (index: number) => void;
}

export function HistoryTable<T>({ entries, columns, onRemove, onClear, onLoad }: HistoryTableProps<T>) {
  const { t, locale } = useLocale();
  const [confirming, setConfirming] = useState(false);

  // Newest first, but keep the original index so remove/load hit the right entry.
  const rows = entries.map((entry, index) => ({ entry, index })).reverse();

  return (
    <>
      <div className="ro-table-head">
        <p className="ro-help">{t.history.help}</p>
        <div className="history-actions">
          {confirming ? (
            <>
              <button
                type="button"
                className="ro-button ro-button-danger"
                onClick={() => {
                  onClear();
                  setConfirming(false);
                }}
              >
                {t.history.confirmClear}
              </button>
              <button type="button" className="ro-button" onClick={() => setConfirming(false)}>
                {t.history.cancel}
              </button>
            </>
          ) : (
            <button type="button" className="ro-button ro-button-danger" onClick={() => setConfirming(true)}>
              {t.history.clearAll}
            </button>
          )}
        </div>
      </div>
      <div className="ro-table-wrap">
        <table className="ro-table">
          <thead>
            <tr>
              <th>{t.history.when}</th>
              <th>{t.history.label}</th>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th aria-label={t.history.actions} />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entry, index }) => (
              <tr key={`${entry.at}-${index}`}>
                <td data-label={t.history.when}>{formatDateTime(entry.at, locale)}</td>
                <td data-label={t.history.label}>{entry.label || t.history.noLabel}</td>
                {columns.map((column) => (
                  <td key={column.key} className="num" data-label={column.label}>
                    {column.render(entry.data)}
                  </td>
                ))}
                <td className="actions">
                  {onLoad && (
                    <button type="button" className="ro-button" onClick={() => onLoad(index)}>
                      {t.history.load}
                    </button>
                  )}
                  <button type="button" className="ro-button ro-button-danger" onClick={() => onRemove(index)}>
                    {t.history.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
