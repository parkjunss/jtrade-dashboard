import { useMemo, useState } from 'react';
import { ArrowDownUp, Download, FileText, Gauge, ShieldAlert } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import MoverCard from '../components/MoverCard.jsx';
import IndexCard from '../components/IndexCard.jsx';
import PortfolioChartCard from '../components/PortfolioChartCard.jsx';
import MarketSnapshot from '../components/MarketSnapshot.jsx';
import Watchlist from '../components/Watchlist.jsx';
import StatBar from '../components/StatBar.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../services/appActions';
import { getPerformanceBenchmarkData, getPerformanceDrawdownData, getPerformanceOverviewData, getPerformanceReturnsData, getTickerStrip } from '../data/mock/selectors';

const tickerStrip = getTickerStrip();
const { movers, portfolioSeries, marketSeries, performance, sp500, marketSnapshot, watchlist, stats } = getPerformanceOverviewData();
const rangeOptions = ['MTD', '1M', '3M', 'YTD', '1Y', '3Y', 'All'];
const performanceReturnsData = getPerformanceReturnsData();
const returnSummaryByRange = performanceReturnsData.summaryByRange;
const attributionData = performanceReturnsData.attribution;
const rollingReturns = performanceReturnsData.rollingReturns;
const monthlyReturns = performanceReturnsData.monthlyReturns;
const heatmapMonths = performanceReturnsData.heatmapMonths;
const performanceBenchmarkData = getPerformanceBenchmarkData();
const performanceDrawdownData = getPerformanceDrawdownData();

