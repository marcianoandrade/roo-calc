import { describe, expect, it } from 'vitest';
import {
  computePvp,
  counterNotes,
  critChance,
  critDamage,
  DEFAULT_PVP_INPUTS,
  defenseMultiplier,
  Element,
  elementMultiplier,
  hitChance,
  pvpDamageDelta,
  pvpSceneMultiplier,
  rawEquipmentDefense,
  requiredIgnoreForTarget,
  resistLayer,
  Size,
  sizeMultiplier,
  WeaponType,
} from './pvp';

describe('lookup tables', () => {
  it('element table matches the client sample', () => {
    expect(elementMultiplier(Element.Fire, Element.Fire)).toBe(0.25);
    expect(elementMultiplier(Element.Fire, Element.Water)).toBe(1.75);
    expect(elementMultiplier(Element.Water, Element.Fire)).toBe(0.8);
    expect(elementMultiplier(Element.Normal, Element.Normal)).toBe(1);
  });

  it('size table matches the client sample', () => {
    expect(sizeMultiplier(WeaponType.Sword, Size.Medium)).toBe(0.75);
    expect(sizeMultiplier(WeaponType.Sword, Size.Large)).toBe(1);
    expect(sizeMultiplier(WeaponType.None, Size.Small)).toBe(1);
  });
});

describe('pvpDamageDelta', () => {
  it('is negative when your reduction exceeds enemy PvP DMG', () => {
    expect(pvpDamageDelta(2502, 2761)).toBeCloseTo(-0.0200725, 6);
  });

  it('uses the bracket table', () => {
    expect(pvpDamageDelta(600, 0)).toBeCloseTo(0.06);
    expect(pvpDamageDelta(0, 0)).toBe(0);
  });

  it('caps at 20% past the last bracket', () => {
    expect(pvpDamageDelta(3000, 0)).toBeCloseTo(0.2);
    expect(pvpDamageDelta(99999, 0)).toBeCloseTo(0.2);
  });
});

describe('pvpSceneMultiplier', () => {
  it('returns 1 outside PvP', () => {
    expect(pvpSceneMultiplier({ isPvp: false, isCommonSkill: false, isMagicSkill: true })).toBe(1);
  });

  it('distinguishes common, physical and magic skills', () => {
    expect(pvpSceneMultiplier({ isPvp: true, isCommonSkill: true, isMagicSkill: false })).toBe(0.7);
    expect(pvpSceneMultiplier({ isPvp: true, isCommonSkill: false, isMagicSkill: false })).toBe(0.6);
    expect(pvpSceneMultiplier({ isPvp: true, isCommonSkill: false, isMagicSkill: true })).toBe(0.3);
  });
});

describe('defense layer', () => {
  it('reverses equipment DEF%', () => {
    expect(rawEquipmentDefense(6352, 0.33)).toBeCloseTo(4775.9398, 3);
  });

  it('computes the share of damage passing DEF', () => {
    const raw = rawEquipmentDefense(6352, 0.33);
    expect(defenseMultiplier(9477, raw, 559)).toBeCloseTo(0.359729, 5);
    expect(defenseMultiplier(0, raw, 0)).toBe(0);
  });

  it('computes the ignore needed for a target damage taken', () => {
    const raw = rawEquipmentDefense(6352, 0.33);
    expect(requiredIgnoreForTarget({ incomingAttack: 9477, rawEquipmentDefense: raw, targetDamageTaken: 0.5 })).toBeCloseTo(
      2406.69,
      2,
    );
    expect(requiredIgnoreForTarget({ incomingAttack: 100, rawEquipmentDefense: 10, targetDamageTaken: 0.5 })).toBe(0);
  });
});

describe('resistLayer', () => {
  it('floors at 10%', () => {
    expect(resistLayer(0.7269, 1.768)).toBe(0.1);
    expect(resistLayer(0.5, 0.2)).toBeCloseTo(1.3);
  });
});

describe('hit and crit samples', () => {
  it('clamps hit chance between 5% and 100%', () => {
    expect(hitChance({ hitBase: 100, fleeBase: 150, attackerCount: 2, isPvp: false, dex: 0 })).toBe(0.05);
    expect(hitChance({ hitBase: 367, fleeBase: 176, attackerCount: 2, isPvp: true, dex: 90 })).toBe(1);
  });

  it('applies the PvP softening curve', () => {
    // hit = 120 * 1.5 = 180; rate = 0.3 -> (0.3 * 50 + 50) / 100
    expect(hitChance({ hitBase: 120, fleeBase: 150, attackerCount: 2, isPvp: true, dex: 0 })).toBeCloseTo(0.65);
    // hit = 60 * 1.5 = 90; rate = -0.6 -> ((-60 + 100) / 100 * 5 + 45) / 100
    expect(hitChance({ hitBase: 60, fleeBase: 150, attackerCount: 2, isPvp: true, dex: 0 })).toBeCloseTo(0.47);
  });

  it('crit chance and crit damage', () => {
    expect(critChance(24, 14)).toBeCloseTo(0.1);
    expect(critDamage(100, 0, 0)).toBe(150);
  });
});

