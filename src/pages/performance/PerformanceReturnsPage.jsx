import { useMemo, useState } from 'react';
import { ArrowDownUp, Download, FileText } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getPerformanceReturnsData, getTickerStrip } from '../../data/mock/selectors';
import { formatCurrency, formatPercent, RollingLine } from './PerformancePageShared.jsx';

const tickerStrip = getTickerStrip();
const rangeOptions = ['MTD', '1M', '3M', 'YTD', '1Y', '3Y', 'All'];
const performanceReturnsData = getPerformanceReturnsData();
const returnSummaryByRange = performanceReturnsData.summaryByRange;
const attributionData = performanceReturnsData.attribution;
const rollingReturns = performanceReturnsData.rollingReturns;
const monthlyReturns = performanceReturnsData.monthlyReturns;
const heatmapMonths = performanceReturnsData.heatmapMonths;

export default function PerformanceReturnsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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
