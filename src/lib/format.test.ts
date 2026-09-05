import { describe, expect, it } from 'vitest';
import { formatCompact, formatNumber, formatPercent } from './format';

describe('formatNumber', () => {
  it('uses thousands separators and at most two decimals', () => {
    expect(formatNumber(2328.4553)).toBe('2,328.46');
    expect(formatNumber(710)).toBe('710');
  });
});

describe('formatPercent', () => {
  it('turns a fraction into a percent string', () => {
    expect(formatPercent(0.4352)).toBe('43.52%');
    expect(formatPercent(0.5, 0)).toBe('50%');
  });
});

describe('formatCompact', () => {
  it('keeps full numbers below 10,000 so close ticks stay distinct', () => {
    expect(formatCompact(1050)).toBe('1,050');
    expect(formatCompact(1125)).toBe('1,125');
    expect(formatCompact(825)).toBe('825');
  });

  it('abbreviates from 10,000 up', () => {
    expect(formatCompact(10000)).toBe('10k');
    expect(formatCompact(12500)).toBe('12.5k');
  });
});
