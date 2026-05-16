import { useState } from 'react';
import { Gauge } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { getPerformanceBenchmarkData, getTickerStrip } from '../../data/mock/selectors';
import { BenchmarkLine, formatPercent } from './PerformancePageShared.jsx';

const tickerStrip = getTickerStrip();
const performanceBenchmarkData = getPerformanceBenchmarkData();

export default function PerformanceBenchmarkPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const [benchmarkId, setBenchmarkId] = useState('SP500');
  const selectedBenchmark = performanceBenchmarkData.benchmarks.find((item) => item.id === benchmarkId) ?? performanceBenchmarkData.benchmarks[0];
  const benchmarkSeries = performanceBenchmarkData.benchmarkSeries[selectedBenchmark.id];
  const excessReturn = performanceBenchmarkData.portfolioReturn - selectedBenchmark.return;
  const maxContribution = Math.max(...performanceBenchmarkData.contributors.map((row) => Math.abs(row.contribution)));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard performance-returns-page performance-benchmark-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />
        <section className="title-row">
          <h1>Benchmark</h1>
          <div className="market-brief truncate"><span></span><b>Performance</b><p>Relative return, tracking risk, and active positioning</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="returns-toolbar card">
          <div className="returns-range-tabs" aria-label="Benchmark selector">
            {performanceBenchmarkData.benchmarks.map((item) => (
              <button className={benchmarkId === item.id ? 'active' : ''} key={item.id} onClick={() => setBenchmarkId(item.id)} type="button">
                {item.name}
              </button>
            ))}
          </div>
          <div className="benchmark-selected"><Gauge size={18} /><span>{selectedBenchmark.type}</span></div>
        </section>

        <section className="returns-kpi-grid">
          <article className="card returns-kpi"><span>Portfolio return</span><strong className="text-green">{formatPercent(performanceBenchmarkData.portfolioReturn)}</strong><small>Trailing 12 months</small></article>
          <article className="card returns-kpi"><span>{selectedBenchmark.name}</span><strong className="text-green">{formatPercent(selectedBenchmark.return)}</strong><small>Benchmark return</small></article>
          <article className="card returns-kpi"><span>Excess return</span><strong className={excessReturn >= 0 ? 'text-green' : 'text-red'}>{formatPercent(excessReturn)}</strong><small>Portfolio minus benchmark</small></article>
          <article className="card returns-kpi"><span>Information ratio</span><strong>{selectedBenchmark.informationRatio.toFixed(2)}</strong><small>Active return per tracking risk</small></article>
        </section>

        <section className="benchmark-main-grid">
          <article className="card benchmark-chart-card">
            <div className="returns-card-head">
              <div><h3>Relative Performance</h3><p>Indexed growth of $100 against {selectedBenchmark.name}</p></div>
              <div className="benchmark-legend"><span className="green-dot-solid" />Portfolio <span className="gray-dot-solid" />{selectedBenchmark.name}</div>
            </div>
            <BenchmarkLine portfolio={performanceBenchmarkData.portfolioSeries} benchmark={benchmarkSeries} />
            <div className="returns-chart-axis"><span>Start</span><span>Midpoint</span><span>Latest</span></div>
          </article>

          <aside className="card benchmark-risk-card">
            <div className="returns-card-head"><div><h3>Risk Relationship</h3><p>Fit and active risk versus selected benchmark</p></div></div>
            {[
              ['Tracking error', `${selectedBenchmark.trackingError.toFixed(1)}%`],
              ['Correlation', selectedBenchmark.correlation.toFixed(2)],
              ['Beta', selectedBenchmark.beta.toFixed(2)],
              ['Alpha', formatPercent(selectedBenchmark.alpha)],
              ['Active share', `${selectedBenchmark.activeShare}%`],
            ].map(([label, value]) => (
              <div className="benchmark-risk-row" key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </aside>
        </section>

        <section className="benchmark-lower-grid">
          <article className="card monthly-table-card">
            <div className="returns-card-head"><div><h3>Relative Return Ledger</h3><p>Monthly excess return against selected benchmark model</p></div></div>
            <div className="benchmark-table">
              <div className="benchmark-table-head"><span>Period</span><span>Portfolio</span><span>Benchmark</span><span>Excess</span></div>
              {performanceBenchmarkData.relativeRows.map((row) => (
                <div className="benchmark-table-row" key={row.period}>
                  <strong>{row.period}</strong>
                  <span>{formatPercent(row.portfolio)}</span>
                  <span>{formatPercent(row.benchmark)}</span>
                  <b className={row.excess >= 0 ? 'up' : 'down'}>{formatPercent(row.excess)}</b>
                </div>
              ))}
            </div>
          </article>

          <article className="card benchmark-active-card">
            <div className="returns-card-head"><div><h3>Active Contributors</h3><p>Position and allocation effects versus benchmark</p></div></div>
            <div className="contribution-chart">
              {performanceBenchmarkData.contributors.map((row) => (
                <div className="contribution-row benchmark-contribution-row" key={row.name}>
                  <span>{row.name}</span>
                  <div className="contribution-track">
                    <i className={row.contribution < 0 ? 'negative' : ''} style={{ width: `${Math.max(10, (Math.abs(row.contribution) / maxContribution) * 100)}%` }} />
                  </div>
                  <b className={row.contribution < 0 ? 'down' : 'up'}>{formatPercent(row.contribution)}</b>
                  <small>{row.weight.toFixed(1)}% portfolio / {row.benchmarkWeight.toFixed(1)}% benchmark</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
