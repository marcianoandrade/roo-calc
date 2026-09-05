/**
 * Cookie-backed key/value store.
 *
 * Browsers cap a single cookie at ~4 KB, so a value is split across
 * `<key>.0`, `<key>.1`, ... with the chunk count in `<key>.n`.
 * Values are escaped to the RFC 6265 cookie-octet set before writing.
 */

const CHUNK_SIZE = 3000;
const MAX_CHUNKS = 8;
const MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

/** Anything outside this set is percent-encoded before it reaches document.cookie. */
const UNSAFE_CHARS = /[^A-Za-z0-9._~|!*'()-]/g;

function escapeValue(value: string): string {
  return value.replace(UNSAFE_CHARS, (c) => encodeURIComponent(c));
}

function unescapeValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function hasDocument(): boolean {
  return typeof document !== 'undefined';
}

export function readCookie(name: string): string | null {
  if (!hasDocument()) return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
  }
  return null;
}

export function writeCookie(name: string, value: string, maxAgeSeconds = MAX_AGE_SECONDS): void {
  if (!hasDocument()) return;
  document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  if (!hasDocument()) return;
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

/** Returns the stored string, or null when nothing (or something corrupt) is stored. */
export function getItem(key: string): string | null {
  const countRaw = readCookie(`${key}.n`);
  if (countRaw === null) return null;
  const count = Number(countRaw);
  if (!Number.isInteger(count) || count < 0) return null;
  let joined = '';
  for (let i = 0; i < count; i++) {
    const chunk = readCookie(`${key}.${i}`);
    if (chunk === null) return null;
    joined += chunk;
  }
  return unescapeValue(joined);
}

/** Stores the string. Returns false (and writes nothing) when it would exceed the cookie budget. */
export function setItem(key: string, value: string): boolean {
  const escaped = escapeValue(value);
  const chunks: string[] = [];
  for (let i = 0; i < escaped.length; i += CHUNK_SIZE) {
    chunks.push(escaped.slice(i, i + CHUNK_SIZE));
  }
  if (chunks.length > MAX_CHUNKS) return false;

  const previousCount = Number(readCookie(`${key}.n`) ?? 0);
  chunks.forEach((chunk, i) => writeCookie(`${key}.${i}`, chunk));
  writeCookie(`${key}.n`, String(chunks.length));
  for (let i = chunks.length; i < previousCount; i++) deleteCookie(`${key}.${i}`);
  return true;
}

export function removeItem(key: string): void {
  const previousCount = Number(readCookie(`${key}.n`) ?? 0);
  for (let i = 0; i < previousCount; i++) deleteCookie(`${key}.${i}`);
  deleteCookie(`${key}.n`);
}

/** True when the browser accepts and returns a cookie. */
export function cookiesEnabled(): boolean {
  if (!hasDocument()) return false;
  const probe = 'roo.probe';
  writeCookie(probe, '1', 60);
  const ok = readCookie(probe) === '1';
  deleteCookie(probe);
  return ok;
}
