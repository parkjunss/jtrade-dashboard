export default function Sparkline({ data, className = '', width = 150, height = 44, strokeWidth = 3 }) {
  const inset = 7;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const coordinates = data.map((v, i) => {
    const x = inset + (i / (data.length - 1)) * (width - inset * 2);
    const y = height - inset - ((v - min) / range) * (height - inset * 2);
    return [x, y];
  });
  const points = coordinates.map(([x, y]) => `${x},${y}`).join(' ');
  const [lastX, lastY] = coordinates.at(-1);

  return (
    <svg className={`sparkline ${className}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="4" fill="white" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
