export default function MoverCard({ data, type }) {
  const isLoss = type === 'loss';
  return (
    <article className={`card mover-card ${isLoss ? 'loss-card' : 'gain-card'}`}>
      <p className={`section-label ${isLoss ? 'red' : 'green'}`}>{data.badge}</p>
      <div className="mover-main">
        <div className={`company-logo ${data.logo}`}>{data.logo === 'ms' ? <span /> : data.logo}</div>
        <div><h3>{data.name}</h3><small>{data.symbol}</small></div>
      </div>
      <p className="muted">{data.volume}</p>
      <div className="mover-footer"><div><strong>{data.value}</strong><p>Overall market sentiment and performance.</p></div><em className={`change-pill ${isLoss ? 'down' : 'up'}`}>{data.change}⌁</em></div>
    </article>
  );
}
