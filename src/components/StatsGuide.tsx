const GUIDE_IMAGE = 'https://i.imgur.com/BLa5AOO.gif';

export function StatsGuide() {
  return (
    <section className="stats-guide-card" aria-label="Defense stat input guide">
      <div>
        <p className="stats-guide-eyebrow">Input guide</p>
        <h2>Where to get PDEF/MDEF stats</h2>
        <p>
          Use this sample to find the Equipment PDEF &amp; Equipment MDEF by clicking the PDEF and MDEF in the
          Character Details Tab Genereal Stats.
        </p>
      </div>
      <img src={GUIDE_IMAGE} alt="How to find PDEF and MDEF stats" loading="lazy" />
    </section>
  );
}
