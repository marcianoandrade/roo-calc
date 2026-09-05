import { describe, expect, it } from 'vitest';
import { decodeLocale, detectLocale, intlTag, LOCALES, MESSAGES, type Messages } from './index';

function flatten(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
}

function leaves(value: unknown): unknown[] {
  if (typeof value !== 'object' || value === null) return [value];
  return Object.values(value).flatMap(leaves);
}

describe('detectLocale', () => {
  it('maps browser tags to supported locales', () => {
    expect(detectLocale('pt-BR')).toBe('pt-BR');
    expect(detectLocale('pt')).toBe('pt-BR');
    expect(detectLocale('es-MX')).toBe('es');
    expect(detectLocale('ES')).toBe('es');
    expect(detectLocale('en-US')).toBe('en');
  });

  it('falls back to English', () => {
    expect(detectLocale('fr-FR')).toBe('en');
    expect(detectLocale(undefined)).toBe('en');
  });
});

describe('decodeLocale', () => {
  it('accepts only supported ids', () => {
    expect(decodeLocale('pt-BR')).toBe('pt-BR');
    expect(decodeLocale('es')).toBe('es');
    expect(decodeLocale('de')).toBeNull();
  });
});

describe('dictionaries', () => {
  it('every locale has exactly the keys of the English reference', () => {
    const reference = flatten(MESSAGES.en).sort();
    for (const { id } of LOCALES) {
      expect(flatten(MESSAGES[id]).sort(), id).toEqual(reference);
    }
  });

  it('has no empty strings', () => {
    for (const { id } of LOCALES) {
      const empty = leaves(MESSAGES[id]).filter((v) => typeof v === 'string' && v.trim() === '');
      expect(empty, id).toEqual([]);
    }
  });

  it('formats the parameterised messages', () => {
    const check = (m: Messages) => {
      expect(m.actions.stored(2, 80)).toContain('2');
      expect(m.tier.next('x', '4,000')).toContain('4,000');
      expect(m.tracking.count(3)).toContain('3');
    };
    LOCALES.forEach(({ id }) => check(MESSAGES[id]));
  });

  it('maps Intl tags', () => {
    expect(intlTag('en')).toBe('en-US');
    expect(intlTag('pt-BR')).toBe('pt-BR');
    expect(intlTag('es')).toBe('es');
  });
});
