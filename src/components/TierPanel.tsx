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
  const barText = tier.next
    ? `${formatNumber(total)} / ${formatNumber(tier.next.at)}`
    : `${formatNumber(total)} · MAX`;

  return (
    <div className="ro-tier">
      <div className="ro-tier-head">
        <strong className="ro-tier-name" tabIndex={0} aria-describedby={LADDER_ID}>
          {tier.name}
        </strong>
        <span className="ro-tier-hint">hover for all tiers</span>
      </div>
      <Meter label="Tier" progress={tier.progress} text={barText} />
      <p className="ro-help">
        {tier.next ? `Next tier "${tier.next.name}" at ${formatNumber(tier.next.at)} total raw DEF.` : 'Top tier reached.'}
      </p>

      <div className="ro-tier-tip" role="tooltip" id={LADDER_ID}>
        <p className="ro-tier-tip-head">Tiers by total raw DEF (PDEF + MDEF)</p>
        <table>
          <tbody>
            {tierLadder().map((row) => (
              <tr key={row.name} className={row.name === tier.name ? 'current' : undefined}>
                <td>{row.name}</td>
                <td className="num">
                  {row.max === null ? `${formatNumber(row.min)}+` : `${formatNumber(row.min)} – ${formatNumber(row.max)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
