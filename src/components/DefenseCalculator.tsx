import { round2 } from '../lib/codec';
import { computeDefense, DEFAULT_DEFENSE_INPUTS, type DefenseInputs } from '../lib/defense';
import { formatNumber, formatPercent } from '../lib/format';
import { useCookieHistory, useCookieState } from '../lib/history';
import { COOKIE_KEYS, decodeDefenseInputs, defenseSnapshotCodec, encodeDefenseInputs } from '../lib/persistence';
import { Field, MetricCard } from './Field';
import { HistoryTable, type HistoryColumn } from './HistoryTable';
import { SaveControls } from './SaveControls';
import { StatsGuide } from './StatsGuide';
import { TrendChart, type TrendPoint } from './TrendChart';

const SANDAL_IMAGE = 'https://emoji.fileformat.info/png/1fa74.png';

const HISTORY_COLUMNS: HistoryColumn<DefenseInputs>[] = [
  { key: 'rawPdef', label: 'Raw PDEF', render: (d) => formatNumber(computeDefense(d).rawPdef) },
  { key: 'rawMdef', label: 'Raw MDEF', render: (d) => formatNumber(computeDefense(d).rawMdef) },
  { key: 'pdefAfter', label: 'PDEF after Ignore', render: (d) => formatNumber(computeDefense(d).pdefAfterIgnore) },
  { key: 'mdefAfter', label: 'MDEF after Ignore', render: (d) => formatNumber(computeDefense(d).mdefAfterIgnore) },
];

