/**
 * Defense Calculator formulas (Ragnarok Origin).
 * Ported from the reference site; pure functions, no React.
 */

export interface DefenseInputs {
  pdef: string;
  mdef: string;
  equipPdefPercent: string;
  equipMdefPercent: string;
  pdmgReduction: string;
  mdmgReduction: string;
}

/** Field order used when serializing inputs (never reorder: cookies depend on it). */
export const DEFENSE_FIELDS: readonly (keyof DefenseInputs)[] = [
  'pdef',
  'mdef',
  'equipPdefPercent',
  'equipMdefPercent',
  'pdmgReduction',
  'mdmgReduction',
];

export const DEFAULT_DEFENSE_INPUTS: DefenseInputs = {
  pdef: '2864',
  mdef: '824',
  equipPdefPercent: '23',
  equipMdefPercent: '16',
  pdmgReduction: '43.52',
  mdmgReduction: '58.52',
};

/** Tier labels by total raw DEF (PDEF + MDEF), lowest first. Names are stable ids; the UI translates them. */
export const DEFENSE_TIERS = [
  { name: 'holding sandal mode', min: 0 },
  { name: 'light defense', min: 1000 },
  { name: 'mid defense', min: 2000 },
  { name: 'solid tank', min: 3000 },
  { name: 'strong shield', min: 4000 },
  { name: 'peak tank', min: 5000 },
] as const;

export type TierName = (typeof DEFENSE_TIERS)[number]['name'];

export interface TierProgress {
  name: TierName;
  /** Lower bound of the current tier. */
  floor: number;
  /** Next tier, or null when already at the top. */
  next: { name: TierName; at: number } | null;
  /** 0..1 progress from `floor` to the next tier (1 at the top tier). */
  progress: number;
}

export interface DefenseResults {
  rawPdef: number;
  rawMdef: number;
  /** Fractions (0.4352 for "43.52%"). */
  pdmgReduction: number;
  mdmgReduction: number;
  totalRawDefense: number;
  tier: TierProgress;
}

/**
 * Accepts a decimal comma as well as a decimal point: "43,52" -> "43.52",
 * "2.318,25" -> "2318.25". Text without a comma is returned unchanged.
 */
export function normalizeDecimal(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.includes(',')) return trimmed;
  return trimmed.replace(/\./g, '').replace(',', '.');
}

/** Accepts "23", "23%", "0.23", "23,5" or a number. Values above 1 are treated as percent. */
export function parsePercent(value: string | number): number {
  if (typeof value === 'number') return value > 1 ? value / 100 : value;
  const cleaned = normalizeDecimal(value.replace(/%/g, ''));
  if (cleaned === '') return 0;
  const n = Number(cleaned);
  if (Number.isNaN(n)) return 0;
  return n > 1 ? n / 100 : n;
}

export function toNumber(value: string): number {
  const n = Number(normalizeDecimal(value));
  return Number.isFinite(n) ? n : 0;
}

/** Raw DEF = equipment DEF / (1 + equipment DEF%). */
export function rawDefense(equipmentDefense: number, equipmentPercent: number): number {
  const divisor = 1 + Math.max(equipmentPercent, 0);
  return divisor === 0 ? 0 : equipmentDefense / divisor;
}

export function defenseTier(totalRawDefense: number): string {
  return tierProgress(totalRawDefense).name;
}

/** One tier with its inclusive range of total raw DEF (`max` is null for the top tier). */
export interface TierRange {
  name: TierName;
  min: number;
  max: number | null;
}

/** Every tier, lowest first, with the range of total raw DEF it covers. */
export function tierLadder(): TierRange[] {
  return DEFENSE_TIERS.map((tier, i) => {
    const upper = DEFENSE_TIERS[i + 1];
    return { name: tier.name, min: tier.min, max: upper ? upper.min - 1 : null };
  });
}

export function tierProgress(totalRawDefense: number): TierProgress {
  let index = 0;
  for (let i = 0; i < DEFENSE_TIERS.length; i++) {
    if (totalRawDefense >= DEFENSE_TIERS[i].min) index = i;
  }
  const current = DEFENSE_TIERS[index];
  const upper = DEFENSE_TIERS[index + 1];
  if (!upper) return { name: current.name, floor: current.min, next: null, progress: 1 };
  const span = upper.min - current.min;
  const progress = Math.min(Math.max((totalRawDefense - current.min) / span, 0), 1);
  return { name: current.name, floor: current.min, next: { name: upper.name, at: upper.min }, progress };
}

export function computeDefense(inputs: DefenseInputs): DefenseResults {
  const rawPdef = rawDefense(toNumber(inputs.pdef), parsePercent(inputs.equipPdefPercent));
  const rawMdef = rawDefense(toNumber(inputs.mdef), parsePercent(inputs.equipMdefPercent));
  const totalRawDefense = rawPdef + rawMdef;
  return {
    rawPdef,
    rawMdef,
    pdmgReduction: parsePercent(inputs.pdmgReduction),
    mdmgReduction: parsePercent(inputs.mdmgReduction),
    totalRawDefense,
    tier: tierProgress(totalRawDefense),
  };
}