function formatPercent(value) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatCurrency(value) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toLocaleString('en-US')}`;
}

function RollingLine({ values }) {
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

function BenchmarkLine({ portfolio, benchmark }) {
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

function DrawdownArea({ values }) {
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

function PerformanceDrawdownPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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

function PerformanceBenchmarkPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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

function PerformanceReturnsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [range, setRange] = useState('YTD');
  const [attributionMode, setAttributionMode] = useState('holding');
  const [sort, setSort] = useState({ key: 'period', direction: 'asc' });
  const summary = returnSummaryByRange[range];
  const attributionRows = attributionData[attributionMode];
  const maxContribution = Math.max(...attributionRows.map((row) => Math.abs(row.contribution)));

  const getStatusClass = (value) => {
    const numericValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
    if (numericValue > 0) return 'text-green';
    if (numericValue < 0) return 'text-red';
    return '';
  };

  const sortedRows = useMemo(() => {
    return [...monthlyReturns].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];
      const direction = sort.direction === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      return String(aValue).localeCompare(String(bValue)) * direction;
    });
  }, [sort]);

  const changeSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const exportRows = sortedRows.map((row) => ({
    Period: row.period,
    Portfolio: formatPercent(row.portfolio),
    Benchmark: formatPercent(row.benchmark),
    Excess: formatPercent(row.excess),
    Contribution: formatCurrency(row.contribution),
  }));

  const exportReturns = (type) => runAction(APP_ACTIONS.DOWNLOAD_REPORT, {
    reportName: `Performance Returns ${range}`,
    type,
    rows: type === 'CSV' ? exportRows : undefined,
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard performance-returns-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />
        <section className="title-row">
          <h1>Returns</h1>
          <div className="market-brief"><span></span><b>Performance</b><p>Period returns, attribution, and rolling trends</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="returns-toolbar card">
          <div className="returns-range-tabs" aria-label="Return time range">
            {rangeOptions.map((option) => (
              <button className={range === option ? 'active' : ''} key={option} onClick={() => setRange(option)} type="button">
                {option}
              </button>
            ))}
          </div>
          <div className="returns-actions">
            <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => exportReturns('CSV')} type="button"><Download size={16} />CSV</button>
            <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => exportReturns('PDF')} type="button"><FileText size={16} />PDF</button>
          </div>
        </section>

        <section className="returns-kpi-grid">
          <article className="card returns-kpi">
            <span>Total return</span>
            <strong className={getStatusClass(summary.total)}>{summary.total}</strong>
            <small>{range} portfolio performance</small>
          </article>

          <article className="card returns-kpi">
            <span>Annualized return</span>
            <strong className={getStatusClass(summary.annualized)}>{summary.annualized}</strong>
            <small>Geometric annualized pace</small>
          </article>

          <article className="card returns-kpi">
            <span>YTD return</span>
            <strong className={getStatusClass(summary.ytd)}>{summary.ytd}</strong>
            <small>Calendar-year return</small>
          </article>

          <article className="card returns-kpi">
            <span>Best / worst month</span>
            <strong className={getStatusClass(summary.best)}>{summary.best}</strong>
            <small className={getStatusClass(summary.worst)}>{summary.worst}</small>
            </article>
        </section>

        <section className="returns-main-grid">
          <article className="card returns-attribution-card">
            <div className="returns-card-head">
              <div><h3>Return Attribution</h3><p>Contribution by selected grouping</p></div>
              <div className="returns-segmented">
                {[
                  ['holding', 'Holding'],
                  ['sector', 'Sector'],
                  ['asset', 'Asset class'],
                ].map(([value, label]) => (
                  <button className={attributionMode === value ? 'active' : ''} key={value} onClick={() => setAttributionMode(value)} type="button">
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="contribution-chart">
              {attributionRows.map((row) => (
                <div className="contribution-row" key={row.name}>
                  <span>{row.name}</span>
                  <div className="contribution-track">
                    <i className={row.contribution < 0 ? 'negative' : ''} style={{ width: `${Math.max(10, (Math.abs(row.contribution) / maxContribution) * 100)}%` }} />
                  </div>
                  <b className={row.contribution < 0 ? 'down' : 'up'}>{formatPercent(row.contribution)}</b>
                  <small>{formatPercent(row.return)} return / {row.weight.toFixed(1)}% weight</small>
                </div>
              ))}
            </div>
          </article>

          <article className="card rolling-card">
            <div className="returns-card-head">
              <div><h3>Rolling Return</h3><p>Cumulative return path for {range}</p></div>
              <strong>{summary.total}</strong>
            </div>
            <RollingLine values={rollingReturns[range]} />
            <div className="returns-chart-axis"><span>Start</span><span>Midpoint</span><span>Latest</span></div>
          </article>
        </section>

        <section className="returns-lower-grid">
          <article className="card monthly-table-card">
            <div className="returns-card-head">
              <div><h3>Monthly / Quarterly Returns</h3><p>Sortable period return ledger</p></div>
            </div>
            <div className="returns-table">
              <div className="returns-table-head">
                {[
                  ['period', 'Period'],
                  ['portfolio', 'Portfolio'],
                  ['benchmark', 'Benchmark'],
                  ['excess', 'Excess'],
                  ['contribution', 'Contribution'],
                ].map(([key, label]) => (
                  <button key={key} onClick={() => changeSort(key)} type="button">
                    {label} <ArrowDownUp size={13} />
                  </button>
                ))}
              </div>
              {sortedRows.map((row) => (
                <div className="returns-table-row" key={row.period}>
                  <span>{row.period}</span>
                  <b className={row.portfolio < 0 ? 'down' : 'up'}>{formatPercent(row.portfolio)}</b>
                  <span>{formatPercent(row.benchmark)}</span>
                  <b className={row.excess < 0 ? 'down' : 'up'}>{formatPercent(row.excess)}</b>
                  <strong className={row.contribution < 0 ? 'down' : 'up'}>{formatCurrency(row.contribution)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="card heatmap-card">
            <div className="returns-card-head">
              <div><h3>Monthly Heatmap</h3><p>Return intensity by month</p></div>
            </div>
            <div className="returns-heatmap">
              {heatmapMonths.map(([month, value]) => (
                <div className={value < 0 ? 'negative' : ''} key={month}>
                  <span>{month}</span>
                  <b>{formatPercent(value)}</b>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default function PerformancePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  if (activeSidebarItem === 'performance-returns') {
    return <PerformanceReturnsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'performance-benchmark') {
    return <PerformanceBenchmarkPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'performance-drawdown') {
    return <PerformanceDrawdownPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem !== 'performance-overview') {
    return <SubPageShell activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} fallbackTitle="Performance" />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard">
        <TopBar activePage={activePage} onNavigate={onNavigate} />
        <section className="title-row">
          <h1>Dashboard</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="top-grid">
          <MoverCard data={movers.gainers} type="gain" />
          <MoverCard data={movers.losers} type="loss" />
          <IndexCard data={sp500} />
        </section>

        <section className="main-grid">
          <div className="left-stack">
            <PortfolioChartCard performance={performance} portfolioSeries={portfolioSeries} marketSeries={marketSeries} />
            <StatBar items={stats} />
          </div>
          <div className="right-stack">
            <MarketSnapshot rows={marketSnapshot} />
            <Watchlist rows={watchlist} />
          </div>
        </section>
      </main>
    </div>
  );
}
