import { Activity, ArrowDownRight, ArrowUpRight, CalendarClock, Globe2, Newspaper, RadioTower } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import { getMarketSnapshot, getScreenerRows, getSp500Index, getTickerStrip } from '../data/mock/selectors';

const tickerStrip = getTickerStrip();
const marketSnapshot = getMarketSnapshot();
const sp500 = getSp500Index();
const screenerRows = getScreenerRows();

const macroRows = [
  ['10Y Treasury', '4.42%', '+5 bp', 'Rates'],
  ['USD/KRW', '1,364.20', '-0.28%', 'FX'],
  ['WTI Crude', '$78.14', '-1.12%', 'Energy'],
  ['Gold', '$2,388.40', '+0.46%', 'Metals'],
];

const breadthRows = [
  ['S&P 500 Advancers', '318', '64% of index'],
  ['52W Highs', '47', '+12 vs prior session'],
  ['VIX', '14.8', 'Volatility contained'],
  ['Put/Call Ratio', '0.82', 'Neutral risk appetite'],
];

const newsRows = [
  ['Fed officials signal a cautious path for rate cuts', 'Macro', '20m ago'],
  ['Semiconductor suppliers lead pre-market strength', 'Equities', '38m ago'],
  ['Oil retreats as inventory data points to softer demand', 'Commodities', '1h ago'],
  ['Korean exports improve on memory-cycle recovery', 'Asia', '2h ago'],
];

function PublicMoverRow({ row }) {
  const isUp = row[3].startsWith('+');

  return (
    <div className="public-mover-row">
      <strong>{row[0]}<small>{row[1]}</small></strong>
      <span>{row[2]}</span>
      <b className={isUp ? 'up' : 'down'}>{row[3]}</b>
      {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
    </div>
  );
}

export default function MarketPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const movers = [...screenerRows]
    .sort((a, b) => Math.abs(Number.parseFloat(b[3])) - Math.abs(Number.parseFloat(a[3])))
    .slice(0, 5);

  return (
    <div className="app-shell">
      <main className="dashboard market-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Markets</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance while breadth improves</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="market-hero-grid">
          <article className="card market-index-card">
            <div className="market-card-head">
              <div><span>US benchmark</span><h2>S&amp;P 500</h2></div>
              <strong className="up">{sp500.change}</strong>
            </div>
            <b>{sp500.value}</b>
            <svg viewBox="0 0 760 260" role="img" aria-label="S&P 500 market trend">
              {[45, 90, 135, 180, 225].map((y) => <line key={y} x1="0" x2="760" y1={y} y2={y} />)}
              <polyline points="0,204 70,190 140,172 210,164 280,135 350,148 420,124 490,112 560,96 630,76 760,58" />
            </svg>
            <div className="market-axis"><span>Open</span><span>Midday</span><span>Latest</span></div>
          </article>

          <article className="card market-brief-card">
            <div className="market-card-head"><div><span>Cross-asset pulse</span><h3>Risk appetite</h3></div><Activity size={22} /></div>
            <strong>Constructive</strong>
            <p>Equities are firm, volatility remains contained, and rates are slightly higher. Leadership is concentrated in technology and semiconductors.</p>
            <div className="market-pulse-list">
              {macroRows.map(([label, value, change, type]) => (
                <div key={label}><span>{type}</span><b>{label}</b><strong>{value}</strong><em className={change.startsWith('+') ? 'up' : 'down'}>{change}</em></div>
              ))}
            </div>
          </article>
        </section>

        <section className="market-grid">
          <article className="card public-market-card">
            <div className="market-card-head"><div><span>Market snapshot</span><h3>Major assets</h3></div><Globe2 size={20} /></div>
            {marketSnapshot.map((row) => (
              <div className="market-snapshot-row" key={row.name}>
                <span>{row.name}</span>
                <strong>{row.value}</strong>
                <b className={row.change.startsWith('+') ? 'up' : 'down'}>{row.change}</b>
              </div>
            ))}
          </article>

          <article className="card public-market-card">
            <div className="market-card-head"><div><span>Breadth</span><h3>Participation</h3></div><RadioTower size={20} /></div>
            {breadthRows.map(([label, value, note]) => (
              <div className="market-snapshot-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </div>
            ))}
          </article>

          <article className="card public-market-card">
            <div className="market-card-head"><div><span>Public movers</span><h3>Largest watch moves</h3></div><Activity size={20} /></div>
            {movers.map((row) => <PublicMoverRow key={row[0]} row={row} />)}
          </article>
        </section>

        <section className="market-bottom-grid">
          <article className="card public-market-card market-news-card">
            <div className="market-card-head"><div><span>Headlines</span><h3>Market news</h3></div><Newspaper size={20} /></div>
            {newsRows.map(([title, tag, time]) => (
              <div className="market-news-row" key={title}>
                <strong>{title}</strong>
                <span>{tag}</span>
                <small>{time}</small>
              </div>
            ))}
          </article>

          <article className="card public-market-card market-calendar-card">
            <div className="market-card-head"><div><span>Calendar</span><h3>Upcoming events</h3></div><CalendarClock size={20} /></div>
            <div><span>Today</span><strong>FOMC speakers</strong><small>Rate path commentary</small></div>
            <div><span>Tomorrow</span><strong>Initial jobless claims</strong><small>Labor-market read-through</small></div>
            <div><span>Friday</span><strong>University of Michigan sentiment</strong><small>Inflation expectations</small></div>
          </article>
        </section>
      </main>
    </div>
  );
}
