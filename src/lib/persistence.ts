/**
 * Cookie codecs for each screen: last-typed inputs and saved snapshots.
 * Cookie keys are namespaced under `roo.`.
 */
import { decodeRecord, encodeRecord, parseNumberField, round2, type Field } from './codec';
import { DEFAULT_DEFENSE_INPUTS, DEFENSE_FIELDS, type DefenseInputs } from './defense';
import type { SnapshotCodec } from './history';
import { DEFAULT_PVP_INPUTS, PVP_FIELDS, type PvpInputs } from './pvp';

export const COOKIE_KEYS = {
  tab: 'roo.tab',
  defenseInputs: 'roo.def.inputs',
  defenseHistory: 'roo.def.history',
  pvpInputs: 'roo.pvp.inputs',
  pvpHistory: 'roo.pvp.history',
} as const;

/* ---------------- Active tab ---------------- */

export type TabId = 'calculator' | 'counter';

export function encodeTab(tab: TabId): string {
  return tab;
}

export function decodeTab(raw: string): TabId | null {
  return raw === 'calculator' || raw === 'counter' ? raw : null;
}

/* ---------------- Defense Calculator ---------------- */

function defenseToFields(inputs: DefenseInputs): Field[] {
  return DEFENSE_FIELDS.map((key) => inputs[key]);
}

function defenseFromFields(fields: string[]): DefenseInputs | null {
  if (fields.length < DEFENSE_FIELDS.length) return null;
  const out = { ...DEFAULT_DEFENSE_INPUTS };
  DEFENSE_FIELDS.forEach((key, i) => {
    out[key] = fields[i];
  });
  return out;
}

export function encodeDefenseInputs(inputs: DefenseInputs): string {
  return encodeRecord(defenseToFields(inputs));
}

export function decodeDefenseInputs(raw: string): DefenseInputs | null {
  return defenseFromFields(decodeRecord(raw));
}

/** A defense snapshot stores the inputs themselves (results are derived on render). */
export const defenseSnapshotCodec: SnapshotCodec<DefenseInputs> = {
  toFields: defenseToFields,
  fromFields: defenseFromFields,
};

/* ---------------- PvP Counter Lab ---------------- */

export function encodePvpInputs(inputs: PvpInputs): string {
  return encodeRecord(PVP_FIELDS.map((key) => inputs[key]));
}

export function decodePvpInputs(raw: string): PvpInputs | null {
  const fields = decodeRecord(raw);
  if (fields.length < PVP_FIELDS.length) return null;
  const out: Record<string, number | boolean> = {};
  for (let i = 0; i < PVP_FIELDS.length; i++) {
    const key = PVP_FIELDS[i];
    if (key === 'isPvp') {
      out[key] = fields[i] === '1';
      continue;
    }
    const n = parseNumberField(fields[i]);
    if (n === null) return null;
    out[key] = n;
  }
  return { ...DEFAULT_PVP_INPUTS, ...(out as Partial<PvpInputs>) };
}

/** What the lab tracks over time: the headline outputs, not the 30+ inputs. */
export interface PvpSnapshot {
  physicalEstimate: number;
  magicEstimate: number;
  /** Percent of damage passing the DEF layer (0-100). */
  pdefDamageTaken: number;
  mdefDamageTaken: number;
  rawPdef: number;
  rawMdef: number;
}

const PVP_SNAPSHOT_FIELDS: readonly (keyof PvpSnapshot)[] = [
  'physicalEstimate',
  'magicEstimate',
  'pdefDamageTaken',
  'mdefDamageTaken',
  'rawPdef',
  'rawMdef',
];

export const pvpSnapshotCodec: SnapshotCodec<PvpSnapshot> = {
  toFields: (data) => PVP_SNAPSHOT_FIELDS.map((key) => round2(data[key])),
  fromFields: (fields) => {
    if (fields.length < PVP_SNAPSHOT_FIELDS.length) return null;
    const out: Partial<PvpSnapshot> = {};
    for (let i = 0; i < PVP_SNAPSHOT_FIELDS.length; i++) {
      const n = parseNumberField(fields[i]);
      if (n === null) return null;
      out[PVP_SNAPSHOT_FIELDS[i]] = n;
    }
    return out as PvpSnapshot;
  },
};
