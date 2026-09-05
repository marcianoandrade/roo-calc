import { useState } from 'react';
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
  max: number;
  onRemove: (index: number) => void;
  onClear: () => void;
  onLoad?: (index: number) => void;
}

export function HistoryTable<T>({ entries, columns, max, onRemove, onClear, onLoad }: HistoryTableProps<T>) {
  const [confirming, setConfirming] = useState(false);
  if (entries.length === 0) return null;

  // Newest first, but keep the original index so remove/load hit the right entry.
  const rows = entries.map((entry, index) => ({ entry, index })).reverse();

  return (
    <div className="chart-card">
      <div className="tracking-head">
        <h3>Saved snapshots</h3>
        <div className="history-actions">
          <span className="tracking-count">
            {entries.length} / {max}
          </span>
          {confirming ? (
            <>
              <button
                type="button"
                className="ghost-button ghost-button-danger"
                onClick={() => {
                  onClear();
                  setConfirming(false);
                }}
              >
                Confirm clear
              </button>
              <button type="button" className="ghost-button" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className="ghost-button ghost-button-danger" onClick={() => setConfirming(true)}>
              Clear all
            </button>
          )}
        </div>
      </div>
      <div className="table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Label</th>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entry, index }) => (
              <tr key={`${entry.at}-${index}`}>
                <td data-label="When">{formatDateTime(entry.at)}</td>
                <td data-label="Label">{entry.label || '—'}</td>
                {columns.map((column) => (
                  <td key={column.key} className="num" data-label={column.label}>
                    {column.render(entry.data)}
                  </td>
                ))}
                <td className="actions">
                  {onLoad && (
                    <button type="button" className="ghost-button" onClick={() => onLoad(index)}>
                      Load
                    </button>
                  )}
                  <button type="button" className="ghost-button ghost-button-danger" onClick={() => onRemove(index)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
