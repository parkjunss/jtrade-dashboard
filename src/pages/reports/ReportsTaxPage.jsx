import { useMemo, useState } from 'react';
import { Download, FileText, Filter, ReceiptText, Search } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getTaxReportsData } from '../../data/mock/selectors';
import { MiniFileIcon, ReportDropdown } from './ReportPageShared.jsx';

const taxReportsData = getTaxReportsData();

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

export default function ReportsTaxPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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