describe('counterNotes', () => {
  it('recommends PvP reduction when PDMG.R is at the floor', () => {
    const notes = counterNotes({
      enemyDamageBonus: 0.7269,
      yourDamageResist: 1.768,
      enemyPvpDamage: 2502,
      yourPvpDamageReduction: 2761,
      enemyIgnoreDefense: 559,
    });
    expect(notes).toHaveLength(4);
    expect(notes[0]).toMatch(/PvP DMG Reduction: best next/);
    expect(notes[2]).toMatch(/reduced value/);
  });

  it('recommends damage resist otherwise', () => {
    const notes = counterNotes({
      enemyDamageBonus: 0.5,
      yourDamageResist: 0.2,
      enemyPvpDamage: 0,
      yourPvpDamageReduction: 3000,
      enemyIgnoreDefense: 0,
    });
    expect(notes[0]).toMatch(/Damage Resist/);
    expect(notes).not.toContain('PvP DMG Reduction still helps against enemy PvP DMG Bonus.');
    expect(notes[1]).toMatch(/more valuable/);
  });
});

describe('computePvp', () => {
  it('reproduces the reference site defaults', () => {
    const r = computePvp(DEFAULT_PVP_INPUTS);
    expect(r.physical.rawEquipmentDefense).toBeCloseTo(4775.94, 2);
    expect(r.magic.rawEquipmentDefense).toBeCloseTo(1552.59, 2);
    expect(r.physical.defenseMultiplier * 100).toBeCloseTo(35.97, 2);
    expect(r.physicalLayers.pvpLayer).toBeCloseTo(0.5879565, 6);
    expect(r.magicLayers.pvpLayer).toBeCloseTo(0.2939783, 6);
    expect(r.physicalLayers.damageResistLayer).toBe(0.1);
    expect(r.mediumLayer).toBeCloseTo(0.6922);
    expect(r.demiHumanLayer).toBeCloseTo(0.79);
    expect(r.physicalLayers.elementLayer).toBeCloseTo(0.23);
    expect(r.ignoreStillNeededPdef).toBeCloseTo(1847.69, 2);
    expect(r.physicalEstimate).toBeCloseTo(111.75, 1);
    expect(r.hitSample).toBe(1);
    expect(r.critSample).toBeCloseTo(0.1);
    expect(r.physicalCritEstimate).toBeCloseTo(r.physicalEstimate * 1.5, 6);
  });

  it('matches the values displayed by the reference site on 2026-09-05', () => {
    const r = computePvp(DEFAULT_PVP_INPUTS);
    const pct = (v: number) => (v * 100).toFixed(2);
    expect(r.physicalEstimate.toFixed(0)).toBe('112');
    expect(r.magicEstimate.toFixed(0)).toBe('100');
    expect(r.physical.rawEquipmentDefense.toFixed(0)).toBe('4776');
    expect(r.magic.rawEquipmentDefense.toFixed(0)).toBe('1553');
    expect(r.physical.effectiveEquipmentDefense.toFixed(0)).toBe('4217');
    expect(r.magic.effectiveEquipmentDefense.toFixed(0)).toBe('1351');
    expect(pct(r.physical.defenseMultiplier)).toBe('35.97');
    expect(pct(r.magic.defenseMultiplier)).toBe('47.24');
    expect(r.ignoreStillNeededPdef.toFixed(0)).toBe('1848');
    expect(r.ignoreStillNeededMdef.toFixed(0)).toBe('141');
    expect(pct(r.smallLayer)).toBe('95.42');
    expect(pct(r.mediumLayer)).toBe('69.22');
    expect(pct(r.largeLayer)).toBe('97.22');
    expect(pct(r.demiHumanLayer)).toBe('79.00');
    expect(pct(r.physicalLayers.elementLayer)).toBe('23.00');
    expect(pct(r.physicalLayers.damageResistLayer)).toBe('10.00');
    expect(pct(r.magicLayers.damageResistLayer)).toBe('49.40');
    expect(pct(r.physicalLayers.pvpLayer)).toBe('58.80');
    expect(pct(r.magicLayers.pvpLayer)).toBe('29.40');
    expect(pct(r.physicalLayers.totalMultiplier)).toBe('0.27');
    expect(pct(r.magicLayers.totalMultiplier)).toBe('0.86');
    expect(r.physicalCritEstimate.toFixed(0)).toBe('168');
    expect(r.magicCritEstimate.toFixed(0)).toBe('150');
    expect(r.physicalNotes[0]).toMatch(/^PvP DMG Reduction: best next/);
    expect(r.magicNotes[0]).toMatch(/^Damage Resist: strong/);
  });

  it('drops the PvP layers outside PvP', () => {
    const r = computePvp({ ...DEFAULT_PVP_INPUTS, isPvp: false });
    expect(r.physicalLayers.pvpLayer).toBe(1);
    expect(r.magicLayers.pvpLayer).toBe(1);
  });
});
