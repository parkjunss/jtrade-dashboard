import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, CloudUpload, Database, Download, FileSpreadsheet, FileText, Filter, ReceiptText, RefreshCw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import StatusState from '../components/StatusState.jsx';
import { APP_ACTIONS } from '../services/appActions';
import { getReportExports, getReportsOverviewData, getScheduledExports, getTaxReportsData, getTickerStrip } from '../data/mock/selectors';

const tickerStrip = getTickerStrip();
const reportIcons = { CalendarDays, CloudUpload, Database, FileText };
const reportsOverview = getReportsOverviewData();
const reportCenter = reportsOverview.reportCenter;

const monthlyReturns = reportsOverview.monthlyReturns;
const assetContribution = reportsOverview.assetContribution;

const riskMetrics = reportsOverview.riskMetrics;
const exportsRows = reportsOverview.exportsRows;
const taxReportsData = getTaxReportsData();

const reportStats = reportsOverview.reportStats.map((item) => ({ ...item, icon: reportIcons[item.icon] }));

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

function ReportDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`dropdown-wrap report-filter-dropdown ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <label>{label}</label>
      <button onClick={() => setIsOpen((current) => !current)} type="button">{value} <ChevronDown size={15} /></button>
      {isOpen ? (
        <div className="dropdown-menu">
          {options.map((option) => (
            <button
              className={`dropdown-item ${value === option ? 'active' : ''}`}
              key={option}
              onClick={(event) => {
                event.stopPropagation();
                onChange(option);
                setIsOpen(false);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TaxSummaryCard({ item }) {
  return (
    <article className={`card tax-summary-card ${item.tone}`}>
      <div className="tax-summary-icon"><ReceiptText size={24} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

function ReportsTaxPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [query, setQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDocId, setSelectedDocId] = useState(taxReportsData.documents[0].id);
  const selectedDoc = taxReportsData.documents.find((row) => row.id === selectedDocId) ?? taxReportsData.documents[0];
  const rows = useMemo(() => {
    return taxReportsData.documents.filter((row) => {
      const matchesQuery = `${row.name} ${row.type} ${row.year}`.toLowerCase().includes(query.toLowerCase());
      const matchesYear = yearFilter === 'All' || row.year === yearFilter;
      const matchesType = typeFilter === 'All' || row.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      return matchesQuery && matchesYear && matchesType && matchesStatus;
    });
  }, [query, statusFilter, typeFilter, yearFilter]);

  const downloadTaxDocument = (row) => runAction(APP_ACTIONS.DOWNLOAD_REPORT, {
    reportName: row.name,
    type: row.format,
    rows: row.format === 'CSV' ? [{ Name: row.name, Year: row.year, Type: row.type, Status: row.status }] : undefined,
  });

  const gainExportRows = taxReportsData.realizedRows.map((row) => ({
    Symbol: row.symbol,
    Term: row.term,
    Proceeds: row.proceeds,
    Cost: row.cost,
    Gain: row.gain,
    Rate: row.rate,
    Note: row.note,
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard reports-page reports-tax-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Tax</h1>
          <div className="page-brief reports-tax-brief">
            <strong>Tax document center</strong>
            <p>Review realized gains, dividends, document packages, and tax-lot actions before filing.</p>
          </div>
        </section>

        <section className="tax-summary-grid">
          {taxReportsData.summary.map((item) => <TaxSummaryCard item={item} key={item.label} />)}
        </section>

        <section className="card tax-filter-card">
          <label className="exports-search"><Search size={16} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Search tax documents..." value={query} /></label>
          <ReportDropdown label="Year" onChange={setYearFilter} options={['All', '2025', '2024', '2023']} value={yearFilter} />
          <ReportDropdown label="Type" onChange={setTypeFilter} options={['All', '1099', 'Realized Gains', 'Dividends']} value={typeFilter} />
          <ReportDropdown label="Status" onChange={setStatusFilter} options={['All', 'Ready', 'Downloaded', 'Sent']} value={statusFilter} />
          <button onClick={() => { setQuery(''); setYearFilter('All'); setTypeFilter('All'); setStatusFilter('All'); }} type="button"><Filter size={16} />Reset</button>
        </section>

        <section className="tax-document-grid">
          <article className="card tax-documents-card">
            <div className="report-card-heading">
              <h3>Tax Documents</h3>
              <small>{rows.length} matching documents</small>
            </div>
            <div className="tax-documents-table">
              <div className="tax-documents-head"><span>Document</span><span>Year</span><span>Type</span><span>Format</span><span>Status</span><span>Date</span><span>Actions</span></div>
              {rows.map((row) => (
                <div className={`tax-documents-row ${selectedDoc.id === row.id ? 'selected' : ''}`} key={row.id} onClick={() => setSelectedDocId(row.id)}>
                  <b>{row.name}<small>{row.size}</small></b>
                  <span>{row.year}</span>
                  <span>{row.type}</span>
                  <span className="format-pill"><FileText size={15} />{row.format}</span>
                  <strong className={row.status.toLowerCase()}>{row.status}</strong>
                  <span>{row.date}</span>
                  <div className="export-row-actions">
                    <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={(event) => { event.stopPropagation(); downloadTaxDocument(row); }} title="Download" type="button"><Download size={15} /></button>
                    <button onClick={(event) => { event.stopPropagation(); runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'TaxDocument', id: row.id }); }} title="Details" type="button"><FileText size={15} /></button>
                  </div>
                </div>
              ))}
              {rows.length === 0 ? <StatusState title="No tax documents found" message="Clear filters or search another year or document type." /> : null}
            </div>
          </article>

          <aside className="tax-detail-stack">
            <article className="card tax-selected-card">
              <div className="report-card-heading">
                <h3>Selected Document</h3>
                <MiniFileIcon type={selectedDoc.format} tone={selectedDoc.format === 'CSV' ? 'green' : 'red'} />
              </div>
              <strong>{selectedDoc.name}</strong>
              <div className="tax-selected-grid">
                <div><span>Year</span><b>{selectedDoc.year}</b></div>
                <div><span>Type</span><b>{selectedDoc.type}</b></div>
                <div><span>Status</span><b>{selectedDoc.status}</b></div>
                <div><span>Size</span><b>{selectedDoc.size}</b></div>
              </div>
              <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => downloadTaxDocument(selectedDoc)} type="button"><Download size={16} />Download</button>
            </article>

            <article className="card tax-actions-card">
              <h3>Tax-Lot Actions</h3>
              {taxReportsData.lots.map((row) => (
                <button key={`${row.symbol}-${row.acquired}`} onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'TaxLot', symbol: row.symbol })} type="button">
                  <strong>{row.symbol}<small>{row.shares} shares - {row.days} days</small></strong>
                  <b className={row.unrealized < 0 ? 'red' : 'green'}>{row.unrealized < 0 ? '-' : '+'}${Math.abs(row.unrealized).toLocaleString('en-US')}</b>
                  <span>{row.action}</span>
                </button>
              ))}
            </article>
          </aside>
        </section>

        <section className="tax-lower-grid">
          <article className="card realized-gains-card">
            <div className="report-card-heading">
              <h3>Realized Gains</h3>
              <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Realized Gains Detail', type: 'CSV', rows: gainExportRows })} type="button"><Download size={16} />Export</button>
            </div>
            <div className="tax-ledger-table">
              <div className="tax-ledger-head"><span>Symbol</span><span>Term</span><span>Proceeds</span><span>Cost</span><span>Gain/Loss</span><span>Rate</span><span>Note</span></div>
              {taxReportsData.realizedRows.map((row) => (
                <div className="tax-ledger-row" key={`${row.symbol}-${row.term}`}>
                  <b>{row.symbol}</b>
                  <span>{row.term}</span>
                  <span>${row.proceeds.toLocaleString('en-US')}</span>
                  <span>${row.cost.toLocaleString('en-US')}</span>
                  <strong className={row.gain < 0 ? 'red' : 'green'}>{row.gain < 0 ? '-' : '+'}${Math.abs(row.gain).toLocaleString('en-US')}</strong>
                  <span>{row.rate}</span>
                  <small>{row.note}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="card dividend-tax-card">
            <h3>Dividend Summary</h3>
            {taxReportsData.dividendRows.map((row) => (
              <div className="dividend-tax-row" key={row.source}>
                <strong>{row.source}<small>{row.payDate}</small></strong>
                <span>Qualified ${row.qualified.toLocaleString('en-US')}</span>
                <span>Ordinary ${row.ordinary.toLocaleString('en-US')}</span>
                <b>{row.foreignTax ? `$${row.foreignTax} foreign tax` : 'No foreign tax'}</b>
              </div>
            ))}
          </article>
        </section>
      </main>
    </div>
  );
}

function ReportsExportsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { mockMutations, pendingAction, runAction } = useAppAction();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [deletedIds, setDeletedIds] = useState([]);
  const [retryIds, setRetryIds] = useState([]);
  const mutationRows = mockMutations.exports.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.name.includes('Tax') ? 'Tax' : row.name.includes('Position') ? 'Holdings' : 'Performance',
    date: row.date,
    format: row.format,
    status: row.status,
    size: row.format === 'CSV' ? '128 KB' : '1.1 MB',
    requestedBy: 'You',
  }));

  const rows = useMemo(() => {
    return [...mutationRows, ...getReportExports()]
      .filter((row) => !deletedIds.includes(row.id))
      .map((row) => retryIds.includes(row.id) ? { ...row, status: 'Ready', size: row.size === '0 KB' ? '940 KB' : row.size } : row)
      .filter((row) => {
        const matchesQuery = `${row.name} ${row.type} ${row.requestedBy}`.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === 'All' || row.type === typeFilter;
        const matchesFormat = formatFilter === 'All' || row.format === formatFilter;
        const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
        const matchesDate = dateFilter === 'All' || row.date.includes(dateFilter);
        return matchesQuery && matchesType && matchesFormat && matchesStatus && matchesDate;
      });
  }, [dateFilter, deletedIds, formatFilter, mutationRows, query, retryIds, statusFilter, typeFilter]);

  const downloadExport = (row) => runAction(APP_ACTIONS.DOWNLOAD_REPORT, {
    reportName: row.name,
    type: row.format,
    rows: row.format === 'CSV' ? [{ Name: row.name, Type: row.type, Date: row.date, Status: row.status }] : undefined,
  });

  const retryExport = (row) => {
    setRetryIds((current) => current.includes(row.id) ? current : [...current, row.id]);
    return runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: row.name, type: row.format });
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard reports-page reports-exports-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Exports</h1>
          <div className="page-brief reports-exports-brief">
            <strong>Export history and scheduled deliveries</strong>
            <p>Filter generated files, retry failed exports, download ready files, or remove stale rows from the local history.</p>
          </div>
        </section>

        <section className="exports-kpi-grid">
          <article className="card export-kpi"><span>Total exports</span><strong>{rows.length}</strong><small>After filters</small></article>
          <article className="card export-kpi"><span>Ready files</span><strong>{rows.filter((row) => row.status === 'Ready').length}</strong><small>Available to download</small></article>
          <article className="card export-kpi"><span>Downloaded</span><strong>{rows.filter((row) => row.status === 'Downloaded').length}</strong><small>Recent local downloads</small></article>
          <article className="card export-kpi"><span>Failed</span><strong>{rows.filter((row) => row.status === 'Failed').length}</strong><small>Need retry</small></article>
        </section>

        <section className="card exports-filter-card">
          <label className="exports-search"><Search size={16} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Search exports..." value={query} /></label>
          <ReportDropdown label="Type" onChange={setTypeFilter} options={['All', 'Performance', 'Tax', 'Statement', 'Risk', 'Allocation', 'Holdings']} value={typeFilter} />
          <ReportDropdown label="Format" onChange={setFormatFilter} options={['All', 'PDF', 'CSV', 'XLS']} value={formatFilter} />
          <ReportDropdown label="Status" onChange={setStatusFilter} options={['All', 'Ready', 'Downloaded', 'Sent', 'Failed']} value={statusFilter} />
          <ReportDropdown label="Date" onChange={setDateFilter} options={['All', 'Apr', 'Mar']} value={dateFilter} />
          <button onClick={() => { setQuery(''); setTypeFilter('All'); setFormatFilter('All'); setStatusFilter('All'); setDateFilter('All'); }} type="button"><Filter size={16} />Reset</button>
        </section>

        <section className="exports-history-grid">
          <article className="card exports-history-card">
            <div className="report-card-heading">
              <h3>Export History</h3>
              <small>{rows.length} matching files</small>
            </div>
            <div className="exports-history-table">
              <div className="exports-history-head"><span>Report Name</span><span>Generated</span><span>Format</span><span>Status</span><span>Size</span><span>Requested By</span><span>Actions</span></div>
              {pendingAction === APP_ACTIONS.DOWNLOAD_REPORT ? <StatusState title="Preparing export" message="The local mock export is being generated." tone="loading" /> : null}
              {rows.map((row) => (
                <div className="exports-history-row" key={row.id}>
                  <b>{row.name}<small>{row.type}</small></b>
                  <span>{row.date}</span>
                  <span className="format-pill"><FileText size={15} />{row.format}</span>
                  <strong className={row.status.toLowerCase()}>{row.status}</strong>
                  <span>{row.size}</span>
                  <span>{row.requestedBy}</span>
                  <div className="export-row-actions">
                    <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => downloadExport(row)} title="Download" type="button"><Download size={15} /></button>
                    <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => retryExport(row)} title="Retry" type="button"><RefreshCw size={15} /></button>
                    <button onClick={() => setDeletedIds((current) => [...current, row.id])} title="Delete" type="button"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
              {rows.length === 0 ? <StatusState title="No exports found" message="Clear filters or search for a different report name." /> : null}
            </div>
          </article>

          <aside className="exports-side-stack">
            <article className="card scheduled-exports-card">
              <h3>Scheduled Exports</h3>
              {getScheduledExports().map(({ name, format, cadence, status }) => (
                <div className="scheduled-export-row" key={name}>
                  <span>{name}</span><b>{format}</b><small>{cadence}</small><strong className={status.toLowerCase()}>{status}</strong>
                </div>
              ))}
            </article>

            <article className="card scheduled-exports-card">
              <h3>Recent Downloads</h3>
              {rows.filter((row) => row.status === 'Downloaded').slice(0, 4).map((row) => (
                <button className="recent-download-row" key={row.id} onClick={() => downloadExport(row)} type="button">
                  <Download size={15} /><span>{row.name}</span><small>{row.date}</small>
                </button>
              ))}
              {rows.filter((row) => row.status === 'Downloaded').length === 0 ? <StatusState title="No recent downloads" message="Downloaded exports will appear here." /> : null}
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default function ReportsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { mockMutations, pendingAction, runAction } = useAppAction();
  const breakdownRange = useSelection('1Y');
  const exportRows = [
    ...mockMutations.exports.map((row) => [row.name, row.date, row.format, row.status]),
    ...exportsRows,
  ];

  if (activeSidebarItem === 'reports-exports') {
    return <ReportsExportsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'reports-tax') {
    return <ReportsTaxPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

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
                <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: name, type })} type="button">{status === 'Ready' ? <Check size={15} /> : <Download size={15} />}{status}</button>
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
                <em className={trend}>{trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Flat'}</em>
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
