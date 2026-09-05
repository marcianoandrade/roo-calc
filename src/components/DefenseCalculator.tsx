import { useLocale } from '../i18n/LocaleContext';
import { round2 } from '../lib/codec';
import { computeDefense, DEFAULT_DEFENSE_INPUTS, type DefenseInputs } from '../lib/defense';
import { formatNumber, formatPercent } from '../lib/format';
import { useCookieHistory, useCookieState } from '../lib/history';
import { COOKIE_KEYS, decodeDefenseInputs, defenseSnapshotCodec, encodeDefenseInputs } from '../lib/persistence';
import { formatShareText } from '../lib/share';
import { StatRow } from './Field';
import { HistoryTable, type HistoryColumn } from './HistoryTable';
import { RoWindow } from './RoWindow';
import { SaveControls } from './SaveControls';
import { ShareButton } from './ShareButton';
import { TierPanel } from './TierPanel';
import { TrendChart, type TrendPoint } from './TrendChart';

const SANDAL_IMAGE = 'https://emoji.fileformat.info/png/1fa74.png';

export function DefenseCalculator() {
  const { t, locale } = useLocale();
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
  const fmt = (value: number) => formatNumber(value, locale);

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

  const historyColumns: HistoryColumn<DefenseInputs>[] = [
    { key: 'rawPdef', label: t.basic.rawPdef, render: (d) => fmt(computeDefense(d).rawPdef) },
    { key: 'rawMdef', label: t.basic.rawMdef, render: (d) => fmt(computeDefense(d).rawMdef) },
    { key: 'total', label: t.history.total, render: (d) => fmt(computeDefense(d).totalRawDefense) },
    { key: 'tier', label: t.history.tier, render: (d) => t.tier.names[computeDefense(d).tier.name] },
  ];

  return (
    <>
      <div className="ro-grid">
        <RoWindow title={t.windows.status} className="ro-window-status">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="ro-status-grid">
              <div className="ro-status-col">
                <p className="ro-section-title">{t.status.physical}</p>
                <StatRow
                  id="equipment-pdef-value"
                  label={t.status.pdef}
                  description={t.status.pdefHelp}
                  value={inputs.pdef}
                  onChange={update('pdef')}
                />
                <StatRow
                  id="equipment-pdef-percent"
                  label={t.status.pdefPercent}
                  description={t.status.pdefPercentHelp}
                  value={inputs.equipPdefPercent}
                  onChange={update('equipPdefPercent')}
                  placeholder={t.status.pdefPercentPlaceholder}
                />
                <StatRow
                  id="pdmg-reduction"
                  label={t.status.pdmg}
                  description={t.status.pdmgHelp}
                  value={inputs.pdmgReduction}
                  onChange={update('pdmgReduction')}
                  placeholder={t.status.pdmgPlaceholder}
                />
              </div>
              <div className="ro-status-col">
                <p className="ro-section-title">{t.status.magic}</p>
                <StatRow
                  id="equipment-mdef-value"
                  label={t.status.mdef}
                  description={t.status.mdefHelp}
                  value={inputs.mdef}
                  onChange={update('mdef')}
                />
                <StatRow
                  id="equipment-mdef-percent"
                  label={t.status.mdefPercent}
                  description={t.status.mdefPercentHelp}
                  value={inputs.equipMdefPercent}
                  onChange={update('equipMdefPercent')}
                  placeholder={t.status.mdefPercentPlaceholder}
                />
                <StatRow
                  id="mdmg-reduction"
                  label={t.status.mdmg}
                  description={t.status.mdmgHelp}
                  value={inputs.mdmgReduction}
                  onChange={update('mdmgReduction')}
                  placeholder={t.status.mdmgPlaceholder}
                />
              </div>
            </div>
            <div className="ro-method">
              <p className="ro-section-title">{t.status.howTitle}</p>
              <p className="ro-help">
                {t.status.howText} <strong>{t.status.howFormula}</strong>. {t.status.howTail}
              </p>
            </div>
            <SaveControls
              onCalculate={() => setInputs((prev) => ({ ...prev }))}
              onSave={(label) => history.add(inputs, label)}
              count={history.entries.length}
              max={history.max}
            >
              <button className="ro-button" type="button" onClick={() => setInputs(DEFAULT_DEFENSE_INPUTS)}>
                {t.status.reset}
              </button>
            </SaveControls>
          </form>
        </RoWindow>

        <RoWindow title={t.windows.basicInfo} className="ro-window-basic">
          <div className="ro-basic-name">
            <strong>{t.basic.name}</strong>
            <span className="ro-pill">{t.tier.names[tier.name]}</span>
          </div>
          {tier.name === 'holding sandal mode' && (
            <div className="ro-sandal">
              <img src={SANDAL_IMAGE} alt={t.basic.sandalAlt} width="20" height="20" />
            </div>
          )}
          <div className="ro-stat-list">
            <div className="ro-stat ro-stat-big">
              <span>{t.basic.rawPdef}</span>
              <strong>{fmt(results.rawPdef)}</strong>
            </div>
            <div className="ro-stat ro-stat-big">
              <span>{t.basic.rawMdef}</span>
              <strong>{fmt(results.rawMdef)}</strong>
            </div>
            <div className="ro-stat">
              <span>{t.basic.total}</span>
              <strong>{fmt(results.totalRawDefense)}</strong>
            </div>
          </div>
          <ShareButton text={formatShareText(results.rawPdef, results.rawMdef)} />
          <TierPanel tier={tier} total={results.totalRawDefense} />
          <div className="ro-stat-list ro-stat-list-inline">
            <div className="ro-stat">
              <span>{t.basic.pdmg}</span>
              <strong>{formatPercent(results.pdmgReduction, 2, locale)}</strong>
            </div>
            <div className="ro-stat">
              <span>{t.basic.mdmg}</span>
              <strong>{formatPercent(results.mdmgReduction, 2, locale)}</strong>
            </div>
          </div>
        </RoWindow>
      </div>

      <RoWindow title={t.windows.tracking} aside={t.tracking.count(history.entries.length)}>
        <p className="ro-help" style={{ marginBottom: 8 }}>
          {t.tracking.help}
        </p>
        <div className="ro-chart-grid">
          <TrendChart title={t.tracking.rawPdef} points={points} series={[{ key: 'rawPdef', name: t.tracking.rawPdef }]} />
          <TrendChart title={t.tracking.rawMdef} points={points} series={[{ key: 'rawMdef', name: t.tracking.rawMdef }]} />
        </div>
      </RoWindow>

      {history.entries.length > 0 && (
        <RoWindow title={t.windows.snapshots} aside={`${history.entries.length} / ${history.max}`}>
          <HistoryTable
            entries={history.entries}
            columns={historyColumns}
            onRemove={history.remove}
            onClear={history.clear}
            onLoad={(index) => setInputs(history.entries[index].data)}
          />
        </RoWindow>
      )}
    </>
  );
}
