/**
 * PvP Counter Lab formulas (Ragnarok Origin SEA reverse-engineered sample).
 * Ported from the reference site; pure functions, no React.
 */

export enum Element {
  Normal = 0,
  Wind = 1,
  Earth = 2,
  Water = 3,
  Fire = 4,
  Poison = 5,
  Holy = 6,
  Shadow = 7,
  Undead = 8,
  Ghost = 9,
  Mental = 10,
}

export enum WeaponType {
  None = 0,
  Sword = 1,
  Dagger = 2,
  Spear = 3,
  Axe = 4,
}

export enum Size {
  Small = 0,
  Medium = 1,
  Large = 2,
}

export const ELEMENT_OPTIONS: readonly [label: string, value: Element][] = [
  ['Fire', Element.Fire],
  ['Wind', Element.Wind],
  ['Earth', Element.Earth],
  ['Water', Element.Water],
];

/** [attackElement][defenseElement] */
const ELEMENT_TABLE: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 0.7, 1, 1],
  [1, 0.25, 0.8, 1, 1.75, 1, 0.75, 1, 1, 1, 1],
  [1, 1.75, 0.25, 0.8, 1, 1, 0.75, 1, 1, 1, 1],
  [1, 1, 1.75, 0.25, 0.8, 1, 0.75, 1, 1, 1.5, 1],
  [1, 0.9, 1, 1.75, 0.25, 1, 0.75, 1, 1, 1, 1],
  [1, 1.25, 1.25, 1.25, 1.25, 0.25, 0.5, 0.5, 1, 0.25, 1],
  [1, 1, 1, 1, 1, 1, 0.25, 1.5, 1, 1.75, 1],
  [1, 1, 1, 1, 1, 0.5, 1.5, 0.25, 1, 0.25, 1],
  [0.7, 1, 1, 1, 1, 1, 0.75, 0.75, 1.5, 1.25, 1],
  [1, 1, 1, 1, 1, 0.5, 1.25, 0.25, 1, 0.25, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 0.7, 1, 1],
];

