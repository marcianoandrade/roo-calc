/**
 * Cookie codecs for the Defense Calculator: last-typed inputs and saved snapshots.
 * Cookie keys are namespaced under `roo.`.
 */
import { decodeRecord, encodeRecord, type Field } from './codec';
import { DEFAULT_DEFENSE_INPUTS, DEFENSE_FIELDS, type DefenseInputs } from './defense';
import type { SnapshotCodec } from './history';

export const COOKIE_KEYS = {
  defenseInputs: 'roo.def.inputs',
  defenseHistory: 'roo.def.history',
  locale: 'roo.lang',
} as const;

/** Keys used by screens that no longer exist; removed on page load. */
export const LEGACY_COOKIE_KEYS: readonly string[] = ['roo.tab', 'roo.pvp.inputs', 'roo.pvp.history'];

/**
 * Layout written by the first version of the page, which also stored the
 * Ignore PDEF/MDEF fields (positions 4 and 5). Still readable so nothing is lost.
 */
const LEGACY_DEFENSE_FIELDS_V1: readonly (keyof DefenseInputs | null)[] = [
  'pdef',
  'mdef',
  'equipPdefPercent',
  'equipMdefPercent',
  null,
  null,
  'pdmgReduction',
  'mdmgReduction',
];

function defenseToFields(inputs: DefenseInputs): Field[] {
  return DEFENSE_FIELDS.map((key) => inputs[key]);
}

function defenseFromFields(fields: string[]): DefenseInputs | null {
  const layout = fields.length >= LEGACY_DEFENSE_FIELDS_V1.length ? LEGACY_DEFENSE_FIELDS_V1 : DEFENSE_FIELDS;
  if (fields.length < layout.length) return null;
  const out = { ...DEFAULT_DEFENSE_INPUTS };
  layout.forEach((key, i) => {
    if (key) out[key] = fields[i];
  });
  return out;
}

export function encodeDefenseInputs(inputs: DefenseInputs): string {
  return encodeRecord(defenseToFields(inputs));
}

export function decodeDefenseInputs(raw: string): DefenseInputs | null {
  return defenseFromFields(decodeRecord(raw));
}

/** A snapshot stores the inputs themselves (results are derived on render). */
export const defenseSnapshotCodec: SnapshotCodec<DefenseInputs> = {
  toFields: defenseToFields,
  fromFields: defenseFromFields,
};
