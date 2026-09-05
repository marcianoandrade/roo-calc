import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText, formatShareText } from './share';

describe('formatShareText', () => {
  it('uses the requested layout with plain numbers', () => {
    expect(formatShareText(2318.2537, 1059.65)).toBe('Raw Pdef: 2318.25 Raw Mdef: 1059.65');
  });

  it('never adds thousands separators or trailing zeros', () => {
    expect(formatShareText(12000, 710.3)).toBe('Raw Pdef: 12000 Raw Mdef: 710.3');
  });
});

describe('copyText', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses the async clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await expect(copyText('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to execCommand when the clipboard API fails', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', { value: exec, configurable: true });
    await expect(copyText('hello')).resolves.toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('reports failure when nothing works', async () => {
    vi.stubGlobal('navigator', {});
    Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true });
    await expect(copyText('hello')).resolves.toBe(false);
  });
});
