export function formatPercent(value) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatCurrency(value) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toLocaleString('en-US')}`;
}

export function RollingLine({ values }) {
  const width = 640;
  const height = 180;
  const min = Math.min(...values, 0);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="returns-line-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2={width} y1={32 + line * 40} y2={32 + line * 40} />)}
      <polyline points={points} />
      <circle cx={width} cy={points.split(' ').at(-1).split(',')[1]} r="5" />
    </svg>
  );
}

export function BenchmarkLine({ portfolio, benchmark }) {
  const width = 760;
  const height = 220;
  const values = [...portfolio, ...benchmark];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const toPoints = (series) => series.map((value, index) => {
    const x = (index / (series.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 24) - 12;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="benchmark-line-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Portfolio vs benchmark line chart">
      {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2={width} y1={36 + line * 44} y2={36 + line * 44} />)}
      <polyline className="portfolio-line" points={toPoints(portfolio)} />
      <polyline className="market-line" points={toPoints(benchmark)} />
    </svg>
  );
}

export function DrawdownArea({ values }) {
  const width = 760;
  const height = 220;
  const min = Math.min(...values);
  const max = 0;
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = ((max - value) / range) * (height - 24) + 12;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,12 ${points} ${width},12`;

  return (
    <svg className="drawdown-area-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Drawdown underwater chart">
      {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2={width} y1={24 + line * 44} y2={24 + line * 44} />)}
      <polygon points={areaPoints} />
      <polyline points={points} />
    </svg>
  );
}
