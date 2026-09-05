import { describe, expect, it } from 'vitest';
import { DEFAULT_DEFENSE_INPUTS } from './defense';
import { decodeSnapshots, encodeSnapshots, type Snapshot } from './history';
import {
  decodeDefenseInputs,
  decodePvpInputs,
  decodeTab,
  defenseSnapshotCodec,
  encodeDefenseInputs,
  encodePvpInputs,
  pvpSnapshotCodec,
  type PvpSnapshot,
} from './persistence';
import { DEFAULT_PVP_INPUTS, Element } from './pvp';

describe('tab codec', () => {
  it('accepts only known tabs', () => {
    expect(decodeTab('calculator')).toBe('calculator');
    expect(decodeTab('counter')).toBe('counter');
    expect(decodeTab('other')).toBeNull();
  });
});

describe('defense inputs codec', () => {
  it('round-trips the defaults', () => {
    const encoded = encodeDefenseInputs(DEFAULT_DEFENSE_INPUTS);
    expect(encoded).toBe('2864|824|23|16|315|76|43.52|58.52');
    expect(decodeDefenseInputs(encoded)).toEqual(DEFAULT_DEFENSE_INPUTS);
  });

  it('keeps raw text such as "23%" and blanks', () => {
    const inputs = { ...DEFAULT_DEFENSE_INPUTS, equipPdefPercent: '23%', ignoreMdef: '' };
    expect(decodeDefenseInputs(encodeDefenseInputs(inputs))).toEqual(inputs);
  });

  it('rejects truncated payloads', () => {
    expect(decodeDefenseInputs('1|2|3')).toBeNull();
  });
});

describe('pvp inputs codec', () => {
  it('round-trips the defaults', () => {
    const decoded = decodePvpInputs(encodePvpInputs(DEFAULT_PVP_INPUTS));
    expect(decoded).toEqual(DEFAULT_PVP_INPUTS);
  });

  it('round-trips booleans and elements', () => {
    const inputs = { ...DEFAULT_PVP_INPUTS, isPvp: false, attackElement: Element.Water, yourElement: Element.Earth };
    expect(decodePvpInputs(encodePvpInputs(inputs))).toEqual(inputs);
  });

  it('rejects truncated or corrupt payloads', () => {
    expect(decodePvpInputs('1|2|3')).toBeNull();
    const corrupt = encodePvpInputs(DEFAULT_PVP_INPUTS).replace('9477', 'abc');
    expect(decodePvpInputs(corrupt)).toBeNull();
  });
});

describe('snapshot history codec', () => {
  it('round-trips defense snapshots with awkward labels', () => {
    const items: Snapshot<typeof DEFAULT_DEFENSE_INPUTS>[] = [
      { at: 1725500000000, label: 'before | after ~ 100%; ok', data: DEFAULT_DEFENSE_INPUTS },
      { at: 1725500001000, label: '', data: { ...DEFAULT_DEFENSE_INPUTS, pdef: '3000' } },
    ];
    const decoded = decodeSnapshots(encodeSnapshots(items, defenseSnapshotCodec), defenseSnapshotCodec);
    expect(decoded).toEqual(items);
  });

  it('rounds pvp snapshot values to two decimals', () => {
    const snapshot: PvpSnapshot = {
      physicalEstimate: 111.754321,
      magicEstimate: 40.1,
      pdefDamageTaken: 35.97291,
      mdefDamageTaken: 47.2,
      rawPdef: 4775.9398,
      rawMdef: 1552.5862,
    };
    const [decoded] = decodeSnapshots(encodeSnapshots([{ at: 1, label: 'x', data: snapshot }], pvpSnapshotCodec), pvpSnapshotCodec);
    expect(decoded.data).toEqual({
      physicalEstimate: 111.75,
      magicEstimate: 40.1,
      pdefDamageTaken: 35.97,
      mdefDamageTaken: 47.2,
      rawPdef: 4775.94,
      rawMdef: 1552.59,
    });
  });

  it('skips corrupt records and tolerates null storage', () => {
    expect(decodeSnapshots(null, pvpSnapshotCodec)).toEqual([]);
    expect(decodeSnapshots('', pvpSnapshotCodec)).toEqual([]);
    const good = encodeSnapshots(
      [{ at: 5, label: 'ok', data: { physicalEstimate: 1, magicEstimate: 2, pdefDamageTaken: 3, mdefDamageTaken: 4, rawPdef: 5, rawMdef: 6 } }],
      pvpSnapshotCodec,
    );
    const decoded = decodeSnapshots(`zz|bad~${good}~1|short|1`, pvpSnapshotCodec);
    expect(decoded).toHaveLength(1);
    expect(decoded[0].label).toBe('ok');
  });
});
