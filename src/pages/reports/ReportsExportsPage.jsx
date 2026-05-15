import { useMemo, useState } from 'react';
import { Download, FileText, Filter, RefreshCw, Search, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getReportExports, getScheduledExports } from '../../data/mock/selectors';
import { ReportDropdown } from './ReportPageShared.jsx';

export default function ReportsExportsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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
