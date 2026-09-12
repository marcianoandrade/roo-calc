import { describe, expect, it } from 'vitest';
import { sortSnapshots, type Snapshot } from './history';

function snap(at: number, label: string): Snapshot<string> {
  return { at, label, data: label };
}

describe('sortSnapshots', () => {
  it('puts the oldest first so a past reading lands before newer ones', () => {
    const sorted = sortSnapshots([snap(300, 'c'), snap(100, 'a'), snap(200, 'b')]);
    expect(sorted.map((s) => s.label)).toEqual(['a', 'b', 'c']);
  });

  it('keeps the order of entries saved at the same instant and does not mutate the input', () => {
    const items = [snap(100, 'first'), snap(100, 'second')];
    expect(sortSnapshots(items).map((s) => s.label)).toEqual(['first', 'second']);
    expect(items.map((s) => s.label)).toEqual(['first', 'second']);
  });
});
