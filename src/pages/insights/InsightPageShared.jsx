export function InsightMeter({ score = 72, label = 'Positive' }) {
  return (
    <div className="sentiment-meter">
      <svg className="sentiment-gauge" viewBox="0 0 220 130" aria-hidden="true">
        <path className="gauge-bg" d="M 32 106 A 78 78 0 0 1 188 106" />
        <path className="gauge-value" d="M 32 106 A 78 78 0 0 1 166 51" />
      </svg>
      <div className="sentiment-score">
        <strong>{score} <span>/100</span></strong>
        <b>{label}</b>
      </div>
      <small>Sentiment Score</small>
    </div>
  );
}

export function toneClass(tone) {
  return tone === 'Negative' || tone === 'Bearish' || tone === 'Headwind' ? 'red' : tone === 'Positive' || tone === 'Bullish' || tone === 'Tailwind' ? 'green' : 'neutral';
}

export function sentimentPoints(rows, key) {
  return rows.map((row, index) => `${index * 152},${190 - row[key] * 1.7}`).join(' ');
}

export function signalPoints(rows, key) {
  return rows.map((row, index) => `${index * 152},${190 - row[key] * 1.6}`).join(' ');
}