/** [weaponType][targetSize] */
const SIZE_TABLE: readonly (readonly number[])[] = [
  [1, 1, 1],
  [0.75, 0.75, 1],
  [1, 0.75, 0.75],
  [0.75, 1, 0.75],
  [0.75, 1, 0.75],
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Multiplier floor used by the client: never below 10%. */
export function floorMultiplier(value: number): number {
  return Math.max(value, 0.1);
}

export function elementMultiplier(attack: Element, defense: Element): number {
  return ELEMENT_TABLE[attack]?.[defense] ?? 1;
}

export function sizeMultiplier(weapon: WeaponType, size: Size): number {
  return SIZE_TABLE[weapon]?.[size] ?? 1;
}

export function pvpSceneMultiplier(opts: { isPvp: boolean; isCommonSkill: boolean; isMagicSkill: boolean }): number {
  if (!opts.isPvp) return 1;
  if (opts.isCommonSkill) return 0.7;
  return opts.isMagicSkill ? 0.3 : 0.6;
}

export function rawEquipmentDefense(equipmentDefense: number, equipmentDefensePercent: number): number {
  return equipmentDefense / (1 + Math.max(equipmentDefensePercent, -0.99));
}

/** Share of damage that passes the DEF layer (0..1). */
export function defenseMultiplier(incomingAttack: number, rawDefense: number, ignoreDefense: number): number {
  if (incomingAttack <= 0) return 0;
  const effective = Math.max(rawDefense - ignoreDefense, 0);
  return incomingAttack / (incomingAttack + effective * 4);
}

export interface DefenseLayerInput {
  incomingAttack: number;
  baseDefense: number;
  equipmentDefense: number;
  equipmentDefensePercent: number;
  ignoreDefense: number;
}

export interface DefenseLayerResult {
  rawEquipmentDefense: number;
  effectiveEquipmentDefense: number;
  defenseMultiplier: number;
  baseDefenseFlatReduction: number;
}

export function computeDefenseLayer(input: DefenseLayerInput): DefenseLayerResult {
  const raw = rawEquipmentDefense(input.equipmentDefense, input.equipmentDefensePercent);
  return {
    rawEquipmentDefense: raw,
    effectiveEquipmentDefense: Math.max(raw - input.ignoreDefense, 0),
    defenseMultiplier: defenseMultiplier(input.incomingAttack, raw, input.ignoreDefense),
    baseDefenseFlatReduction: input.baseDefense,
  };
}

/** Ignore DEF the attacker needs so the DEF layer allows `targetDamageTaken` of the damage. */
export function requiredIgnoreForTarget(input: {
  incomingAttack: number;
  rawEquipmentDefense: number;
  targetDamageTaken: number;
}): number {
  const target = clamp(input.targetDamageTaken, 1e-4, 1);
  const allowedDefense = (input.incomingAttack * (1 / target - 1)) / 4;
  return Math.max(input.rawEquipmentDefense - allowedDefense, 0);
}

export function resistLayer(bonus: number, reduction: number): number {
  return Math.max(1 + bonus - reduction, 0.1);
}

const PVP_DELTA_TABLE: readonly (readonly [slope: number, offset: number, base: number])[] = [
  [775e-7, 0, 0],
  [375e-7, 300, 0.04],
  [525e-7, 600, 0.06],
  [225e-7, 900, 0.08],
  [35e-6, 1200, 0.1],
  [15e-6, 1500, 0.12],
  [175e-7, 1800, 0.15],
  [75e-7, 2100, 0.18],
  [0, 0, 0.2],
];

/** Signed bonus from enemy PvP DMG vs your PvP DMG reduction (e.g. 0.05 = +5%). */
export function pvpDamageDelta(enemyPvpDamage: number, yourPvpReduction: number): number {
  const diff = enemyPvpDamage - yourPvpReduction;
  const sign = diff < 0 ? -1 : 1;
  const abs = Math.abs(diff);
  const bracket = Math.min(Math.floor(abs / 300), 8);
  const [slope, offset, base] = PVP_DELTA_TABLE[bracket];
  return sign * (slope * (abs - offset) + base);
}

export interface DamageLayersInput {
  defenseMultiplier: number;
  damageBonus: number;
  damageResist: number;
  pvpMultiplier: number;
  sizeBonus: number;
  sizeReduction: number;
  raceBonus: number;
  raceReduction: number;
  elementTableMultiplier: number;
  elementBonus: number;
  elementReduction: number;
}

export interface DamageLayers {
  defenseLayer: number;
  damageResistLayer: number;
  pvpLayer: number;
  sizeLayer: number;
  raceLayer: number;
  elementLayer: number;
  totalMultiplier: number;
}

export function computeDamageLayers(input: DamageLayersInput): DamageLayers {
  const defenseLayer = input.defenseMultiplier;
  const damageResistLayer = resistLayer(input.damageBonus, input.damageResist);
  const pvpLayer = input.pvpMultiplier;
  const sizeLayer = Math.max(1 + input.sizeBonus - input.sizeReduction, 0.1);
  const raceLayer = Math.max(1 + input.raceBonus - input.raceReduction, 0.1);
  const elementLayer = Math.max(input.elementTableMultiplier + input.elementBonus - input.elementReduction, 0.1);
  return {
    defenseLayer,
    damageResistLayer,
    pvpLayer,
    sizeLayer,
    raceLayer,
    elementLayer,
    totalMultiplier: defenseLayer * damageResistLayer * pvpLayer * sizeLayer * raceLayer * elementLayer,
  };
}

export function counterNotes(input: {
  enemyDamageBonus: number;
  yourDamageResist: number;
  enemyPvpDamage: number;
  yourPvpDamageReduction: number;
  enemyIgnoreDefense: number;
}): string[] {
  const notes: string[] = [];
  const resist = resistLayer(input.enemyDamageBonus, input.yourDamageResist);
  const pvpDelta = pvpDamageDelta(input.enemyPvpDamage, input.yourPvpDamageReduction);
  if (resist <= 0.1) {
    notes.push('PvP DMG Reduction: best next generic counter because PDMG.R is already at the 10% floor.');
  } else {
    notes.push('Damage Resist: strong until enemy damage bonus is pushed to the 10% floor.');
  }
  if (pvpDelta > -0.2) notes.push('PvP DMG Reduction still helps against enemy PvP DMG Bonus.');
  if (input.enemyIgnoreDefense > 0) {
    notes.push('Raw PDEF/MDEF has reduced value because enemy ignore defense subtracts from raw equipment defense first.');
  } else {
    notes.push('Raw PDEF/MDEF is more valuable when enemy ignore defense is low.');
  }
  notes.push('Size, race, and element reductions are strong if you know the enemy build.');
  return notes;
}

export function hitChance(input: {
  hitBase: number;
  fleeBase: number;
  attackerCount: number;
  isPvp: boolean;
  dex: number;
}): number {
  const attackers = clamp(input.attackerCount, 2, 7);
  let hit = input.hitBase;
  if (input.isPvp) hit = hit * 1.5 + input.dex * 0.5;
  let rate = (hit - input.fleeBase * (1 - (attackers - 2) * 0.3)) / 100;
  if (input.isPvp) {
    if (rate < 0) rate = (((rate * 100 + 100) / 100) * 5 + 45) / 100;
    else if (rate < 1) rate = (((rate * 100) / 100) * 50 + 50) / 100;
  }
  return clamp(rate, 0.05, 1);
}

export function critChance(crit: number, critResist: number): number {
  return clamp((crit - critResist) / 100, 0, 1);
}

export function critDamage(damage: number, critBonus: number, critReduction: number): number {
  return damage * 1.5 * (1 + critBonus / 1e4 - critReduction / 1e4);
}

export interface DamageBreakdown {
  attackBase: number;
  multiplierBase: number;
  afterDefense: number;
  finalDamage: number;
}

export interface PhysicalDamageInput {
  atk: number;
  weaponAtk: number;
  refineAtk: number;
  atkPercent: number;
  weaponType: WeaponType;
  targetSize: Size;
  attackElement: Element;
  defenseElement: Element;
  raceBonus: number;
  sizeBonus: number;
  finalElementBonus: number;
  skillPercent: number;
  skillFlat: number;
  defReduction: number;
  softDef: number;
  npcDamage: number;
  atkUp: number;
  atkDown: number;
  damageFloat: number;
  additionalDamage: number;
  suppressRatio: number;
  pvpMultiplier: number;
}

export function physicalDamage(i: PhysicalDamageInput): DamageBreakdown {
  const size = sizeMultiplier(i.weaponType, i.targetSize);
  const element = elementMultiplier(i.attackElement, i.defenseElement);
  const weapon = (i.weaponAtk + i.refineAtk * (1 + i.atkPercent)) * size * element;
  const attackBase =
    2 * i.atk +
    weapon * floorMultiplier(1 + i.raceBonus) * floorMultiplier(1 + i.sizeBonus) * floorMultiplier(i.finalElementBonus);
  const multiplierBase = attackBase * i.skillPercent;
  const npc = floorMultiplier(i.npcDamage + i.atkUp / 1e4 - i.atkDown / 1e4);
  const afterDefense = Math.max(multiplierBase * i.defReduction * npc * i.suppressRatio - i.softDef, 0);
  const finalDamage =
    (afterDefense * i.damageFloat + i.skillFlat * i.damageFloat + i.additionalDamage) * i.pvpMultiplier;
  return { attackBase, multiplierBase, afterDefense, finalDamage };
}

export interface MagicDamageInput {
  matk: number;
  weaponMatk: number;
  refineMatk: number;
  matkPercent: number;
  attackElement: Element;
  defenseElement: Element;
  raceBonus: number;
  sizeBonus: number;
  finalElementBonus: number;
  skillPercent: number;
  skillFlat: number;
  mdefReduction: number;
  softMdef: number;
  npcDamage: number;
  matkUp: number;
  matkDown: number;
  damageFloat: number;
  additionalDamage: number;
  suppressRatio: number;
  pvpMultiplier: number;
}

export function magicDamage(i: MagicDamageInput): DamageBreakdown {
  const element = elementMultiplier(i.attackElement, i.defenseElement);
  const attackBase =
    (i.matk + i.weaponMatk + i.refineMatk * (1 + i.matkPercent)) *
    floorMultiplier(1 + i.raceBonus) *
    floorMultiplier(1 + i.sizeBonus) *
    floorMultiplier(i.finalElementBonus) *
    element;
  const multiplierBase = attackBase * i.skillPercent;
  const npc = floorMultiplier(i.npcDamage + i.matkUp / 1e4 - i.matkDown / 1e4);
  const afterDefense = Math.max(multiplierBase * i.mdefReduction * npc * i.suppressRatio - i.softMdef, 0);
  const finalDamage =
    (afterDefense * i.damageFloat + i.skillFlat * i.damageFloat + i.additionalDamage) * i.pvpMultiplier;
  return { attackBase, multiplierBase, afterDefense, finalDamage };
}

/* ------------------------------------------------------------------ */
/* Lab inputs and full computation                                     */
/* ------------------------------------------------------------------ */

export interface PvpInputs {
  isPvp: boolean;
  enemyPatk: number;
  enemyMatk: number;
  weaponAtk: number;
  refinePatk: number;
  refineMatk: number;
  skillMultiplier: number;
  basePdef: number;
  baseMdef: number;
  equipPdef: number;
  equipMdef: number;
  equipPdefPercent: number;
  equipMdefPercent: number;
  enemyIgnorePdef: number;
  enemyIgnoreMdef: number;
  enemyPdmg: number;
  enemyMdmg: number;
  yourPdmgR: number;
  yourMdmgR: number;
  enemyPvpDamage: number;
  yourPvpReduction: number;
  dmgVsSmall: number;
  reductionVsSmall: number;
  dmgVsMedium: number;
  reductionVsMedium: number;
  dmgVsLarge: number;
  reductionVsLarge: number;
  dmgVsDemiHuman: number;
  reductionVsDemiHuman: number;
  attackElement: Element;
  yourElement: Element;
  enemyElementDamage: number;
  yourElementReduction: number;
  targetDamageTaken: number;
}

/** Field order used when serializing inputs (never reorder: cookies depend on it). */
export const PVP_FIELDS: readonly (keyof PvpInputs)[] = [
  'isPvp',
  'enemyPatk',
  'enemyMatk',
  'weaponAtk',
  'refinePatk',
  'refineMatk',
  'skillMultiplier',
  'basePdef',
  'baseMdef',
  'equipPdef',
  'equipMdef',
  'equipPdefPercent',
  'equipMdefPercent',
  'enemyIgnorePdef',
  'enemyIgnoreMdef',
  'enemyPdmg',
  'enemyMdmg',
  'yourPdmgR',
  'yourMdmgR',
  'enemyPvpDamage',
  'yourPvpReduction',
  'dmgVsSmall',
  'reductionVsSmall',
  'dmgVsMedium',
  'reductionVsMedium',
  'dmgVsLarge',
  'reductionVsLarge',
  'dmgVsDemiHuman',
  'reductionVsDemiHuman',
  'attackElement',
  'yourElement',
  'enemyElementDamage',
  'yourElementReduction',
  'targetDamageTaken',
];

export const DEFAULT_PVP_INPUTS: PvpInputs = {
  isPvp: true,
  enemyPatk: 9477,
  enemyMatk: 4838,
  weaponAtk: 0,
  refinePatk: 1408,
  refineMatk: 897,
  skillMultiplier: 2,
  basePdef: 140,
  baseMdef: 207,
  equipPdef: 6352,
  equipMdef: 1801,
  equipPdefPercent: 33,
  equipMdefPercent: 16,
  enemyIgnorePdef: 559,
  enemyIgnoreMdef: 202,
  enemyPdmg: 72.69,
  enemyMdmg: 52.69,
  yourPdmgR: 176.8,
  yourMdmgR: 103.29,
  enemyPvpDamage: 2502,
  yourPvpReduction: 2761,
  dmgVsSmall: 7.62,
  reductionVsSmall: 12.2,
  dmgVsMedium: 3.82,
  reductionVsMedium: 34.6,
  dmgVsLarge: 7.02,
  reductionVsLarge: 9.8,
  dmgVsDemiHuman: 2.6,
  reductionVsDemiHuman: 23.6,
  attackElement: Element.Fire,
  yourElement: Element.Fire,
  enemyElementDamage: 0,
  yourElementReduction: 2,
  targetDamageTaken: 50,
};

export interface PvpResults {
  physicalEstimate: number;
  magicEstimate: number;
  physical: DefenseLayerResult;
  magic: DefenseLayerResult;
  physicalLayers: DamageLayers;
  magicLayers: DamageLayers;
  ignoreStillNeededPdef: number;
  ignoreStillNeededMdef: number;
  smallLayer: number;
  mediumLayer: number;
  largeLayer: number;
  demiHumanLayer: number;
  physicalNotes: string[];
  magicNotes: string[];
  hitSample: number;
  critSample: number;
  physicalCritEstimate: number;
  magicCritEstimate: number;
}

export function computePvp(v: PvpInputs): PvpResults {
  const elementTable = elementMultiplier(v.attackElement, v.yourElement);
  const pvpBonus = v.isPvp ? 1 + pvpDamageDelta(v.enemyPvpDamage, v.yourPvpReduction) : 1;
  const physicalPvp = pvpSceneMultiplier({ isPvp: v.isPvp, isCommonSkill: false, isMagicSkill: false }) * pvpBonus;
  const magicPvp = pvpSceneMultiplier({ isPvp: v.isPvp, isCommonSkill: false, isMagicSkill: true }) * pvpBonus;

  const physical = computeDefenseLayer({
    incomingAttack: v.enemyPatk,
    baseDefense: v.basePdef,
    equipmentDefense: v.equipPdef,
    equipmentDefensePercent: v.equipPdefPercent / 100,
    ignoreDefense: v.enemyIgnorePdef,
  });
  const magic = computeDefenseLayer({
    incomingAttack: v.enemyMatk,
    baseDefense: v.baseMdef,
    equipmentDefense: v.equipMdef,
    equipmentDefensePercent: v.equipMdefPercent / 100,
    ignoreDefense: v.enemyIgnoreMdef,
  });

  const layer = (bonus: number, reduction: number) => Math.max(1 + bonus / 100 - reduction / 100, 0.1);
  const smallLayer = layer(v.dmgVsSmall, v.reductionVsSmall);
  const mediumLayer = layer(v.dmgVsMedium, v.reductionVsMedium);
  const largeLayer = layer(v.dmgVsLarge, v.reductionVsLarge);
  const demiHumanLayer = layer(v.dmgVsDemiHuman, v.reductionVsDemiHuman);

  const matchup = {
    sizeBonus: v.dmgVsMedium / 100,
    sizeReduction: v.reductionVsMedium / 100,
    raceBonus: v.dmgVsDemiHuman / 100,
    raceReduction: v.reductionVsDemiHuman / 100,
    elementTableMultiplier: elementTable,
    elementBonus: v.enemyElementDamage / 100,
    elementReduction: v.yourElementReduction / 100,
  };

  const physicalLayers = computeDamageLayers({
    defenseMultiplier: physical.defenseMultiplier,
    damageBonus: v.enemyPdmg / 100,
    damageResist: v.yourPdmgR / 100,
    pvpMultiplier: physicalPvp,
    ...matchup,
  });
  const magicLayers = computeDamageLayers({
    defenseMultiplier: magic.defenseMultiplier,
    damageBonus: v.enemyMdmg / 100,
    damageResist: v.yourMdmgR / 100,
    pvpMultiplier: magicPvp,
    ...matchup,
  });

  const physicalHit = physicalDamage({
    atk: v.enemyPatk,
    weaponAtk: v.weaponAtk,
    refineAtk: v.refinePatk,
    atkPercent: 0.9614,
    weaponType: WeaponType.Sword,
    targetSize: Size.Medium,
    attackElement: Element.Normal,
    defenseElement: Element.Normal,
    raceBonus: 0,
    sizeBonus: 0,
    finalElementBonus: 1,
    skillPercent: v.skillMultiplier,
    skillFlat: 100,
    defReduction: physical.defenseMultiplier,
    softDef: v.basePdef,
    npcDamage: 1,
    atkUp: 0,
    atkDown: 0,
    damageFloat: 1,
    additionalDamage: 25,
    suppressRatio: 1,
    pvpMultiplier: physicalPvp,
  });
  const magicHit = magicDamage({
    matk: v.enemyMatk,
    weaponMatk: v.weaponAtk,
    refineMatk: v.refineMatk,
    matkPercent: 0.2504,
    attackElement: Element.Normal,
    defenseElement: Element.Normal,
    raceBonus: 0,
    sizeBonus: 0,
    finalElementBonus: 1,
    skillPercent: v.skillMultiplier,
    skillFlat: 50,
    mdefReduction: magic.defenseMultiplier,
    softMdef: v.baseMdef,
    npcDamage: 1,
    matkUp: 0,
    matkDown: 0,
    damageFloat: 1,
    additionalDamage: 10,
    suppressRatio: 1,
    pvpMultiplier: magicPvp,
  });

  const physicalEstimate =
    physicalHit.finalDamage *
    physicalLayers.damageResistLayer *
    mediumLayer *
    demiHumanLayer *
    physicalLayers.elementLayer;
  const magicEstimate =
    magicHit.finalDamage * magicLayers.damageResistLayer * mediumLayer * demiHumanLayer * magicLayers.elementLayer;

  const requiredPdef = requiredIgnoreForTarget({
    incomingAttack: v.enemyPatk,
    rawEquipmentDefense: physical.rawEquipmentDefense,
    targetDamageTaken: v.targetDamageTaken / 100,
  });
  const requiredMdef = requiredIgnoreForTarget({
    incomingAttack: v.enemyMatk,
    rawEquipmentDefense: magic.rawEquipmentDefense,
    targetDamageTaken: v.targetDamageTaken / 100,
  });

  return {
    physicalEstimate,
    magicEstimate,
    physical,
    magic,
    physicalLayers,
    magicLayers,
    ignoreStillNeededPdef: Math.max(requiredPdef - v.enemyIgnorePdef, 0),
    ignoreStillNeededMdef: Math.max(requiredMdef - v.enemyIgnoreMdef, 0),
    smallLayer,
    mediumLayer,
    largeLayer,
    demiHumanLayer,
    physicalNotes: counterNotes({
      enemyDamageBonus: v.enemyPdmg / 100,
      yourDamageResist: v.yourPdmgR / 100,
      enemyPvpDamage: v.enemyPvpDamage,
      yourPvpDamageReduction: v.yourPvpReduction,
      enemyIgnoreDefense: v.enemyIgnorePdef,
    }),
    magicNotes: counterNotes({
      enemyDamageBonus: v.enemyMdmg / 100,
      yourDamageResist: v.yourMdmgR / 100,
      enemyPvpDamage: v.enemyPvpDamage,
      yourPvpDamageReduction: v.yourPvpReduction,
      enemyIgnoreDefense: v.enemyIgnoreMdef,
    }),
    hitSample: hitChance({ hitBase: 367, fleeBase: 176, attackerCount: 2, isPvp: v.isPvp, dex: 90 }),
    critSample: critChance(24, 14),
    physicalCritEstimate: critDamage(physicalEstimate, 0, 0),
    magicCritEstimate: critDamage(magicEstimate, 0, 0),
  };
}
