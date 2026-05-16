import { ShieldAlert } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { getPerformanceDrawdownData, getTickerStrip } from '../../data/mock/selectors';
import { DrawdownArea, formatPercent } from './PerformancePageShared.jsx';

const tickerStrip = getTickerStrip();
const performanceDrawdownData = getPerformanceDrawdownData();

export default function PerformanceDrawdownPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const deepestEvent = performanceDrawdownData.events.reduce((deepest, event) => event.depth < deepest.depth ? event : deepest, performanceDrawdownData.events[0]);
  const activeEvent = performanceDrawdownData.events.find((event) => event.status === 'Active');
  const maxImpact = Math.max(...performanceDrawdownData.contributors.map((row) => Math.abs(row.impact)));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard performance-returns-page performance-drawdown-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />
        <section className="title-row">
          <h1>Drawdown</h1>
          <div className="market-brief truncate"><span></span><b>Performance</b><p>Underwater periods, recovery path, and active drawdown drivers</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="returns-kpi-grid">
          <article className="card returns-kpi"><span>Current drawdown</span><strong className="text-red">{formatPercent(performanceDrawdownData.currentDrawdown)}</strong><small>{activeEvent?.days ?? 0} days below high-water mark</small></article>
          <article className="card returns-kpi"><span>Max drawdown</span><strong className="text-red">{formatPercent(performanceDrawdownData.maxDrawdown)}</strong><small>{deepestEvent.start} to {deepestEvent.trough}</small></article>
          <article className="card returns-kpi"><span>Average drawdown</span><strong className="text-red">{formatPercent(performanceDrawdownData.averageDrawdown)}</strong><small>Across tracked drawdown events</small></article>
          <article className="card returns-kpi"><span>Recovery rate</span><strong>{performanceDrawdownData.recoveryRate}</strong><small>Closed drawdowns recovered</small></article>
        </section>

        <section className="drawdown-main-grid">
          <article className="card benchmark-chart-card">
            <div className="returns-card-head">
              <div><h3>Underwater Curve</h3><p>Percent below prior portfolio high-water mark</p></div>
              <div className="benchmark-selected"><ShieldAlert size={18} /><span>Active drawdown {formatPercent(performanceDrawdownData.currentDrawdown)}</span></div>
            </div>
            <DrawdownArea values={performanceDrawdownData.underwaterSeries} />
            <div className="returns-chart-axis"><span>Prior high</span><span>Trough</span><span>Current</span></div>
          </article>

          <aside className="card benchmark-risk-card">
            <div className="returns-card-head"><div><h3>Recovery Snapshot</h3><p>Requirements to regain the prior high</p></div></div>
            {performanceDrawdownData.recoveryPlan.map((row) => (
              <div className="benchmark-risk-row" key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>
            ))}
          </aside>
        </section>

        <section className="drawdown-lower-grid">
          <article className="card monthly-table-card">
            <div className="returns-card-head"><div><h3>Drawdown Events</h3><p>Start, trough, recovery, and duration by event</p></div></div>
            <div className="drawdown-table">
              <div className="drawdown-table-head"><span>Start</span><span>Trough</span><span>Recovered</span><span>Depth</span><span>Days</span><span>Status</span></div>
              {performanceDrawdownData.events.map((event) => (
                <div className="drawdown-table-row" key={`${event.start}-${event.trough}`}>
                  <strong>{event.start}</strong>
                  <span>{event.trough}</span>
                  <span>{event.recovered}</span>
                  <b className="down">{formatPercent(event.depth)}</b>
                  <span>{event.days}</span>
                  <em className={event.status === 'Active' ? 'red' : 'green'}>{event.status}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="card benchmark-active-card">
            <div className="returns-card-head"><div><h3>Current Drawdown Drivers</h3><p>Estimated contribution to the active drawdown</p></div></div>
            <div className="contribution-chart">
              {performanceDrawdownData.contributors.map((row) => (
                <div className="contribution-row benchmark-contribution-row" key={row.name}>
                  <span>{row.name}</span>
                  <div className="contribution-track">
                    <i className={row.impact < 0 ? 'negative' : ''} style={{ width: `${Math.max(10, (Math.abs(row.impact) / maxImpact) * 100)}%` }} />
                  </div>
                  <b className={row.impact < 0 ? 'down' : 'up'}>{formatPercent(row.impact)}</b>
                  <small>{row.note}</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
