import { formatNumber } from '../lib/format';
import { useCookieHistory, useCookieState } from '../lib/history';
import { COOKIE_KEYS, decodePvpInputs, encodePvpInputs, pvpSnapshotCodec, type PvpSnapshot } from '../lib/persistence';
import { computePvp, DEFAULT_PVP_INPUTS, ELEMENT_OPTIONS, type PvpInputs } from '../lib/pvp';
import { HistoryTable, type HistoryColumn } from './HistoryTable';
import { InputSection, LayerRow, NumberField, ResultCard, ResultColumn, SelectField } from './LabControls';
import { SaveControls } from './SaveControls';
import { StatsGuide } from './StatsGuide';
import { TrendChart, type TrendPoint } from './TrendChart';

const ELEMENT_SELECT_OPTIONS = ELEMENT_OPTIONS.map(([label, value]) => [label, String(value)] as const);

const HISTORY_COLUMNS: HistoryColumn<PvpSnapshot>[] = [
  { key: 'phys', label: 'Physical', render: (d) => d.physicalEstimate.toFixed(0) },
  { key: 'magic', label: 'Magic', render: (d) => d.magicEstimate.toFixed(0) },
  { key: 'ptaken', label: 'PDEF taken', render: (d) => `${d.pdefDamageTaken.toFixed(2)}%` },
  { key: 'mtaken', label: 'MDEF taken', render: (d) => `${d.mdefDamageTaken.toFixed(2)}%` },
  { key: 'rawP', label: 'RAW PDEF', render: (d) => formatNumber(d.rawPdef) },
  { key: 'rawM', label: 'RAW MDEF', render: (d) => formatNumber(d.rawMdef) },
];

