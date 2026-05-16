export function MetricTile({ icon: Icon, label, value, sub }) {
  return (
    <article className="allocation-metric card">
      <div className="allocation-metric-icon"><Icon size={25} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </article>
  );
}

export function ProgressRow({ label, value, target, color = 'var(--green)' }) {
  return (
    <div className="allocation-progress-row">
      <span>{label}</span>
      <div className="progress-track">
        <i style={{ width: `${value}%`, background: color }} />
        {target ? <b style={{ width: `${target}%` }} /> : null}
      </div>
      <strong>{value.toFixed ? value.toFixed(1) : value}%</strong>
    </div>
  );
}

