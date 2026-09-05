/**
 * Defense Calculator formulas (Ragnarok Origin).
 * Ported from the reference site; pure functions, no React.
 */

export interface DefenseInputs {
  pdef: string;
  mdef: string;
  equipPdefPercent: string;
  equipMdefPercent: string;
  ignorePdef: string;
  ignoreMdef: string;
  pdmgReduction: string;
  mdmgReduction: string;
}

/** Field order used when serializing inputs (never reorder: cookies depend on it). */
export const DEFENSE_FIELDS: readonly (keyof DefenseInputs)[] = [
  'pdef',
  'mdef',
  'equipPdefPercent',
  'equipMdefPercent',
  'ignorePdef',
  'ignoreMdef',
  'pdmgReduction',
  'mdmgReduction',
];

export const DEFAULT_DEFENSE_INPUTS: DefenseInputs = {
  pdef: '2864',
  mdef: '824',
  equipPdefPercent: '23',
  equipMdefPercent: '16',
  ignorePdef: '315',
  ignoreMdef: '76',
  pdmgReduction: '43.52',
  mdmgReduction: '58.52',
};

export interface DefenseResults {
  rawPdef: number;
  rawMdef: number;
  pdefAfterIgnore: number;
  mdefAfterIgnore: number;
  /** Fractions (0.4352 for "43.52%"). */
  pdmgReduction: number;
  mdmgReduction: number;
  totalRawDefense: number;
  tier: string;
}

/** Accepts "23", "23%", "0.23" or a number. Values above 1 are treated as percent. */
export function parsePercent(value: string | number): number {
  if (typeof value === 'number') return value > 1 ? value / 100 : value;
  const cleaned = value.trim().replace(/%/g, '');
  if (cleaned === '') return 0;
  const n = Number(cleaned);
  if (Number.isNaN(n)) return 0;
  return n > 1 ? n / 100 : n;
}

export function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Raw DEF = equipment DEF / (1 + equipment DEF%). */
export function rawDefense(equipmentDefense: number, equipmentPercent: number): number {
  const divisor = 1 + Math.max(equipmentPercent, 0);
  return divisor === 0 ? 0 : equipmentDefense / divisor;
}

export function effectiveDefense(raw: number, ignore: number): number {
  return Math.max(raw - ignore, 0);
}

export function defenseTier(totalRawDefense: number): string {
  if (totalRawDefense < 1000) return 'holding sandal mode';
  if (totalRawDefense < 2000) return 'light defense';
  if (totalRawDefense < 3000) return 'mid defense';
  if (totalRawDefense < 4000) return 'solid tank';
  if (totalRawDefense < 5000) return 'strong shield';
  return 'peak tank';
}

export function computeDefense(inputs: DefenseInputs): DefenseResults {
  const rawPdef = rawDefense(toNumber(inputs.pdef), parsePercent(inputs.equipPdefPercent));
  const rawMdef = rawDefense(toNumber(inputs.mdef), parsePercent(inputs.equipMdefPercent));
  const totalRawDefense = rawPdef + rawMdef;
  return {
    rawPdef,
    rawMdef,
    pdefAfterIgnore: effectiveDefense(rawPdef, toNumber(inputs.ignorePdef)),
    mdefAfterIgnore: effectiveDefense(rawMdef, toNumber(inputs.ignoreMdef)),
    pdmgReduction: parsePercent(inputs.pdmgReduction),
    mdmgReduction: parsePercent(inputs.mdmgReduction),
    totalRawDefense,
    tier: defenseTier(totalRawDefense),
  };
}
