import { CalendarDays, Check, CloudUpload, Database, Download, FileSpreadsheet, FileText, PieChart, ShieldCheck, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import { tickerStrip } from '../data/mockData';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';

const reportCenter = [
  ['Monthly Statement', 'PDF', 'Download', 'red'],
  ['Quarterly Report', 'XLS', 'Download', 'green'],
  ['Annual Summary', 'PDF', 'Download', 'red'],
  ['Tax Document', 'DOC', 'Ready', 'blue'],
];

const monthlyReturns = [2.1, 4.8, 6.3, -1.2, 5.7, 2.9, 3.6, 1.4, -0.8, 4.5, 6.7, 3.2];
const assetContribution = [
  ['NVDA', 24.6],
  ['MSFT', 18.7],
  ['AAPL', 14.2],
  ['Samsung Elec.', 9.8],
  ['SPY', 6.5],
  ['Cash', 2.1],
];

const riskMetrics = [
  ['Sharpe Ratio', '1.42', 'up'],
  ['Sortino Ratio', '1.88', 'up'],
  ['Beta', '0.87', 'neutral'],
  ['Volatility', '12.4%', 'down'],
  ['Alpha', '4.6%', 'up'],
  ['Tracking Error', '5.1%', 'up'],
];

const exportsRows = [
  ['Q1 Portfolio Report', 'Apr 12, 2025', 'PDF', 'Sent'],
  ['Tax Summary 2024', 'Apr 05, 2025', 'PDF', 'Ready'],
  ['March Statement', 'Mar 31, 2025', 'CSV', 'Downloaded'],
  ['Risk Snapshot', 'Mar 25, 2025', 'PDF', 'Sent'],
];

const reportStats = [
  { icon: FileText, label: 'Reports Generated', value: '48', sub: 'vs last month  +12' },
  { icon: CalendarDays, label: 'Scheduled Reports', value: '6', sub: 'Automated deliveries' },
  { icon: CloudUpload, label: 'Last Export', value: 'PDF', sub: 'May 21, 2025 · 02:15 PM' },
  { icon: CalendarDays, label: 'Next Report', value: 'Jun 01', sub: 'Monthly Statement' },
  { icon: Database, label: 'Storage Used', value: '128 MB', sub: 'of 2 GB (6%)' },
];

function ReportStat({ item }) {
  const Icon = item.icon;
  return (
    <article className="card report-stat">
      <div className="report-stat-icon"><Icon size={28} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

function MiniFileIcon({ type, tone }) {
  const Icon = type === 'XLS' ? FileSpreadsheet : FileText;
  return <span className={`report-file-icon ${tone}`}><Icon size={20} /></span>;
}

export default function ReportsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { mockMutations, pendingAction, runAction } = useAppAction();
  const breakdownRange = useSelection('1Y');
  const exportRows = [
    ...mockMutations.exports.map((row) => [row.name, row.date, row.format, row.status]),
    ...exportsRows,
  ];

  if (activeSidebarItem !== 'reports-overview') {
    return <SubPageShell activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} fallbackTitle="Reports" />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard reports-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Reports</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="reports-top-grid">
          <article className="card performance-report-card">
            <div className="report-card-heading">
              <h3>Performance Report</h3>
              <div className="report-doc-badge"><FileText size={28} /></div>
            </div>
            <p>Portfolio Value</p>
            <strong>$422,525.82</strong>
            <small>Comprehensive performance summary as of May 2025</small>
            <div className="report-kpi-row">
              <div><span>YTD Return</span><b className="green">+18.35%</b></div>
              <div><span>Annualized Return</span><b className="green">18.35%</b></div>
              <div><span>Max Drawdown</span><b className="red">-8.42%</b></div>
            </div>
          </article>

          <article className="card report-center-card">
            <div className="report-card-heading">
              <h3>Report Center</h3>
              <small>Updated<br />May 2025</small>
            </div>
            {reportCenter.map(([name, type, status, tone]) => (
              <div className="report-download-row" key={name}>
                <MiniFileIcon type={type} tone={tone} />
                <b>{name}</b>
                <button disabled={pendingAction === 'downloadReport'} onClick={() => runAction('downloadReport', { reportName: name, type })} type="button">{status === 'Ready' ? <Check size={15} /> : <Download size={15} />}{status}</button>
              </div>
            ))}
          </article>

          <article className="card report-distribution-card">
            <h3>Report Distribution</h3>
            <div className="distribution-content">
              <div className="distribution-donut"><strong>48</strong><span>Reports<br />Generated</span></div>
              <div className="distribution-table">
                <div><span>Category</span><span>Reports</span><span>Share</span></div>
                <div><b><i className="green-dot-solid" />Performance</b><strong>18</strong><strong>38%</strong></div>
                <div><b><i className="light-green-dot" />Allocation</b><strong>12</strong><strong>24%</strong></div>
                <div><b><i className="blue-dot" />Risk</b><strong>9</strong><strong>18%</strong></div>
                <div><b><i className="yellow-dot" />Tax</b><strong>9</strong><strong>20%</strong></div>
                <div><b>Total</b><strong>48</strong><strong>100%</strong></div>
              </div>
            </div>
          </article>
        </section>

        <section className="reports-middle-grid">
          <article className="card monthly-return-card">
            <div className="report-card-heading">
              <h3>Monthly Return Breakdown</h3>
              <div className="time-tabs">
                {['1Y', '3Y', 'All'].map(r => (
                  <button 
                    key={r} 
                    className={breakdownRange.isSelected(r) ? 'active' : ''} 
                    onClick={() => breakdownRange.select(r)}
                    type="button"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="monthly-bars">
              {monthlyReturns.map((value, index) => (
                <div className={`monthly-bar ${value < 0 ? 'negative' : 'positive'}`} key={index}>
                  <div className="monthly-bar-track">
                    <i style={{ height: `${Math.abs(value) * 10}px` }} />
                  </div>
                  <b className={value < 0 ? 'red' : ''}>{value}%</b>
                  <span>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card asset-contribution-card">
            <h3>Asset Contribution</h3>
            {assetContribution.map(([name, value]) => (
              <div className="report-progress-row" key={name}>
                <span>{name}</span>
                <div><i style={{ width: `${value * 3.2}%` }} /></div>
                <strong>{value}%</strong>
              </div>
            ))}
          </article>

          <article className="card risk-metrics-card">
            <h3>Risk Metrics</h3>
            {riskMetrics.map(([label, value, trend]) => (
              <div className="risk-row" key={label}>
                <ShieldCheck size={17} />
                <span>{label}</span>
                <strong>{value}</strong>
                <em className={trend}>{trend === 'up' ? '▲' : trend === 'down' ? '▼' : '–'}</em>
              </div>
            ))}
          </article>
        </section>

        <section className="reports-lower-grid">
          <article className="card cumulative-card">
            <h3>Cumulative Performance vs Benchmark</h3>
            <svg className="report-line-chart" viewBox="0 0 760 230" role="img" aria-label="Cumulative performance chart">
              {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" x2="760" y1={y} y2={y} />)}
              <polyline className="portfolio-line" points="0,190 70,160 140,140 210,106 280,94 350,84 420,58 490,66 560,44 630,40 700,30 760,20" />
              <polyline className="market-line" points="0,190 70,178 140,165 210,160 280,142 350,132 420,118 490,110 560,94 630,85 700,72 760,64" />
            </svg>
          </article>

          <article className="card recent-exports-card">
            <h3>Recent Exports</h3>
            <div className="exports-table">
              <div className="exports-head"><span>Report Name</span><span>Date</span><span>Format</span><span>Status</span></div>
              {exportRows.map(([name, date, format, status], index) => (
                <div className="exports-row" key={`${name}-${date}-${index}`}>
                  <b>{name}</b>
                  <span>{date}</span>
                  <span className="format-pill"><FileText size={16} />{format}</span>
                  <strong>{status}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="report-stat-grid">
          {reportStats.map((item) => <ReportStat item={item} key={item.label} />)}
        </section>
      </main>
    </div>
  );
}
