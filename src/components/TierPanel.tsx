import { useLocale } from '../i18n/LocaleContext';
import { tierLadder, type TierProgress } from '../lib/defense';
import { formatNumber } from '../lib/format';
import { Meter } from './Field';

interface TierPanelProps {
  tier: TierProgress;
  /** Total raw DEF (PDEF + MDEF) driving the tier. */
  total: number;
}

const LADDER_ID = 'tier-ladder';

/** Big tier title over the tier bar. Hovering (or focusing) the block lists every tier and its range. */
export function TierPanel({ tier, total }: TierPanelProps) {
  const { t, locale } = useLocale();
  const fmt = (value: number) => formatNumber(value, locale);
  const barText = tier.next ? `${fmt(total)} / ${fmt(tier.next.at)}` : `${fmt(total)} · ${t.tier.max}`;

  return (
    <div className="ro-tier">
      <div className="ro-tier-head">
        <strong className="ro-tier-name" tabIndex={0} aria-describedby={LADDER_ID}>
          {t.tier.names[tier.name]}
        </strong>
        <span className="ro-tier-hint">{t.tier.hint}</span>
      </div>
      <Meter label={t.tier.label} progress={tier.progress} text={barText} />
      <p className="ro-help">{tier.next ? t.tier.next(t.tier.names[tier.next.name], fmt(tier.next.at)) : t.tier.top}</p>

      <div className="ro-tier-tip" role="tooltip" id={LADDER_ID}>
        <p className="ro-tier-tip-head">{t.tier.ladderTitle}</p>
        <table>
          <tbody>
            {tierLadder().map((row) => (
              <tr key={row.name} className={row.name === tier.name ? 'current' : undefined}>
                <td>{t.tier.names[row.name]}</td>
                <td className="num">{row.max === null ? `${fmt(row.min)}+` : `${fmt(row.min)} – ${fmt(row.max)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