export function PvpCounterLab() {
  const [inputs, setInputs] = useCookieState(COOKIE_KEYS.pvpInputs, DEFAULT_PVP_INPUTS, encodePvpInputs, decodePvpInputs);
  const history = useCookieHistory(COOKIE_KEYS.pvpHistory, pvpSnapshotCodec);
  const r = computePvp(inputs);

  const set =
    <K extends keyof PvpInputs>(key: K) =>
    (value: PvpInputs[K]) =>
      setInputs((prev) => ({ ...prev, [key]: value }));

  const snapshot: PvpSnapshot = {
    physicalEstimate: r.physicalEstimate,
    magicEstimate: r.magicEstimate,
    pdefDamageTaken: r.physical.defenseMultiplier * 100,
    mdefDamageTaken: r.magic.defenseMultiplier * 100,
    rawPdef: r.physical.rawEquipmentDefense,
    rawMdef: r.magic.rawEquipmentDefense,
  };

  const points: TrendPoint[] = history.entries.map((entry) => ({ at: entry.at, label: entry.label, ...entry.data }));

  return (
    <section className="pvp-sandbox-page">
      <section className="sandbox-hero">
        <p className="sandbox-eyebrow">RO Origin SEA reverse-engineered sample</p>
        <h1>Damage Counter Sandbox</h1>
        <p>
          Attacker means enemy hitting you. Defender means your stats. This simplified PvP view keeps only
          Small/Medium/Large, Demi-Human, and Fire/Wind/Earth/Water.
        </p>
      </section>

      <StatsGuide />

      <section className="sandbox-quick-result">
        <ResultCard label="Physical estimate" value={r.physicalEstimate} highlight />
        <ResultCard label="Magic estimate" value={r.magicEstimate} highlight />
        <ResultCard label="RAW PDEF" value={r.physical.rawEquipmentDefense} />
        <ResultCard label="RAW MDEF" value={r.magic.rawEquipmentDefense} />
      </section>

      <SaveControls
        className="sandbox-save"
        onSave={(label) => history.add(snapshot, label)}
        count={history.entries.length}
        max={history.max}
      />

      <section className="sandbox-section-grid">
        <InputSection
          title="1. Attacker = Enemy Stats"
          note="Use enemy stats here when calculating how much damage you take."
        >
          <label className="sandbox-checkbox">
            <input type="checkbox" checked={inputs.isPvp} onChange={(e) => set('isPvp')(e.target.checked)} />
            PvP scene
          </label>
          <NumberField label="Enemy PATK" value={inputs.enemyPatk} onChange={set('enemyPatk')} help="Enemy Details > PATK." />
          <NumberField label="Enemy MATK" value={inputs.enemyMatk} onChange={set('enemyMatk')} help="Enemy Details > MATK." />
          <NumberField
            label="Weapon ATK/MATK"
            value={inputs.weaponAtk}
            onChange={set('weaponAtk')}
            help="Leave 0 if using total PATK/MATK."
          />
          <NumberField
            label="Refine PATK"
            value={inputs.refinePatk}
            onChange={set('refinePatk')}
            help="Enemy Details > Refine PATK."
          />
          <NumberField
            label="Refine MATK"
            value={inputs.refineMatk}
            onChange={set('refineMatk')}
            help="Enemy Details > Refine MATK."
          />
          <NumberField
            label="Enemy Ignore PDEF"
            value={inputs.enemyIgnorePdef}
            onChange={set('enemyIgnorePdef')}
            help="Enemy Details > Ignore PDEF."
          />
          <NumberField
            label="Enemy Ignore MDEF"
            value={inputs.enemyIgnoreMdef}
            onChange={set('enemyIgnoreMdef')}
            help="Enemy Details > Ignore MDEF."
          />
          <NumberField
            label="Enemy PDMG %"
            value={inputs.enemyPdmg}
            onChange={set('enemyPdmg')}
            step={0.01}
            help="Enemy Details > PDMG."
          />
          <NumberField
            label="Enemy MDMG %"
            value={inputs.enemyMdmg}
            onChange={set('enemyMdmg')}
            step={0.01}
            help="Enemy Details > MDMG."
          />
          <NumberField
            label="Enemy PvP DMG"
            value={inputs.enemyPvpDamage}
            onChange={set('enemyPvpDamage')}
            help="Enemy Details > PvP DMG Bonus."
          />
          <NumberField
            label="Skill multiplier"
            value={inputs.skillMultiplier}
            onChange={set('skillMultiplier')}
            step={0.1}
            help="200% = 2.0, 750% = 7.5."
          />
        </InputSection>

        <InputSection
          title="2. Defender = Your Stats"
          note="Use your stats here. RAW PDEF/MDEF reverses Equipment DEF% and does not include Base DEF."
        >
          <NumberField
            label="Base PDEF"
            value={inputs.basePdef}
            onChange={set('basePdef')}
            help="Your PDEF notice > Base PDEF. Flat subtraction later."
          />
          <NumberField
            label="Base MDEF"
            value={inputs.baseMdef}
            onChange={set('baseMdef')}
            help="Your MDEF notice > Base MDEF. Flat subtraction later."
          />
          <NumberField
            label="Equipment PDEF"
            value={inputs.equipPdef}
            onChange={set('equipPdef')}
            help="Your PDEF notice > Equipment PDEF."
          />
          <NumberField
            label="Equipment MDEF"
            value={inputs.equipMdef}
            onChange={set('equipMdef')}
            help="Your MDEF notice > Equipment MDEF."
          />
          <NumberField
            label="Equipment PDEF %"
            value={inputs.equipPdefPercent}
            onChange={set('equipPdefPercent')}
            step={0.01}
            help="Your Special > Equipment PDEF %."
          />
          <NumberField
            label="Equipment MDEF %"
            value={inputs.equipMdefPercent}
            onChange={set('equipMdefPercent')}
            step={0.01}
            help="Your Special > Equipment MDEF %."
          />
          <NumberField
            label="Your PDMG.R %"
            value={inputs.yourPdmgR}
            onChange={set('yourPdmgR')}
            step={0.01}
            help="Your Quasi-Stats > PDMG.R."
          />
          <NumberField
            label="Your MDMG.R %"
            value={inputs.yourMdmgR}
            onChange={set('yourMdmgR')}
            step={0.01}
            help="Your Quasi-Stats > MDMG.R."
          />
          <NumberField
            label="Your PvP DMG Reduction"
            value={inputs.yourPvpReduction}
            onChange={set('yourPvpReduction')}
            help="Your Quasi-Stats > PvP DMG Reduction."
          />
        </InputSection>

        <InputSection title="3. PvP Matchup Layers" note="Only the PvP-relevant fields requested are shown.">
          <NumberField
            label="DMG vs Small %"
            value={inputs.dmgVsSmall}
            onChange={set('dmgVsSmall')}
            step={0.01}
            help="Special > DMG vs Small Enemies."
          />
          <NumberField
            label="Reduction vs Small %"
            value={inputs.reductionVsSmall}
            onChange={set('reductionVsSmall')}
            step={0.01}
            help="Special > DMG Reduction vs Small."
          />
          <NumberField
            label="DMG vs Medium %"
            value={inputs.dmgVsMedium}
            onChange={set('dmgVsMedium')}
            step={0.01}
            help="Special > DMG vs Medium Enemies."
          />
          <NumberField
            label="Reduction vs Medium %"
            value={inputs.reductionVsMedium}
            onChange={set('reductionVsMedium')}
            step={0.01}
            help="Special > DMG Reduction vs Medium."
          />
          <NumberField
            label="DMG vs Large %"
            value={inputs.dmgVsLarge}
            onChange={set('dmgVsLarge')}
            step={0.01}
            help="Special > DMG vs Large Enemies."
          />
          <NumberField
            label="Reduction vs Large %"
            value={inputs.reductionVsLarge}
            onChange={set('reductionVsLarge')}
            step={0.01}
            help="Special > DMG Reduction vs Large."
          />
          <NumberField
            label="DMG vs Demi-Human %"
            value={inputs.dmgVsDemiHuman}
            onChange={set('dmgVsDemiHuman')}
            step={0.01}
            help="Special > DMG vs Demi-Human."
          />
          <NumberField
            label="Reduction vs Demi-Human %"
            value={inputs.reductionVsDemiHuman}
            onChange={set('reductionVsDemiHuman')}
            step={0.01}
            help="Special > DMG Reduction vs Demi-Human."
          />
          <SelectField
            label="Attack element"
            value={String(inputs.attackElement)}
            onChange={(value) => set('attackElement')(Number(value))}
            help="Incoming skill element."
            options={ELEMENT_SELECT_OPTIONS}
          />
          <SelectField
            label="Your element"
            value={String(inputs.yourElement)}
            onChange={(value) => set('yourElement')(Number(value))}
            help="Your defending/armor element."
            options={ELEMENT_SELECT_OPTIONS}
          />
          <NumberField
            label="Enemy element damage %"
            value={inputs.enemyElementDamage}
            onChange={set('enemyElementDamage')}
            step={0.01}
            help="Enemy element damage bonus."
          />
          <NumberField
            label="Your element reduction %"
            value={inputs.yourElementReduction}
            onChange={set('yourElementReduction')}
            step={0.01}
            help="Your Fire/Wind/Earth/Water skill damage reduction."
          />
        </InputSection>

        <InputSection
          title="4. Counter Goal"
          note="Shows how much ignore is needed to make your DEF layer allow this damage taken."
        >
          <NumberField
            label="Target damage taken %"
            value={inputs.targetDamageTaken}
            onChange={set('targetDamageTaken')}
            step={1}
            help="50 means enemy wants your DEF layer to allow 50% damage."
          />
          <div className="sandbox-checkbox" style={{ alignContent: 'end' }}>
            <button type="button" className="ghost-button" onClick={() => setInputs(DEFAULT_PVP_INPUTS)}>
              Reset all fields
            </button>
          </div>
        </InputSection>
      </section>

      <section className="sandbox-panel sandbox-results-panel">
        <h2>Defender DEF Result</h2>
        <div className="sandbox-explain-box">
          <p>
            <strong>RAW PDEF/MDEF</strong> = Equipment PDEF/MDEF divided by Equipment PDEF/MDEF %. Base PDEF/MDEF is
            not included.
          </p>
          <p>
            <strong>After enemy ignore</strong> = RAW DEF minus enemy Ignore DEF. This enters the PvP DEF formula.
          </p>
          <p>
            <strong>DEF damage taken %</strong> = damage remaining after DEF formula. Lower is better for defender.
          </p>
        </div>
        <div className="sandbox-compare-grid">
          <ResultColumn title="Physical DEF">
            <ResultCard label="RAW PDEF" value={r.physical.rawEquipmentDefense} />
            <ResultCard label="After enemy Ignore PDEF" value={r.physical.effectiveEquipmentDefense} />
            <ResultCard label="PDEF damage taken" value={r.physical.defenseMultiplier * 100} suffix="%" decimals={2} />
            <ResultCard label="Ignore still needed" value={r.ignoreStillNeededPdef} />
          </ResultColumn>
          <ResultColumn title="Magic DEF">
            <ResultCard label="RAW MDEF" value={r.magic.rawEquipmentDefense} />
            <ResultCard label="After enemy Ignore MDEF" value={r.magic.effectiveEquipmentDefense} />
            <ResultCard label="MDEF damage taken" value={r.magic.defenseMultiplier * 100} suffix="%" decimals={2} />
            <ResultCard label="Ignore still needed" value={r.ignoreStillNeededMdef} />
          </ResultColumn>
        </div>
      </section>

      <section className="sandbox-panel sandbox-results-panel">
        <h2>Size, Race, Element Layers</h2>
        <div className="sandbox-layer-list">
          <LayerRow label="Small layer" value={r.smallLayer} />
          <LayerRow label="Medium layer (used in PvP estimate)" value={r.mediumLayer} />
          <LayerRow label="Large layer" value={r.largeLayer} />
          <LayerRow label="Demi-Human layer (used in PvP estimate)" value={r.demiHumanLayer} />
          <LayerRow label="Element layer" value={r.physicalLayers.elementLayer} />
        </div>
      </section>

      <section className="sandbox-panel sandbox-results-panel">
        <h2>Final Damage Layers</h2>
        <div className="sandbox-compare-grid">
          <ResultColumn title="Physical Layers">
            <LayerRow label="PDEF layer" value={r.physicalLayers.defenseLayer} />
            <LayerRow label="PDMG vs PDMG.R" value={r.physicalLayers.damageResistLayer} />
            <LayerRow label="PvP layer" value={r.physicalLayers.pvpLayer} />
            <LayerRow label="Total multiplier" value={r.physicalLayers.totalMultiplier} />
          </ResultColumn>
          <ResultColumn title="Magic Layers">
            <LayerRow label="MDEF layer" value={r.magicLayers.defenseLayer} />
            <LayerRow label="MDMG vs MDMG.R" value={r.magicLayers.damageResistLayer} />
            <LayerRow label="PvP layer" value={r.magicLayers.pvpLayer} />
            <LayerRow label="Total multiplier" value={r.magicLayers.totalMultiplier} />
          </ResultColumn>
        </div>
      </section>

      <section className="sandbox-panel sandbox-recommendations">
        <h2>Counter Notes</h2>
        <p>
          <strong>Physical:</strong> {r.physicalNotes.join(' ')}
        </p>
        <p>
          <strong>Magic:</strong> {r.magicNotes.join(' ')}
        </p>
        <p>
          Ignore PDEF/MDEF only counters the DEF layer. Size, Demi-Human, element, PDMG.R/MDMG.R, and PvP reduction are
          separate layers.
        </p>
        <p>
          Hit sample: {(r.hitSample * 100).toFixed(2)}% | Crit sample: {(r.critSample * 100).toFixed(2)}% | Physical
          crit estimate: {r.physicalCritEstimate.toFixed(0)} | Magic crit estimate: {r.magicCritEstimate.toFixed(0)}
        </p>
      </section>

      <section className="sandbox-panel sandbox-results-panel" aria-label="Progress tracking">
        <div className="tracking-card">
          <div className="tracking-head">
            <div>
              <h2>Progress tracking</h2>
              <p>Every saved snapshot records the damage estimates and DEF layers of that moment.</p>
            </div>
            <span className="tracking-count">{history.entries.length} snapshots</span>
          </div>
          <div className="chart-grid">
            <TrendChart
              title="Damage estimate"
              points={points}
              series={[
                { key: 'physicalEstimate', name: 'Physical' },
                { key: 'magicEstimate', name: 'Magic' },
              ]}
            />
            <TrendChart
              title="DEF damage taken"
              points={points}
              unit="%"
              decimals={2}
              series={[
                { key: 'pdefDamageTaken', name: 'PDEF' },
                { key: 'mdefDamageTaken', name: 'MDEF' },
              ]}
            />
          </div>
          <HistoryTable
            entries={history.entries}
            columns={HISTORY_COLUMNS}
            max={history.max}
            onRemove={history.remove}
            onClear={history.clear}
          />
        </div>
      </section>
    </section>
  );
}
