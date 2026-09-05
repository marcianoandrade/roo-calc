import { describe, expect, it } from 'vitest';
import {
  computeDefense,
  DEFAULT_DEFENSE_INPUTS,
  defenseTier,
  parsePercent,
  rawDefense,
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