export function DefenseCalculator() {
  const [inputs, setInputs] = useCookieState(
    COOKIE_KEYS.defenseInputs,
    DEFAULT_DEFENSE_INPUTS,
    encodeDefenseInputs,
    decodeDefenseInputs,
  );
  const history = useCookieHistory(COOKIE_KEYS.defenseHistory, defenseSnapshotCodec);
  const results = computeDefense(inputs);

  const update = (key: keyof DefenseInputs) => (value: string) => setInputs((prev) => ({ ...prev, [key]: value }));

  const points: TrendPoint[] = history.entries.map((entry) => {
    const r = computeDefense(entry.data);
    return {
      at: entry.at,
      label: entry.label,
      rawPdef: round2(r.rawPdef),
      pdefAfter: round2(r.pdefAfterIgnore),
      rawMdef: round2(r.rawMdef),
      mdefAfter: round2(r.mdefAfterIgnore),
    };
  });

  return (
    <section className="calculator-card">
      <header className="hero">
        <div className="hero-topline">
          <span className="eyebrow">Defense Calculator</span>
          <span className="hero-badge">Kraken-style dashboard</span>
        </div>
        <h1>Raw DEF and effective DEF vs ignore</h1>
        <p className="hero-copy">
          Exact raw defense math from the client, with a clean read on what survives after ignore.
        </p>
        <div className="hero-meta">
          <span>Live recalculation</span>
          <span>Exact raw DEF</span>
          <span>Estimate mode for mitigation</span>
          <span>Saved in cookies</span>
        </div>
        <div className="methodology-card">
          <p className="subtext">
            Raw defense is calculated from the visible client formula:
            <strong> equipment DEF / (1 + equipment DEF%)</strong>.
          </p>
          <p className="subtext">
            Effective defense vs ignore shows what remains after the attacker&apos;s ignore stat is subtracted from
            your raw defense.
          </p>
          <p className="subtext">
            Mitigation values are practical estimates based on visible client-side formulas, not a guaranteed full
            server reconstruction.
          </p>
        </div>
        <div className="metric-strip">
          <MetricCard label="Raw PDEF" value={formatNumber(results.rawPdef)} tone="purple" />
          <MetricCard label="Raw MDEF" value={formatNumber(results.rawMdef)} tone="blue" />
          <MetricCard label="PDEF after Ignore" value={formatNumber(results.pdefAfterIgnore)} tone="gold" />
          <MetricCard label="MDEF after Ignore" value={formatNumber(results.mdefAfterIgnore)} tone="gold" />
        </div>
      </header>

      <div className="layout">
        <form className="input-grid" onSubmit={(e) => e.preventDefault()}>
          <div className="input-grid-full">
            <StatsGuide />
          </div>
          <Field
            id="equipment-pdef-value"
            label="Equipment PDEF"
            description="Your equipment-based physical defense shown in the stat panel."
            value={inputs.pdef}
            onChange={update('pdef')}
          />
          <Field
            id="equipment-mdef-value"
            label="Equipment MDEF"
            description="Your equipment-based magic defense shown in the stat panel."
            value={inputs.mdef}
            onChange={update('mdef')}
          />
          <Field
            label="Equipment PDEF %"
            description="The Equipment PDEF % value from Special stats. You can enter 23 or 23%."
            value={inputs.equipPdefPercent}
            onChange={update('equipPdefPercent')}
            placeholder="23 or 23%"
          />
          <Field
            label="Equipment MDEF %"
            description="The Equipment MDEF % value from Special stats. You can enter 16 or 16%."
            value={inputs.equipMdefPercent}
            onChange={update('equipMdefPercent')}
            placeholder="16 or 16%"
          />
          <Field
            label="Ignore PDEF"
            description="Attacker stat used to bypass part of your physical defense."
            value={inputs.ignorePdef}
            onChange={update('ignorePdef')}
          />
          <Field
            label="Ignore MDEF"
            description="Attacker stat used to bypass part of your magic defense."
            value={inputs.ignoreMdef}
            onChange={update('ignoreMdef')}
          />
          <Field
            label="PDMG Reduction"
            description="Displayed physical damage reduction stat. Treated here as a mitigation reference, not a full final-damage formula."
            value={inputs.pdmgReduction}
            onChange={update('pdmgReduction')}
            placeholder="43.52 or 43.52%"
          />
          <Field
            label="MDMG Reduction"
            description="Displayed magic damage reduction stat. Treated here as a mitigation reference, not a full final-damage formula."
            value={inputs.mdmgReduction}
            onChange={update('mdmgReduction')}
            placeholder="58.52 or 58.52%"
          />
          <SaveControls
            className="save-row"
            onSave={(label) => history.add(inputs, label)}
            count={history.entries.length}
            max={history.max}
          >
            <button className="reset-button" type="button" onClick={() => setInputs(DEFAULT_DEFENSE_INPUTS)}>
              Reset
            </button>
          </SaveControls>
        </form>

        <aside className="results-panel">
          <div className="result-group result-group-main">
            <div className="result-head">
              <h2>Result Snapshot</h2>
              <span className="result-tag">{results.tier}</span>
            </div>
            {results.tier === 'holding sandal mode' ? (
              <div className="commentary-image-wrap">
                <img src={SANDAL_IMAGE} alt="sandal emoji" width="28" height="28" />
              </div>
            ) : (
              <p className="commentary-text">{results.tier}</p>
            )}
          </div>
          <div className="result-group">
            <h2>Raw DEF</h2>
            <p>
              <strong>PDEF:</strong> {formatNumber(results.rawPdef)}
            </p>
            <p>
              <strong>MDEF:</strong> {formatNumber(results.rawMdef)}
            </p>
          </div>
          <div className="result-group">
            <h2>Effective DEF vs Ignore</h2>
            <p>
              <strong>PDEF after Ignore:</strong> {formatNumber(results.pdefAfterIgnore)}
            </p>
            <p>
              <strong>MDEF after Ignore:</strong> {formatNumber(results.mdefAfterIgnore)}
            </p>
          </div>
          <div className="result-group">
            <h2>Reduction Reference</h2>
            <p>
              <strong>PDMG Reduction:</strong> {formatPercent(results.pdmgReduction)}
            </p>
            <p>
              <strong>MDMG Reduction:</strong> {formatPercent(results.mdmgReduction)}
            </p>
          </div>
        </aside>
      </div>

      <section className="tracking-card" aria-label="Progress tracking">
        <div className="tracking-head">
          <div>
            <h2>Progress tracking</h2>
            <p>Every saved snapshot becomes a point. Hover a point for the exact values; load one to restore its inputs.</p>
          </div>
          <span className="tracking-count">{history.entries.length} snapshots</span>
        </div>
        <div className="chart-grid">
          <TrendChart
            title="Physical defense"
            points={points}
            series={[
              { key: 'rawPdef', name: 'Raw PDEF' },
              { key: 'pdefAfter', name: 'PDEF after Ignore' },
            ]}
          />
          <TrendChart
            title="Magic defense"
            points={points}
            series={[
              { key: 'rawMdef', name: 'Raw MDEF' },
              { key: 'mdefAfter', name: 'MDEF after Ignore' },
            ]}
          />
        </div>
        <HistoryTable
          entries={history.entries}
          columns={HISTORY_COLUMNS}
          max={history.max}
          onRemove={history.remove}
          onClear={history.clear}
          onLoad={(index) => setInputs(history.entries[index].data)}
        />
      </section>
    </section>
  );
}
