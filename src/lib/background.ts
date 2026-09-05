/**
 * Background artwork shown behind the windows. One is picked at random on
 * every page load, like the rotating login screens of the classic client.
 */
export interface Background {
  src: string;
  /** CSS background-position that keeps the interesting part visible when cropped. */
  position: string;
}

export const BACKGROUNDS: readonly Background[] = [
  { src: '/bg/party.jpg', position: 'center 30%' },
  { src: '/bg/castle.jpg', position: 'center 40%' },
  { src: '/bg/woe.jpg', position: 'center 22%' },
];

/** `random` must return a number in [0, 1). */
export function pickBackground(random: () => number = Math.random): Background {
  const index = Math.min(Math.floor(random() * BACKGROUNDS.length), BACKGROUNDS.length - 1);
  return BACKGROUNDS[Math.max(index, 0)];
}

export function applyBackground(element: HTMLElement, background: Background): void {
  element.style.setProperty('--ro-bg', `url("${background.src}")`);
  element.style.setProperty('--ro-bg-pos', background.position);
}
