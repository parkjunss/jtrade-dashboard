import { useMemo, useState } from 'react';
import { ArrowDownUp, Download, FileText } from 'lucide-react';
import { tickerStrip, movers, portfolioSeries, marketSeries, performance, sp500, marketSnapshot, watchlist, stats } from '../data/mockData';
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

const rangeOptions = ['MTD', '1M', '3M', 'YTD', '1Y', '3Y', 'All'];

const returnSummaryByRange = {
  MTD: { total: '+2.34%', annualized: '+14.80%', ytd: '+18.35%', best: 'May +4.20%', worst: 'Apr -1.15%' },
  '1M': { total: '+4.18%', annualized: '+16.10%', ytd: '+18.35%', best: 'May +4.20%', worst: 'Apr -1.15%' },
  '3M': { total: '+9.72%', annualized: '+17.90%', ytd: '+18.35%', best: 'Mar +5.10%', worst: 'Apr -1.15%' },
  YTD: { total: '+18.35%', annualized: '+18.35%', ytd: '+18.35%', best: 'Mar +5.10%', worst: 'Apr -1.15%' },
  '1Y': { total: '+29.20%', annualized: '+29.20%', ytd: '+18.35%', best: 'Nov +6.18%', worst: 'Sep -2.42%' },
  '3Y': { total: '+64.80%', annualized: '+18.10%', ytd: '+18.35%', best: 'Nov 2023 +6.18%', worst: 'Sep 2022 -5.34%' },
  All: { total: '+91.45%', annualized: '+16.75%', ytd: '+18.35%', best: 'Nov 2023 +6.18%', worst: 'Mar 2020 -8.64%' },
};

const attributionData = {
  holding: [
    { name: 'NVDA', contribution: 5.4, return: 18.6, weight: 12.8 },
    { name: 'MSFT', contribution: 3.2, return: 9.4, weight: 10.1 },
    { name: 'AMZN', contribution: 2.7, return: 11.8, weight: 8.6 },
    { name: 'GOOG', contribution: 1.9, return: 7.2, weight: 7.4 },
    { name: 'Cash drag', contribution: -0.4, return: 0.7, weight: 3.2 },
  ],
  sector: [
    { name: 'Technology', contribution: 6.8, return: 14.9, weight: 34.5 },
    { name: 'Communication', contribution: 2.6, return: 8.8, weight: 13.4 },
    { name: 'Consumer Discretionary', contribution: 2.2, return: 10.7, weight: 11.2 },
    { name: 'Healthcare', contribution: 0.9, return: 3.5, weight: 8.1 },
    { name: 'Utilities', contribution: -0.5, return: -1.9, weight: 4.8 },
  ],
  asset: [
    { name: 'U.S. Equity', contribution: 9.2, return: 13.8, weight: 68.0 },
    { name: 'International Equity', contribution: 1.7, return: 6.4, weight: 14.5 },
    { name: 'Fixed Income', contribution: 0.6, return: 2.1, weight: 8.2 },
    { name: 'Alternatives', contribution: 0.4, return: 3.8, weight: 4.1 },
    { name: 'Cash', contribution: -0.2, return: 0.6, weight: 5.2 },
  ],
};

const rollingReturns = {
  MTD: [0.3, 0.6, 0.9, 1.4, 1.2, 1.8, 2.1, 2.34],
  '1M': [0.4, 0.9, 1.7, 2.1, 2.7, 3.2, 3.8, 4.18],
  '3M': [1.2, 2.4, 2.1, 3.8, 4.6, 5.7, 7.9, 9.72],
  YTD: [1.8, 4.1, 9.4, 8.2, 12.4, 15.1, 16.9, 18.35],
  '1Y': [2.1, 5.4, 7.9, 11.2, 15.8, 18.4, 24.9, 29.2],
  '3Y': [4, 8, 15, 21, 29, 38, 51, 64.8],
  All: [0, 12, 20, 31, 44, 52, 73, 91.45],
};

const monthlyReturns = [
  { period: 'Jan 2026', portfolio: 3.42, benchmark: 2.18, excess: 1.24, contribution: 14520 },
  { period: 'Feb 2026', portfolio: 4.86, benchmark: 3.02, excess: 1.84, contribution: 20840 },
  { period: 'Mar 2026', portfolio: 5.1, benchmark: 4.2, excess: 0.9, contribution: 21970 },
  { period: 'Apr 2026', portfolio: -1.15, benchmark: -0.62, excess: -0.53, contribution: -4860 },
  { period: 'May 2026', portfolio: 4.2, benchmark: 2.7, excess: 1.5, contribution: 17890 },
  { period: 'Q1 2026', portfolio: 13.92, benchmark: 9.64, excess: 4.28, contribution: 57330 },
  { period: 'Q2 2026', portfolio: 3.0, benchmark: 2.06, excess: 0.94, contribution: 13030 },
];

const heatmapMonths = [
  ['Jan', 3.4], ['Feb', 4.9], ['Mar', 5.1], ['Apr', -1.2],
  ['May', 4.2], ['Jun', 2.0], ['Jul', 3.6], ['Aug', 1.4],
  ['Sep', -2.4], ['Oct', 2.8], ['Nov', 6.2], ['Dec', 3.1],
];

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

function PerformanceReturnsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [range, setRange] = useState('YTD');
  const [attributionMode, setAttributionMode] = useState('holding');
  const [sort, setSort] = useState({ key: 'period', direction: 'asc' });
  const summary = returnSummaryByRange[range];
  const attributionRows = attributionData[attributionMode];
  const maxContribution = Math.max(...attributionRows.map((row) => Math.abs(row.contribution)));
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
          <article className="card returns-kpi"><span>Total return</span><strong>{summary.total}</strong><small>{range} portfolio performance</small></article>
          <article className="card returns-kpi"><span>Annualized return</span><strong>{summary.annualized}</strong><small>Geometric annualized pace</small></article>
          <article className="card returns-kpi"><span>YTD return</span><strong>{summary.ytd}</strong><small>Calendar-year return</small></article>
          <article className="card returns-kpi"><span>Best / worst month</span><strong>{summary.best}</strong><small>{summary.worst}</small></article>
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
