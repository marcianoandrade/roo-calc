import { describe, expect, it } from 'vitest';
import { DEFAULT_DEFENSE_INPUTS } from './defense';
import { decodeSnapshots, encodeSnapshots, type Snapshot } from './history';
import {
  COOKIE_KEYS,
  decodeDefenseInputs,
  defenseSnapshotCodec,
  encodeDefenseInputs,
  LEGACY_COOKIE_KEYS,
} from './persistence';

describe('cookie keys', () => {
  it('never reuses a legacy key for a live one', () => {
    for (const key of Object.values(COOKIE_KEYS)) {
      expect(LEGACY_COOKIE_KEYS).not.toContain(key);
    }
  });
});

describe('defense inputs codec', () => {
  it('round-trips the defaults', () => {
    const encoded = encodeDefenseInputs(DEFAULT_DEFENSE_INPUTS);
    expect(encoded).toBe('2864|824|23|16|43.52|58.52');
    expect(decodeDefenseInputs(encoded)).toEqual(DEFAULT_DEFENSE_INPUTS);
  });

  it('keeps raw text such as "23%" and blanks', () => {
    const inputs = { ...DEFAULT_DEFENSE_INPUTS, equipPdefPercent: '23%', mdmgReduction: '' };
    expect(decodeDefenseInputs(encodeDefenseInputs(inputs))).toEqual(inputs);
  });

  it('still reads the first version layout that had Ignore PDEF/MDEF fields', () => {
    expect(decodeDefenseInputs('3831|955|26|14|1750|550|74.43|84.90')).toEqual({
      pdef: '3831',
      mdef: '955',
      equipPdefPercent: '26',
      equipMdefPercent: '14',
      pdmgReduction: '74.43',
      mdmgReduction: '84.90',
    });
  });

  it('rejects truncated payloads', () => {
    expect(decodeDefenseInputs('1|2|3')).toBeNull();
  });
});

describe('snapshot history codec', () => {
  it('round-trips snapshots with awkward labels', () => {
    const items: Snapshot<typeof DEFAULT_DEFENSE_INPUTS>[] = [
      { at: 1725500000000, label: 'before | after ~ 100%; ok', data: DEFAULT_DEFENSE_INPUTS },
      { at: 1725500001000, label: '', data: { ...DEFAULT_DEFENSE_INPUTS, pdef: '3000' } },
    ];
    const decoded = decodeSnapshots(encodeSnapshots(items, defenseSnapshotCodec), defenseSnapshotCodec);
    expect(decoded).toEqual(items);
  });

  it('reads snapshots written by the first version layout', () => {
    const decoded = decodeSnapshots('mtoe945e|atual|3831|955|26|14|1750|550|74.43|84.90', defenseSnapshotCodec);
    expect(decoded).toHaveLength(1);
    expect(decoded[0].label).toBe('atual');
    expect(decoded[0].data.pdef).toBe('3831');
    expect(decoded[0].data.pdmgReduction).toBe('74.43');
  });

  it('skips corrupt records and tolerates null storage', () => {
    expect(decodeSnapshots(null, defenseSnapshotCodec)).toEqual([]);
    expect(decodeSnapshots('', defenseSnapshotCodec)).toEqual([]);
    const good = encodeSnapshots([{ at: 5, label: 'ok', data: DEFAULT_DEFENSE_INPUTS }], defenseSnapshotCodec);
    const decoded = decodeSnapshots(`zz|bad~${good}~1|short|1`, defenseSnapshotCodec);
    expect(decoded).toHaveLength(1);
    expect(decoded[0].label).toBe('ok');
  });
});
