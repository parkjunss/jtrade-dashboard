export default function TickerStrip({ items }) {
  return (
    <div className="ticker-strip">
      {items.map((item) => (
        <div className="ticker-card" key={item.label}>
          <small>{item.label}</small>
          <strong>{item.value}</strong>
          <em className={item.trend}>
            {item.change}
          </em>
        </div>
      ))}
    </div>
  );
}
