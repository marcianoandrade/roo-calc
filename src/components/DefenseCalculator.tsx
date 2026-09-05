import { round2 } from '../lib/codec';
import { computeDefense, DEFAULT_DEFENSE_INPUTS, type DefenseInputs } from '../lib/defense';
import { formatNumber, formatPercent } from '../lib/format';
import { useCookieHistory, useCookieState } from '../lib/history';
import { COOKIE_KEYS, decodeDefenseInputs, defenseSnapshotCodec, encodeDefenseInputs } from '../lib/persistence';
import { formatShareText } from '../lib/share';
import { Meter, StatRow } from './Field';
import { HistoryTable, type HistoryColumn } from './HistoryTable';
import { RoWindow } from './RoWindow';
import { SaveControls } from './SaveControls';
import { ShareButton } from './ShareButton';
import { TrendChart, type TrendPoint } from './TrendChart';

const SANDAL_IMAGE = 'https://emoji.fileformat.info/png/1fa74.png';

const HISTORY_COLUMNS: HistoryColumn<DefenseInputs>[] = [
  { key: 'rawPdef', label: 'Raw PDEF', render: (d) => formatNumber(computeDefense(d).rawPdef) },
  { key: 'rawMdef', label: 'Raw MDEF', render: (d) => formatNumber(computeDefense(d).rawMdef) },
  { key: 'total', label: 'Total', render: (d) => formatNumber(computeDefense(d).totalRawDefense) },
  { key: 'tier', label: 'Tier', render: (d) => computeDefense(d).tier.name },
];

