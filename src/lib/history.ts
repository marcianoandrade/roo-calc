import { useCallback, useEffect, useRef, useState } from 'react';
import { decodeList, encodeList, type Field } from './codec';
import { getItem, setItem } from './cookies';

export interface Snapshot<T> {
  /** Unix time in milliseconds. */
  at: number;
  label: string;
  data: T;
}

export interface SnapshotCodec<T> {
  toFields(data: T): Field[];
  fromFields(fields: string[]): T | null;
}

/** Hard cap so the cookie header stays small (browsers and hosts reject very large headers). */
export const MAX_HISTORY = 80;

export function encodeSnapshots<T>(items: readonly Snapshot<T>[], codec: SnapshotCodec<T>): string {
  return encodeList(items.map((s) => [s.at.toString(36), s.label, ...codec.toFields(s.data)]));
}

export function decodeSnapshots<T>(raw: string | null, codec: SnapshotCodec<T>): Snapshot<T>[] {
  if (raw === null) return [];
  const out: Snapshot<T>[] = [];
  for (const record of decodeList(raw)) {
    const [atRaw, label = '', ...rest] = record;
    const at = parseInt(atRaw, 36);
    if (!Number.isFinite(at)) continue;
    const data = codec.fromFields(rest);
    if (data === null) continue;
    out.push({ at, label, data });
  }
  return out;
}

/**
 * Like useState, but initialised from a cookie and written back on every change.
 * `encode`/`decode` must be stable references (module-level functions).
 */
export function useCookieState<T>(
  key: string,
  defaultValue: T,
  encode: (value: T) => string,
  decode: (raw: string) => T | null,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const raw = getItem(key);
    if (raw === null) return defaultValue;
    return decode(raw) ?? defaultValue;
  });

  useEffect(() => {
    setItem(key, encode(value));
  }, [key, value, encode]);

  return [value, setValue];
}

export interface CookieHistory<T> {
  entries: Snapshot<T>[];
  add(data: T, label: string): void;
  remove(index: number): void;
  clear(): void;
  max: number;
}

/** Append-only history of snapshots persisted in cookies, oldest entries dropped past `max`. */
export function useCookieHistory<T>(key: string, codec: SnapshotCodec<T>, max = MAX_HISTORY): CookieHistory<T> {
  const [entries, setEntries] = useState<Snapshot<T>[]>(() => decodeSnapshots(getItem(key), codec));
  const latest = useRef(entries);
  latest.current = entries;

  const persist = useCallback(
    (next: Snapshot<T>[]) => {
      let list = next.slice(-max);
      // Drop the oldest entries until the payload fits the cookie budget.
      while (list.length > 0 && !setItem(key, encodeSnapshots(list, codec))) {
        list = list.slice(1);
      }
      if (list.length === 0) setItem(key, '');
      setEntries(list);
    },
    [key, codec, max],
  );

  const add = useCallback(
    (data: T, label: string) => persist([...latest.current, { at: Date.now(), label: label.trim(), data }]),
    [persist],
  );
  const remove = useCallback((index: number) => persist(latest.current.filter((_, i) => i !== index)), [persist]);
  const clear = useCallback(() => persist([]), [persist]);

  return { entries, add, remove, clear, max };
}
