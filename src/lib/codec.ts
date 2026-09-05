/**
 * Compact record serialization for cookie storage.
 *
 * A record is a list of fields joined by `|`; a list of records is joined by `~`.
 * Strings are percent-encoded so the separators never appear inside a field.
 * This is far smaller than JSON once escaped for cookies.
 */

export type Field = string | number | boolean;

const FIELD_SEP = '|';
const RECORD_SEP = '~';

export function encodeText(value: string): string {
  return encodeURIComponent(value).replace(/~/g, '%7E');
}

export function decodeText(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function encodeField(field: Field): string {
  if (typeof field === 'string') return encodeText(field);
  if (typeof field === 'boolean') return field ? '1' : '0';
  return Number.isFinite(field) ? String(field) : '0';
}

export function encodeRecord(fields: readonly Field[]): string {
  return fields.map(encodeField).join(FIELD_SEP);
}

export function decodeRecord(record: string): string[] {
  return record.split(FIELD_SEP).map(decodeText);
}

export function encodeList(records: readonly (readonly Field[])[]): string {
  return records.map(encodeRecord).join(RECORD_SEP);
}

export function decodeList(raw: string): string[][] {
  if (raw === '') return [];
  return raw.split(RECORD_SEP).map(decodeRecord);
}

/** Parses a number field; returns null for anything that is not finite. */
export function parseNumberField(field: string | undefined): number | null {
  if (field === undefined || field === '') return null;
  const n = Number(field);
  return Number.isFinite(n) ? n : null;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
