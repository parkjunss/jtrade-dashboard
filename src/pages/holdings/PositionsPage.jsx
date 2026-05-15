import { Download, Eye, Search, SlidersHorizontal, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import Modal from '../../components/Modal.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { downloadFile, serializeCsv } from '../../services/downloadUtils.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getHoldingsRows, getTickerStrip } from '../../data/mock/selectors';
import { defaultPositionColumns, getPositionDetails, getPositionType, HoldingLogo, PositionCell, positionColumns } from './HoldingPageShared.jsx';

const tickerStrip = getTickerStrip();
const holdingsRows = getHoldingsRows();

export default function PositionsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [activeModal, setActiveModal] = useState(null);
  const [importPreviewReady, setImportPreviewReady] = useState(false);
  const [notesByTicker, setNotesByTicker] = useState({
    NVDA: 'Watch position size after earnings. Trim only if weight moves above 15%.',
  });
  const [query, setQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(defaultPositionColumns);
  const assetFilter = useSelection('All');
  const selectedTicker = useSelection('NVDA');

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return holdingsRows.filter((row) => {
      const type = getPositionType(row);
      const matchesAsset = assetFilter.isSelected('All') || type === assetFilter.value;
      const matchesQuery = !normalizedQuery || `${row.ticker} ${row.name}`.toLowerCase().includes(normalizedQuery);
      return matchesAsset && matchesQuery;
    });
  }, [assetFilter.value, query]);

  const selectedRow = holdingsRows.find((row) => row.ticker === selectedTicker.value) ?? filteredRows[0] ?? holdingsRows[0];
  const selectedDetails = getPositionDetails(selectedRow);
  const selectedColumnConfig = positionColumns.filter((column) => visibleColumns.includes(column.key));
  const positionGridTemplate = selectedColumnConfig.map((column) => column.width).join(' ');
  const currentNote = notesByTicker[selectedRow.ticker] ?? '';
  const exportRows = filteredRows.map((row) => {
    const details = getPositionDetails(row);

    return {
      Ticker: row.ticker,
      Company: row.name,
      Account: details.account,
      Type: details.assetClass,
      Sector: details.sector,
      Shares: row.shares,
      'Avg Cost': row.avg,
      Price: row.price,
      'Market Value': row.value,
      Weight: row.weight,
      'Unrealized P/L': details.unrealized,
      'Day Change': row.day,
      'Total Return': row.return,
    };
  });
  const visibleExportRows = filteredRows.map((row) => Object.fromEntries(
    selectedColumnConfig
      .filter((column) => column.key !== 'trend')
      .map((column) => [column.label, getPositionCellValue(row, column.key)]),
  ));

  const toggleColumn = (columnKey) => {
    const column = positionColumns.find((item) => item.key === columnKey);

    if (column?.required) return;

    setVisibleColumns((current) => (
      current.includes(columnKey)
        ? current.filter((key) => key !== columnKey)
        : [...current, columnKey]
    ));
  };

  const downloadSampleImport = () => {
    const rows = [
      { Ticker: 'NVDA', Shares: '10', 'Avg Cost': '920.00', Account: 'Growth', Date: '2025-05-12' },
      { Ticker: 'MSFT', Shares: '5', 'Avg Cost': '402.50', Account: 'Core', Date: '2025-05-12' },
    ];

    downloadFile({
      content: serializeCsv(Object.keys(rows[0]), rows),
      filename: 'positions-import-sample.csv',
      mimeType: 'text/csv;charset=utf-8',
    });
  };

  const saveTradeNote = async () => {
    await runAction(APP_ACTIONS.VIEW_OPTIONS, { target: 'TradeNoteSaved', symbol: selectedRow.ticker });
    setActiveModal(null);
  };

  const previewImport = async () => {
    setImportPreviewReady(true);
    await runAction(APP_ACTIONS.VIEW_OPTIONS, { target: 'ImportPreview', rows: 2 });
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard holdings-page positions-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Positions</h1>
          <div className="market-brief"><span></span><b>Holdings</b><p>Detailed position table with lots, cost basis, P/L, and exposure.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="positions-summary-grid">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <article className="card holding-summary-card" key={item.label}>
                <div className="holding-summary-icon"><Icon size={28} /></div>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  {item.pill ? <em>{item.pill}</em> : null}
                  <small>{item.sub}</small>
                </div>
              </article>
            );
          })}
        </section>

        <section className="positions-layout">
          <article className="card positions-table-card">
            <div className="holdings-table-head">
              <h3>All Positions</h3>
              <div className="holdings-actions">
                <div className="holdings-search">
                  <Search size={16} />
                  <input onChange={(event) => setQuery(event.target.value)} placeholder="Search ticker or company..." type="text" value={query} />
                </div>
                <button onClick={() => setActiveModal('columns')} type="button"><SlidersHorizontal size={16} />Columns</button>
                <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Positions Export', type: 'CSV', rows: visibleExportRows.length > 0 ? visibleExportRows : exportRows })} type="button"><Download size={16} />Export</button>
              </div>
            </div>

            <div className="holdings-filter-tabs">
              {['All', 'Stock', 'ETF', 'Cash'].map((filter) => (
                <button className={assetFilter.isSelected(filter) ? 'active' : ''} key={filter} onClick={() => assetFilter.select(filter)} type="button">{filter}</button>
              ))}
            </div>

            <div className="positions-table-scroll">
              <div className="positions-table">
                <div className="positions-row positions-header" style={{ gridTemplateColumns: positionGridTemplate }}>
                  {selectedColumnConfig.map((column) => <span key={column.key}>{column.label}</span>)}
                </div>
                {filteredRows.map((row) => {
                  return (
                    <button
                      className={`positions-row clickable ${selectedTicker.isSelected(row.ticker) ? 'selected' : ''}`}
                      key={row.ticker}
                      onClick={() => selectedTicker.select(row.ticker)}
                      style={{ gridTemplateColumns: positionGridTemplate }}
                      type="button"
                    >
                      {selectedColumnConfig.map((column) => <PositionCell columnKey={column.key} key={column.key} row={row} />)}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <aside className="positions-detail-stack">
            <article className="card position-detail-card">
              <div className="position-detail-head">
                <HoldingLogo row={selectedRow} />
                <div>
                  <h3>{selectedRow.ticker}</h3>
                  <span>{selectedRow.name}</span>
                </div>
                <strong>{selectedRow.weight}</strong>
              </div>
              <div className="position-detail-grid">
                <div><span>Market Value</span><b>{selectedRow.value}</b></div>
                <div><span>Cost Basis</span><b>{selectedDetails.costBasis}</b></div>
                <div><span>Unrealized P/L</span><b className={selectedDetails.unrealized.startsWith('+') ? 'green' : ''}>{selectedDetails.unrealized}</b></div>
                <div><span>Return</span><b className={selectedRow.return.startsWith('+') ? 'green' : ''}>{selectedRow.return}</b></div>
                <div><span>Account</span><b>{selectedDetails.account}</b></div>
                <div><span>Risk Tag</span><b>{selectedDetails.risk}</b></div>
              </div>
              <div className="position-detail-actions">
                <button onClick={() => setActiveModal('details')} type="button">View Details</button>
                <button onClick={() => setActiveModal('notes')} type="button">Trade Notes</button>
              </div>
            </article>

            <article className="card position-lots-card">
              <h3>Tax Lots</h3>
              <div className="position-lots-table">
                <div><span>Date</span><span>Shares</span><span>Cost</span><span>Return</span></div>
                {selectedDetails.lots.map(([date, shares, cost, gain]) => (
                  <div key={`${selectedRow.ticker}-${date}`}><b>{date}</b><span>{shares}</span><span>{cost}</span><strong className={gain.startsWith('+') ? 'green' : ''}>{gain}</strong></div>
                ))}
              </div>
            </article>

            <article className="card position-import-card">
              <Upload size={26} />
              <div>
                <h3>Import Positions</h3>
                <p>Use CSV or broker sync later to update lots, shares, and cost basis.</p>
              </div>
              <button onClick={() => { setImportPreviewReady(false); setActiveModal('import'); }} type="button">Import</button>
            </article>
          </aside>
        </section>

        <Modal isOpen={activeModal === 'columns'} onClose={() => setActiveModal(null)} title="Customize Columns">
          <div className="positions-modal-stack">
            <p className="positions-modal-copy">Choose which fields appear in the positions table and export. Required columns stay visible.</p>
            <div className="column-toggle-grid">
              {positionColumns.map((column) => (
                <label className={column.required ? 'required' : ''} key={column.key}>
                  <input checked={visibleColumns.includes(column.key)} disabled={column.required} onChange={() => toggleColumn(column.key)} type="checkbox" />
                  <span>{column.label}</span>
                  {column.required ? <em>Required</em> : null}
                </label>
              ))}
            </div>
            <div className="modal-action-row">
              <button onClick={() => setVisibleColumns(defaultPositionColumns)} type="button">Reset</button>
              <button onClick={() => setActiveModal(null)} type="button">Done</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'details'} onClose={() => setActiveModal(null)} title={`${selectedRow.ticker} Position Details`}>
          <div className="position-detail-modal">
            <div className="position-detail-head compact">
              <HoldingLogo row={selectedRow} />
              <div><h3>{selectedRow.name}</h3><span>{selectedDetails.account} · {selectedDetails.assetClass} · {selectedDetails.sector}</span></div>
              <strong>{selectedRow.weight}</strong>
            </div>
            <div className="position-detail-grid">
              <div><span>Shares</span><b>{selectedRow.shares}</b></div>
              <div><span>Average Cost</span><b>{selectedRow.avg}</b></div>
              <div><span>Current Price</span><b>{selectedRow.price}</b></div>
              <div><span>Market Value</span><b>{selectedRow.value}</b></div>
              <div><span>Cost Basis</span><b>{selectedDetails.costBasis}</b></div>
              <div><span>Risk Tag</span><b>{selectedDetails.risk}</b></div>
            </div>
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'notes'} onClose={() => setActiveModal(null)} title={`${selectedRow.ticker} Trade Notes`}>
          <div className="positions-modal-stack">
            <div className="trade-note-meta">
              <span>{selectedRow.name}</span>
              <strong>Last updated just now</strong>
            </div>
            <textarea
              className="trade-note-input"
              onChange={(event) => setNotesByTicker((current) => ({ ...current, [selectedRow.ticker]: event.target.value }))}
              value={currentNote}
            />
            <div className="note-tag-row">
              {['watch weight', 'earnings', 'rebalance', 'tax lot'].map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <div className="modal-action-row">
              <button onClick={() => setActiveModal(null)} type="button">Cancel</button>
              <button onClick={saveTradeNote} type="button">Save Note</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'import'} onClose={() => setActiveModal(null)} title="Import Positions">
          <div className="positions-modal-stack">
            <p className="positions-modal-copy">Upload flow is mocked for now. Use the sample CSV to match the expected format, then preview the import before applying it later.</p>
            <div className="import-format-grid">
              {['Ticker', 'Shares', 'Avg Cost', 'Account', 'Date'].map((field) => <span key={field}>{field}</span>)}
            </div>
            <div className="import-dropzone">
              <Upload size={28} />
              <b>CSV upload placeholder</b>
              <span>Drag and drop will attach here when file parsing is added.</span>
            </div>
            {importPreviewReady ? (
              <div className="import-preview-table">
                <div><span>Ticker</span><span>Shares</span><span>Avg Cost</span><span>Status</span></div>
                <div><b>NVDA</b><span>10</span><span>$920.00</span><strong>Ready</strong></div>
                <div><b>MSFT</b><span>5</span><span>$402.50</span><strong>Ready</strong></div>
              </div>
            ) : null}
            <div className="modal-action-row">
              <button onClick={downloadSampleImport} type="button">Sample CSV</button>
              <button onClick={previewImport} type="button">Import Preview</button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}


