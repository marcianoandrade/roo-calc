import { describe, expect, it } from 'vitest';
import { decodeList, decodeRecord, encodeList, encodeRecord, parseNumberField, round2 } from './codec';

describe('record codec', () => {
  it('round-trips strings, numbers and booleans', () => {
    const encoded = encodeRecord(['2864', 23.5, true, false, 'x']);
    expect(encoded).toBe('2864|23.5|1|0|x');
    expect(decodeRecord(encoded)).toEqual(['2864', '23.5', '1', '0', 'x']);
  });

  it('escapes the separators inside strings', () => {
    const label = 'a|b~c;d,e "f" 100%';
    const encoded = encodeRecord([label, 1]);
    expect(encoded).not.toMatch(/[;," ]/);
    expect(encoded.split('|')).toHaveLength(2);
    expect(decodeRecord(encoded)[0]).toBe(label);
  });

  it('keeps unicode intact', () => {
    const label = 'após refino +10 ✨';
    expect(decodeRecord(encodeRecord([label]))[0]).toBe(label);
  });

  it('writes non-finite numbers as 0', () => {
    expect(encodeRecord([Number.NaN, Number.POSITIVE_INFINITY])).toBe('0|0');
  });
});

describe('list codec', () => {
  it('round-trips a list of records', () => {
    const records = [
      ['a', 1],
      ['b~c', 2],
    ];
    const encoded = encodeList(records);
    expect(encoded.split('~')).toHaveLength(2);
    expect(decodeList(encoded)).toEqual([
      ['a', '1'],
      ['b~c', '2'],
    ]);
  });

  it('decodes an empty string as an empty list', () => {
    expect(encodeList([])).toBe('');
    expect(decodeList('')).toEqual([]);
  });
});

describe('helpers', () => {
  it('parseNumberField rejects blanks and garbage', () => {
    expect(parseNumberField('12.5')).toBe(12.5);
    expect(parseNumberField('')).toBeNull();
    expect(parseNumberField(undefined)).toBeNull();
    expect(parseNumberField('abc')).toBeNull();
  });

  it('round2 keeps two decimals', () => {
    expect(round2(1.005)).toBeCloseTo(1, 2);
    expect(round2(2328.45528)).toBe(2328.46);
  });
});
