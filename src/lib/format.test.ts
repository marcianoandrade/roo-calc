import { describe, expect, it } from 'vitest';
import {
  formatCompact,
  formatFixed,
  formatNumber,
  formatPercent,
  parseDateTimeInput,
  toDateTimeInputValue,
} from './format';

describe('formatNumber', () => {
  it('uses thousands separators and at most two decimals', () => {
    expect(formatNumber(2328.4553)).toBe('2,328.46');
    expect(formatNumber(710)).toBe('710');
  });

  it('follows the locale', () => {
    expect(formatNumber(2328.4553, 'pt-BR')).toBe('2.328,46');
    expect(formatNumber(2328.4553, 'es')).toBe('2328,46');
  });
});

describe('formatFixed / formatPercent', () => {
  it('keeps exactly the requested decimals', () => {
    expect(formatFixed(1.5, 2)).toBe('1.50');
    expect(formatFixed(1.5, 2, 'pt-BR')).toBe('1,50');
  });

  it('turns a fraction into a percent string', () => {
    expect(formatPercent(0.4352)).toBe('43.52%');
    expect(formatPercent(0.5, 0)).toBe('50%');
    expect(formatPercent(0.4352, 2, 'pt-BR')).toBe('43,52%');
  });
});

describe('datetime-local input value', () => {
  it('round-trips a local date and time', () => {
    const at = new Date(2026, 1, 28, 9, 5).getTime();
    expect(toDateTimeInputValue(at)).toBe('2026-02-28T09:05');
    expect(parseDateTimeInput('2026-02-28T09:05')).toBe(at);
  });

  it('treats a date without time as midnight', () => {
    expect(parseDateTimeInput('2026-02-28')).toBe(new Date(2026, 1, 28, 0, 0).getTime());
  });

  it('rejects empty, malformed and impossible dates', () => {
    expect(parseDateTimeInput('')).toBeNull();
    expect(parseDateTimeInput('28/02/2026')).toBeNull();
    expect(parseDateTimeInput('2026-02-31T10:00')).toBeNull();
    expect(parseDateTimeInput('2026-13-01T10:00')).toBeNull();
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
    expect(formatCompact(12500, 'pt-BR')).toBe('12,5k');
  });
});
