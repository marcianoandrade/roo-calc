import { describe, expect, it } from 'vitest';
import { applyBackground, BACKGROUNDS, pickBackground } from './background';

describe('pickBackground', () => {
  it('covers every background across the random range', () => {
    expect(pickBackground(() => 0)).toBe(BACKGROUNDS[0]);
    expect(pickBackground(() => 0.5)).toBe(BACKGROUNDS[1]);
    expect(pickBackground(() => 0.999)).toBe(BACKGROUNDS[BACKGROUNDS.length - 1]);
  });

  it('never goes out of range', () => {
    expect(pickBackground(() => 1)).toBe(BACKGROUNDS[BACKGROUNDS.length - 1]);
    expect(pickBackground(() => -1)).toBe(BACKGROUNDS[0]);
  });
});

describe('applyBackground', () => {
  it('writes the CSS custom properties', () => {
    const el = document.createElement('div');
    applyBackground(el, { src: '/bg/x.jpg', position: 'center top' });
    expect(el.style.getPropertyValue('--ro-bg')).toBe('url("/bg/x.jpg")');
    expect(el.style.getPropertyValue('--ro-bg-pos')).toBe('center top');
  });
});
