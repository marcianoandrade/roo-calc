import { describe, expect, it } from 'vitest';
import {
  computeDefense,
  DEFAULT_DEFENSE_INPUTS,
  defenseTier,
  inputsFromRawDefense,
  normalizeDecimal,
  parseDefenseValue,
  parsePercent,
  rawDefense,
  tierLadder,
  tierProgress,
  toNumber,
} from './defense';

describe('parsePercent', () => {
  it('treats whole numbers as percent', () => {
    expect(parsePercent('23')).toBeCloseTo(0.23);
    expect(parsePercent(23)).toBeCloseTo(0.23);
  });

  it('accepts a trailing % sign and whitespace', () => {
    expect(parsePercent(' 23% ')).toBeCloseTo(0.23);
    expect(parsePercent('43.52%')).toBeCloseTo(0.4352);
  });

  it('keeps fractions below or equal to 1 untouched', () => {
    expect(parsePercent('0.23')).toBeCloseTo(0.23);
    expect(parsePercent('1')).toBe(1);
  });

  it('returns 0 for empty or invalid text', () => {
    expect(parsePercent('')).toBe(0);
    expect(parsePercent('abc')).toBe(0);
  });
});

describe('toNumber', () => {
  it('returns 0 for non-numeric input', () => {
    expect(toNumber('')).toBe(0);
    expect(toNumber('x')).toBe(0);
    expect(toNumber('12.5')).toBe(12.5);
  });

  it('accepts a decimal comma', () => {
    expect(toNumber('12,5')).toBe(12.5);
    expect(toNumber('2.318,25')).toBe(2318.25);
    expect(parsePercent('43,52%')).toBeCloseTo(0.4352);
  });
});

describe('parseDefenseValue', () => {
  it('accepts points and commas', () => {
    expect(parseDefenseValue('2328.46')).toBe(2328.46);
    expect(parseDefenseValue(' 2.328,46 ')).toBe(2328.46);
    expect(parseDefenseValue('0')).toBe(0);
  });

  it('rejects blanks, text and negatives', () => {
    expect(parseDefenseValue('')).toBeNull();
    expect(parseDefenseValue('   ')).toBeNull();
    expect(parseDefenseValue('abc')).toBeNull();
    expect(parseDefenseValue('-1')).toBeNull();
  });
});

describe('inputsFromRawDefense', () => {
  it('keeps the raw values when no percentage is given', () => {
    expect(inputsFromRawDefense({ rawPdef: 1000, rawMdef: 500 })).toEqual({
      pdef: '1000',
      mdef: '500',
      equipPdefPercent: '',
      equipMdefPercent: '',
      pdmgReduction: '',
      mdmgReduction: '',
    });
  });

  it('derives the equipment DEF from the percentages, keeping them as typed', () => {
    const inputs = inputsFromRawDefense({
      rawPdef: 2328.46,
      rawMdef: 710.34,
      equipPdefPercent: ' 23% ',
      equipMdefPercent: '16',
    });
    expect(inputs.pdef).toBe('2864.0058');
    expect(inputs.equipPdefPercent).toBe('23%');
    expect(inputs.equipMdefPercent).toBe('16');
  });

  it('computes back to the raw values that were typed', () => {
    for (const percent of ['', '0', '23', '43,5%']) {
      const results = computeDefense(
        inputsFromRawDefense({
          rawPdef: 2328.46,
          rawMdef: 710.34,
          equipPdefPercent: percent,
          equipMdefPercent: percent,
        }),
      );
      expect(results.rawPdef, percent).toBeCloseTo(2328.46);
      expect(results.rawMdef, percent).toBeCloseTo(710.34);
      expect(results.totalRawDefense, percent).toBeCloseTo(3038.8);
    }
  });

  it('ignores text that is not a percentage instead of distorting the raw value', () => {
    const inputs = inputsFromRawDefense({ rawPdef: 1000, rawMdef: 500, equipPdefPercent: 'abc' });
    expect(inputs.pdef).toBe('1000');
    expect(computeDefense(inputs).rawPdef).toBe(1000);
  });
});

describe('normalizeDecimal', () => {
  it('turns a decimal comma into a point and drops thousands dots', () => {
    expect(normalizeDecimal('43,52')).toBe('43.52');
    expect(normalizeDecimal('2.318,25')).toBe('2318.25');
    expect(normalizeDecimal(' 2318.25 ')).toBe('2318.25');
    expect(normalizeDecimal('abc')).toBe('abc');
  });
});

describe('rawDefense', () => {
  it('divides equipment DEF by 1 + DEF%', () => {
    expect(rawDefense(2864, 0.23)).toBeCloseTo(2328.4553, 3);
  });

  it('ignores negative percentages', () => {
    expect(rawDefense(1000, -0.5)).toBe(1000);
  });
});

describe('tiers', () => {
  it('maps thresholds to labels', () => {
    expect(defenseTier(999)).toBe('holding sandal mode');
    expect(defenseTier(1000)).toBe('light defense');
    expect(defenseTier(2999)).toBe('mid defense');
    expect(defenseTier(3000)).toBe('solid tank');
    expect(defenseTier(4500)).toBe('strong shield');
    expect(defenseTier(5000)).toBe('peak tank');
  });

  it('reports progress towards the next tier', () => {
    const t = tierProgress(3500);
    expect(t.name).toBe('solid tank');
    expect(t.floor).toBe(3000);
    expect(t.next).toEqual({ name: 'strong shield', at: 4000 });
    expect(t.progress).toBeCloseTo(0.5);
  });

  it('is full at the top tier and clamps below zero', () => {
    expect(tierProgress(9000)).toEqual({ name: 'peak tank', floor: 5000, next: null, progress: 1 });
    expect(tierProgress(-50).progress).toBe(0);
  });

  it('lists every tier with its inclusive range of total raw DEF', () => {
    const ladder = tierLadder();
    expect(ladder.map((t) => t.name)).toEqual([
      'holding sandal mode',
      'light defense',
      'mid defense',
      'solid tank',
      'strong shield',
      'peak tank',
    ]);
    expect(ladder[0]).toEqual({ name: 'holding sandal mode', min: 0, max: 999 });
    expect(ladder[3]).toEqual({ name: 'solid tank', min: 3000, max: 3999 });
    expect(ladder[ladder.length - 1]).toEqual({ name: 'peak tank', min: 5000, max: null });
    // Ranges are contiguous: each tier starts right after the previous one ends.
    for (let i = 1; i < ladder.length; i++) expect(ladder[i].min).toBe((ladder[i - 1].max ?? NaN) + 1);
  });
});

describe('computeDefense', () => {
  it('reproduces the reference site defaults', () => {
    const r = computeDefense(DEFAULT_DEFENSE_INPUTS);
    expect(r.rawPdef).toBeCloseTo(2328.46, 2);
    expect(r.rawMdef).toBeCloseTo(710.34, 2);
    expect(r.totalRawDefense).toBeCloseTo(3038.8, 1);
    expect(r.pdmgReduction).toBeCloseTo(0.4352);
    expect(r.mdmgReduction).toBeCloseTo(0.5852);
    expect(r.tier.name).toBe('solid tank');
  });

  it('handles blank inputs without NaN', () => {
    const r = computeDefense({
      pdef: '',
      mdef: '',
      equipPdefPercent: '',
      equipMdefPercent: '',
      pdmgReduction: '',
      mdmgReduction: '',
    });
    expect(r.rawPdef).toBe(0);
    expect(r.tier.name).toBe('holding sandal mode');
  });
});