export function DefenseCalculator() {
  const [inputs, setInputs] = useCookieState(
    COOKIE_KEYS.defenseInputs,
    DEFAULT_DEFENSE_INPUTS,
    encodeDefenseInputs,
    decodeDefenseInputs,
  );
  const history = useCookieHistory(COOKIE_KEYS.defenseHistory, defenseSnapshotCodec);
  // Results are derived on every render, so typing already recalculates live.
  const results = computeDefense(inputs);
  const { tier } = results;

  const update = (key: keyof DefenseInputs) => (value: string) => setInputs((prev) => ({ ...prev, [key]: value }));

  const points: TrendPoint[] = history.entries.map((entry) => {
    const r = computeDefense(entry.data);
    return {
      at: entry.at,
      label: entry.label,
      rawPdef: round2(r.rawPdef),
      rawMdef: round2(r.rawMdef),
    };
  });

  const tierText = tier.next
    ? `${formatNumber(results.totalRawDefense)} / ${formatNumber(tier.next.at)}`
    : `${formatNumber(results.totalRawDefense)} · MAX`;

  return (
    <>
      <div className="ro-grid">
        <RoWindow title="Status" className="ro-window-status">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="ro-status-grid">
              <div className="ro-status-col">
                <p className="ro-section-title">Physical</p>
                <StatRow
                  id="equipment-pdef-value"
                  label="Equipment PDEF"
                  description="Your equipment-based physical defense shown in the stat panel."
                  value={inputs.pdef}
                  onChange={update('pdef')}
                />
                <StatRow
                  label="Equipment PDEF %"
                  description="The Equipment PDEF % value from Special stats. You can enter 23 or 23%."
                  value={inputs.equipPdefPercent}
                  onChange={update('equipPdefPercent')}
                  placeholder="23 or 23%"
                />
                <StatRow
                  label="PDMG Reduction"
                  description="Displayed physical damage reduction stat (reference only)."
                  value={inputs.pdmgReduction}
                  onChange={update('pdmgReduction')}
                  placeholder="43.52 or 43.52%"
                />
              </div>
              <div className="ro-status-col">
                <p className="ro-section-title">Magic</p>
                <StatRow
                  id="equipment-mdef-value"
                  label="Equipment MDEF"
                  description="Your equipment-based magic defense shown in the stat panel."
                  value={inputs.mdef}
                  onChange={update('mdef')}
                />
                <StatRow
                  label="Equipment MDEF %"
                  description="The Equipment MDEF % value from Special stats. You can enter 16 or 16%."
                  value={inputs.equipMdefPercent}
                  onChange={update('equipMdefPercent')}
                  placeholder="16 or 16%"
                />
                <StatRow
                  label="MDMG Reduction"
                  description="Displayed magic damage reduction stat (reference only)."
                  value={inputs.mdmgReduction}
                  onChange={update('mdmgReduction')}
                  placeholder="58.52 or 58.52%"
                />
              </div>
            </div>
            <div className="ro-method">
              <p className="ro-section-title">How it is calculated</p>
              <p className="ro-help">
                Raw defense uses the visible client formula: <strong>equipment DEF / (1 + equipment DEF%)</strong>.
                Values update as you type; the Calculate button simply runs the same math again. Reduction values
                are shown as a mitigation reference only.
              </p>
            </div>
            <SaveControls
              onCalculate={() => setInputs((prev) => ({ ...prev }))}
              onSave={(label) => history.add(inputs, label)}
              count={history.entries.length}
              max={history.max}
            >
              <button className="ro-button" type="button" onClick={() => setInputs(DEFAULT_DEFENSE_INPUTS)}>
                Reset
              </button>
            </SaveControls>
          </form>
        </RoWindow>

        <RoWindow title="Basic Info" className="ro-window-basic">
          <div className="ro-basic-name">
            <strong>Defense Calculator</strong>
            <span className="ro-pill">{tier.name}</span>
          </div>
          {tier.name === 'holding sandal mode' && (
            <div className="ro-sandal">
              <img src={SANDAL_IMAGE} alt="sandal emoji" width="20" height="20" />
            </div>
          )}
          <div className="ro-stat-list">
            <div className="ro-stat ro-stat-big">
              <span>Raw PDEF</span>
              <strong>{formatNumber(results.rawPdef)}</strong>
            </div>
            <div className="ro-stat ro-stat-big">
              <span>Raw MDEF</span>
              <strong>{formatNumber(results.rawMdef)}</strong>
            </div>
            <div className="ro-stat">
              <span>Total raw DEF</span>
              <strong>{formatNumber(results.totalRawDefense)}</strong>
            </div>
          </div>
          <ShareButton text={formatShareText(results.rawPdef, results.rawMdef)} />
          <div>
            <Meter label="Tier" progress={tier.progress} text={tierText} />
            <p className="ro-help">
              {tier.next
                ? `Next tier "${tier.next.name}" at ${formatNumber(tier.next.at)} total raw DEF.`
                : 'Top tier reached.'}
            </p>
          </div>
          <div className="ro-stat-list">
            <div className="ro-stat">
              <span>PDMG Reduction</span>
              <strong>{formatPercent(results.pdmgReduction)}</strong>
            </div>
            <div className="ro-stat">
              <span>MDMG Reduction</span>
              <strong>{formatPercent(results.mdmgReduction)}</strong>
            </div>
          </div>
        </RoWindow>
      </div>

      <RoWindow title="Progress tracking" aside={`${history.entries.length} snapshots`}>
        <p className="ro-help" style={{ marginBottom: 8 }}>
          Every saved snapshot becomes a point. Hover a point for the exact values.
        </p>
        <div className="ro-chart-grid">
          <TrendChart title="Raw PDEF" points={points} series={[{ key: 'rawPdef', name: 'Raw PDEF' }]} />
          <TrendChart title="Raw MDEF" points={points} series={[{ key: 'rawMdef', name: 'Raw MDEF' }]} />
        </div>
      </RoWindow>

      {history.entries.length > 0 && (
        <RoWindow title="Saved snapshots" aside={`${history.entries.length} / ${history.max}`}>
          <HistoryTable
            entries={history.entries}
            columns={HISTORY_COLUMNS}
            onRemove={history.remove}
            onClear={history.clear}
            onLoad={(index) => setInputs(history.entries[index].data)}
          />
        </RoWindow>
      )}
    </>
  );
}
