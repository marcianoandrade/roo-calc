import { beforeEach, describe, expect, it } from 'vitest';
import { cookiesEnabled, getItem, readCookie, removeItem, setItem } from './cookies';

function clearAllCookies() {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0].trim();
    if (name) document.cookie = `${name}=; max-age=0; path=/`;
  }
}

function cookieNames(): string[] {
  return document.cookie
    .split(';')
    .map((part) => part.split('=')[0].trim())
    .filter(Boolean)
    .sort();
}

describe('cookie store', () => {
  beforeEach(() => clearAllCookies());

  it('reports cookies as enabled in jsdom', () => {
    expect(cookiesEnabled()).toBe(true);
    expect(readCookie('roo.probe')).toBeNull();
  });

  it('returns null for unknown keys', () => {
    expect(getItem('missing')).toBeNull();
  });

  it('round-trips a small value in a single chunk', () => {
    expect(setItem('k', 'hello')).toBe(true);
    expect(getItem('k')).toBe('hello');
    expect(cookieNames()).toEqual(['k.0', 'k.n']);
  });

  it('escapes characters that are unsafe in cookies', () => {
    const value = 'a b;c,d"e\\f%g=h|i~j ç';
    setItem('k', value);
    // Only the RFC 6265 cookie-octet set may reach document.cookie.
    expect(readCookie('k.0')).toMatch(/^[A-Za-z0-9._~|!*'()%-]+$/);
    expect(getItem('k')).toBe(value);
  });

  it('stores an empty string', () => {
    setItem('k', '');
    expect(getItem('k')).toBe('');
    expect(cookieNames()).toEqual(['k.n']);
  });

  it('splits large values across chunks and reassembles them', () => {
    const value = 'x'.repeat(7000);
    expect(setItem('big', value)).toBe(true);
    expect(cookieNames()).toEqual(['big.0', 'big.1', 'big.2', 'big.n']);
    expect(getItem('big')).toBe(value);
  });

  it('removes stale chunks when the value shrinks', () => {
    setItem('k', 'y'.repeat(7000));
    setItem('k', 'short');
    expect(cookieNames()).toEqual(['k.0', 'k.n']);
    expect(getItem('k')).toBe('short');
  });

  it('refuses values beyond the chunk budget', () => {
    expect(setItem('huge', 'z'.repeat(3000 * 8 + 1))).toBe(false);
    expect(getItem('huge')).toBeNull();
  });

  it('returns null when a chunk is missing', () => {
    setItem('k', 'w'.repeat(4000));
    document.cookie = 'k.1=; max-age=0; path=/';
    expect(getItem('k')).toBeNull();
  });

  it('removeItem deletes every chunk', () => {
    setItem('k', 'v'.repeat(4000));
    removeItem('k');
    expect(cookieNames()).toEqual([]);
    expect(getItem('k')).toBeNull();
  });
});
