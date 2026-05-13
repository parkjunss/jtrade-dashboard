import { BarChart3, Clock3, Download, Filter, LineChart, PieChart, Search, ShieldCheck, SlidersHorizontal, Upload, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import Sparkline from '../components/Sparkline.jsx';
import Modal from '../components/Modal.jsx';
import { tickerStrip } from '../data/mockData';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { downloadFile, serializeCsv } from '../services/downloadUtils.js';
import { APP_ACTIONS } from '../services/appActions';

const summaryCards = [
  { icon: WalletCards, label: 'Total Holdings Value', value: '$422,525.82', sub: 'Across 36 holdings' },
  { icon: LineChart, label: 'Unrealized P/L', value: '+$96,432.18', sub: 'Total unrealized gain', pill: '+29.20%' },
  { icon: BarChart3, label: "Today's Change", value: '+$1,585.79', sub: "Today's total gain", pill: '+0.38%' },
  { icon: WalletCards, label: 'Cash Balance', value: '$24,850.45', sub: 'Available to invest' },
];

const holdingsRows = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', shares: '120', avg: '$820.12', price: '$1,024.32', value: '$122,918.40', weight: '12.44%', return: '+24.91%', day: '+1.85%', logo: 'nv', color: '#7ac943', series: [18, 20, 19, 22, 21, 25, 23, 26] },
  { ticker: 'MSFT', name: 'Microsoft Corp.', shares: '110', avg: '$378.45', price: '$415.62', value: '$45,718.20', weight: '10.82%', return: '+9.82%', day: '+0.92%', logo: 'ms', color: '#00a4ef', series: [16, 18, 17, 20, 19, 22, 21, 24] },
  { ticker: 'AAPL', name: 'Apple Inc.', shares: '100', avg: '$173.25', price: '$191.20', value: '$19,120.00', weight: '4.53%', return: '+10.35%', day: '+0.58%', logo: 'a', color: '#111', series: [15, 16, 17, 16, 19, 18, 21, 22] },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', shares: '70', avg: '$145.30', price: '$176.98', value: '$12,388.60', weight: '2.96%', return: '+21.78%', day: '-0.12%', logo: 'a', color: '#050505', danger: true, series: [22, 20, 21, 18, 19, 17, 20, 19] },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', shares: '60', avg: '$128.70', price: '$163.41', value: '$9,804.60', weight: '2.34%', return: '+26.95%', day: '+0.64%', logo: 'G', color: '#4285f4', series: [14, 15, 17, 16, 20, 19, 22, 24] },
  { ticker: '005930.KS', name: 'Samsung Elec.', shares: '300', avg: '??4,320', price: '??8,100', value: '$8,657.40', weight: '2.08%', return: '+21.42%', day: '+1.24%', logo: 'S', color: '#3157c9', series: [13, 15, 16, 17, 19, 18, 21, 22] },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', shares: '50', avg: '$498.40', price: '$515.36', value: '$25,768.00', weight: '6.12%', return: '+3.40%', day: '+0.29%', logo: 'SPY', color: '#4c85d9', series: [17, 18, 18, 19, 20, 19, 21, 22] },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', shares: '40', avg: '$420.15', price: '$456.71', value: '$18,268.40', weight: '4.33%', return: '+8.70%', day: '+0.71%', logo: 'QQQ', color: '#5d77d8', series: [16, 17, 19, 18, 20, 22, 21, 24] },
  { ticker: 'CASH', name: 'Cash', shares: '-', avg: '-', price: '-', value: '$24,850.45', weight: '5.92%', return: '-', day: '0.00%', logo: '$', color: '#64bf22', flat: true, series: [18, 18, 18, 18, 18, 18, 18, 18] },
];

const positionDetails = {
  NVDA: { account: 'Growth', assetClass: 'Stock', sector: 'Technology', costBasis: '$98,414.40', unrealized: '+$24,504.00', risk: 'High momentum', lots: [['May 12, 2024', '50', '$742.18', '+38.02%'], ['Sep 18, 2024', '40', '$821.46', '+24.69%'], ['Feb 03, 2025', '30', '$944.12', '+8.50%']] },
  MSFT: { account: 'Core', assetClass: 'Stock', sector: 'Technology', costBasis: '$41,629.50', unrealized: '+$4,088.70', risk: 'Core compounder', lots: [['Jan 15, 2024', '60', '$365.20', '+13.80%'], ['Oct 22, 2024', '50', '$394.35', '+5.40%']] },
  AAPL: { account: 'Core', assetClass: 'Stock', sector: 'Technology', costBasis: '$17,325.00', unrealized: '+$1,795.00', risk: 'Moderate', lots: [['Mar 04, 2024', '100', '$173.25', '+10.35%']] },
  AMZN: { account: 'Growth', assetClass: 'Stock', sector: 'Consumer Discretionary', costBasis: '$10,171.00', unrealized: '+$2,217.60', risk: 'Moderate', lots: [['Jul 08, 2024', '70', '$145.30', '+21.78%']] },
  GOOGL: { account: 'Growth', assetClass: 'Stock', sector: 'Communication Services', costBasis: '$7,722.00', unrealized: '+$2,082.60', risk: 'Moderate', lots: [['Apr 19, 2024', '60', '$128.70', '+26.95%']] },
  '005930.KS': { account: 'International', assetClass: 'Stock', sector: 'Technology', costBasis: 'KRW 22,296,000', unrealized: '+$1,526.40', risk: 'FX exposed', lots: [['Nov 11, 2024', '300', 'KRW 74,320', '+21.42%']] },
  SPY: { account: 'Core', assetClass: 'ETF', sector: 'Broad Market', costBasis: '$24,920.00', unrealized: '+$848.00', risk: 'Benchmark anchor', lots: [['Dec 01, 2023', '50', '$498.40', '+3.40%']] },
  QQQ: { account: 'Core', assetClass: 'ETF', sector: 'Technology', costBasis: '$16,806.00', unrealized: '+$1,462.40', risk: 'Growth tilt', lots: [['Aug 26, 2024', '40', '$420.15', '+8.70%']] },
  CASH: { account: 'Cash', assetClass: 'Cash', sector: 'Cash', costBasis: '$24,850.45', unrealized: '$0.00', risk: 'Dry powder', lots: [['Current', '-', '-', '0.00%']] },
};

const positionColumns = [
  { key: 'ticker', label: 'Ticker', width: '118px', required: true },
  { key: 'name', label: 'Company', width: '1.35fr', required: true },
  { key: 'account', label: 'Account', width: '94px' },
  { key: 'assetClass', label: 'Type', width: '76px' },
  { key: 'sector', label: 'Sector', width: '140px' },
  { key: 'shares', label: 'Shares', width: '76px' },
  { key: 'avg', label: 'Avg Cost', width: '96px' },
  { key: 'price', label: 'Price', width: '96px' },
  { key: 'value', label: 'Market Value', width: '126px', required: true },
  { key: 'weight', label: 'Weight', width: '76px' },
  { key: 'unrealized', label: 'Unrealized P/L', width: '112px' },
  { key: 'day', label: 'Day', width: '72px' },
  { key: 'trend', label: 'Trend', width: '92px' },
];

const defaultPositionColumns = positionColumns.map((column) => column.key);

const allocationRows = [
  ['NVIDIA (NVDA)', '12.44%', '$122,918.40', '#47b51e'],
  ['Microsoft (MSFT)', '10.82%', '$45,718.20', '#3478db'],
  ['Apple (AAPL)', '4.53%', '$19,120.00', '#555'],
  ['Samsung Elec.', '2.08%', '$8,657.40', '#8f62d9'],
  ['ETFs', '12.45%', '$44,036.40', '#f7b500'],
  ['Cash', '5.92%', '$24,850.45', '#25b6bd'],
];

const sectorRows = [
  ['Technology', 32.21],
  ['Consumer Discretionary', 13.67],
  ['Communication Services', 10.24],
  ['Financials', 9.45],
  ['Healthcare', 7.18],
  ['Cash', 5.92],
];

const bottomStats = [
  { icon: BarChart3, label: 'Number of Holdings', value: '36', sub: 'vs last month  +3' },
  { icon: PieChart, label: 'Largest Position', value: 'NVDA', sub: '12.44% of portfolio' },
  { icon: WalletCards, label: 'Dividend Yield', value: '2.18%', sub: 'vs benchmark  1.62%' },
  { icon: Clock3, label: 'Avg. Holding Period', value: '14.2 months', sub: 'vs last month  +1.8 mo' },
  { icon: ShieldCheck, label: 'Concentration Score', value: 'Moderate', sub: 'vs benchmark  Moderate' },
];

function HoldingLogo({ row }) {
  return <span className="holding-logo" style={{ background: row.color }}>{row.logo}</span>;
}

function HoldingsStat({ item }) {
  const Icon = item.icon;
  return (
    <article className="card holdings-bottom-stat">
      <div className="holdings-stat-icon"><Icon size={27} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

function getPositionType(row) {
  return positionDetails[row.ticker]?.assetClass ?? 'Stock';
}

function getPositionDetails(row) {
  return positionDetails[row.ticker] ?? positionDetails.NVDA;
}

function getPositionCellValue(row, key) {
  const details = getPositionDetails(row);
  const values = {
    account: details.account,
    assetClass: details.assetClass,
    avg: row.avg,
    day: row.day,
    name: row.name,
    price: row.price,
    sector: details.sector,
    shares: row.shares,
    ticker: row.ticker,
    trend: row.series,
    unrealized: details.unrealized,
    value: row.value,
    weight: row.weight,
  };

  return values[key];
}

function PositionCell({ columnKey, row }) {
  const value = getPositionCellValue(row, columnKey);
  const details = getPositionDetails(row);

  if (columnKey === 'ticker') {
    return <span className="holding-ticker"><HoldingLogo row={row} /><b>{row.ticker}</b></span>;
  }

  if (columnKey === 'value') {
    return <strong>{row.value}</strong>;
  }

  if (columnKey === 'unrealized') {
    return <span className={details.unrealized.startsWith('+') ? 'green' : ''}>{details.unrealized}</span>;
  }

  if (columnKey === 'day') {
    return <span className={row.day.startsWith('-') ? 'red' : 'green'}>{row.day}</span>;
  }

  if (columnKey === 'trend') {
    return <Sparkline data={row.series} danger={row.danger} />;
  }

  return <span>{value}</span>;
}

function PositionsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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

export default function HoldingsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const holdingFilter = useSelection('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [overviewFilters, setOverviewFilters] = useState({ account: 'All', sector: 'All', winnersOnly: false });
  const weightTrendRange = useSelection('6M');
  const selectedRow = useSelection(null);
  const overviewRows = holdingsRows.filter((row) => {
    const details = getPositionDetails(row);
    const typeMap = { Stocks: 'Stock', ETFs: 'ETF', Cash: 'Cash' };
    const matchesType = holdingFilter.isSelected('All') || details.assetClass === typeMap[holdingFilter.value];
    const matchesAccount = overviewFilters.account === 'All' || details.account === overviewFilters.account;
    const matchesSector = overviewFilters.sector === 'All' || details.sector === overviewFilters.sector;
    const matchesReturn = !overviewFilters.winnersOnly || row.return.startsWith('+');
    return matchesType && matchesAccount && matchesSector && matchesReturn;
  });
  const overviewTrendLength = { '1M': 4, '3M': 6, '6M': 8, '1Y': 12 }[weightTrendRange.value] ?? 8;

  if (activeSidebarItem === 'holdings-positions') {
    return <PositionsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem !== 'holdings-overview') {
    return <SubPageShell activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} fallbackTitle="Holdings" />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard holdings-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Holdings</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="holdings-summary-grid">
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

        <section className="holdings-main-grid">
          <div className="holdings-left-stack">
            <article className="card holdings-table-card">
              <div className="holdings-table-head">
                <h3>Portfolio Holdings</h3>
                <div className="holdings-actions">
                  <div className="holdings-search">
                    <Search size={16} />
                    <input type="text" placeholder="Search holdings..." />
                  </div>
                  <button onClick={() => setIsFilterOpen(true)} type="button">
                    <Filter size={16} />Filter
                  </button>
                </div>
              </div>
              <div className="holdings-filter-tabs">
                {['All', 'Stocks', 'ETFs', 'Cash'].map((filter) => (
                  <button className={holdingFilter.isSelected(filter) ? 'active' : ''} key={filter} onClick={() => holdingFilter.select(filter)} type="button">{filter}</button>
                ))}
              </div>
              <div className="holdings-table">
                <div className="holdings-table-row holdings-table-header">
                  <span>Ticker</span><span>Name</span><span>Shares</span><span>Avg Cost</span><span>Price</span><span>Market Value</span><span>Weight</span><span>Return</span><span>Day Change</span><span>Trend</span>
                </div>
                {overviewRows.map((row) => (
                  <div 
                    className={`holdings-table-row clickable ${selectedRow.isSelected(row.ticker) ? 'selected' : ''}`} 
                    key={row.ticker}
                    onClick={() => selectedRow.select(selectedRow.isSelected(row.ticker) ? null : row.ticker)}
                  >
                    <span className="holding-ticker"><HoldingLogo row={row} /><b>{row.ticker}</b></span>
                    <span>{row.name}</span>
                    <span>{row.shares}</span>
                    <span>{row.avg}</span>
                    <span>{row.price}</span>
                    <strong>{row.value}</strong>
                    <span>{row.weight}</span>
                    <span className={row.return.startsWith('+') ? 'green' : ''}>{row.return}</span>
                    <span className={row.day.startsWith('-') ? 'red' : 'green'}>{row.day}</span>
                    <Sparkline data={row.series.slice(-overviewTrendLength)} danger={row.danger} />
                  </div>
                ))}
                <div className="holdings-table-row holdings-total-row">
                  <span />
                  <strong>Total</strong>
                  <span />
                  <span />
                  <span />
                  <strong>$422,525.82</strong>
                  <strong>100.00%</strong>
                  <strong className="green">+29.20%</strong>
                  <strong className="green">+0.38%</strong>
                  <span />
                </div>
              </div>
            </article>

            <article className="card holdings-trend-card">
              <div className="holdings-card-head">
                <h3>Weight Trend by Top Holdings</h3>
                <div className="time-tabs">
                  {['1M', '3M', '6M', '1Y'].map(r => (
                    <button 
                      key={r} 
                      className={weightTrendRange.isSelected(r) ? 'active' : ''} 
                      onClick={() => weightTrendRange.select(r)}
                      type="button"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <svg className="holdings-weight-chart" viewBox="0 0 900 210" role="img" aria-label="Weight trend by top holdings">
                {[40, 80, 120, 160].map((y) => <line key={y} x1="0" x2="900" y1={y} y2={y} />)}
                <polyline className="holdings-line nvda" points={weightTrendRange.isSelected('1M') ? '0,50 300,46 600,40 900,32' : '0,58 90,54 180,56 270,53 360,50 450,48 540,45 630,42 720,38 810,36 900,32'} />
                <polyline className="holdings-line msft" points={weightTrendRange.isSelected('1M') ? '0,80 300,74 600,66 900,58' : '0,88 90,82 180,86 270,80 360,78 450,76 540,72 630,70 720,67 810,62 900,58'} />
                <polyline className="holdings-line apple" points={weightTrendRange.isSelected('1M') ? '0,106 300,102 600,96 900,92' : '0,116 90,112 180,110 270,108 360,106 450,105 540,102 630,100 720,98 810,94 900,92'} />
                <polyline className="holdings-line samsung" points={weightTrendRange.isSelected('1M') ? '0,126 300,124 600,120 900,116' : '0,138 90,134 180,132 270,130 360,128 450,126 540,124 630,122 720,120 810,118 900,116'} />
                <polyline className="holdings-line etf" points={weightTrendRange.isSelected('1M') ? '0,156 300,154 600,152 900,150' : '0,150 90,148 180,152 270,156 360,154 450,156 540,158 630,156 720,154 810,152 900,150'} />
                <polyline className="holdings-line cash" points={weightTrendRange.isSelected('1M') ? '0,170 300,171 600,169 900,168' : '0,170 90,168 180,169 270,166 360,168 450,170 540,169 630,171 720,170 810,169 900,168'} />
              </svg>
            </article>
          </div>

          <aside className="holdings-right-stack">
            <article className="card holdings-allocation-card">
              <h3>Holdings Allocation</h3>
              <div className="holdings-allocation-content">
                <div className="holdings-donut"><strong>$422,525.82</strong><span>Total Value</span></div>
                <div className="holdings-allocation-list">
                  {allocationRows.map(([name, weight, value, color]) => (
                    <div key={name}>
                      <i style={{ background: color }} />
                      <span>{name}</span>
                      <b>{weight}</b>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="card top-movers-card">
              <h3>Top Movers</h3>
              <div className="movers-columns">
                <div>
                  <b className="green">Top Gainers</b>
                  <p><span>NVDA</span><small>NVIDIA Corp.</small><strong>+1.85%</strong></p>
                  <p><span>005930.KS</span><small>Samsung Elec.</small><strong>+1.24%</strong></p>
                  <p><span>MSFT</span><small>Microsoft Corp.</small><strong>+0.92%</strong></p>
                </div>
                <div>
                  <b className="red">Top Losers</b>
                  <p><span>AMZN</span><small>Amazon.com Inc.</small><strong className="red">-0.12%</strong></p>
                  <p><span>TSM</span><small>Taiwan Semi.</small><strong className="red">-0.28%</strong></p>
                  <p><span>LLY</span><small>Eli Lilly & Co.</small><strong className="red">-0.42%</strong></p>
                </div>
              </div>
            </article>

            <article className="card holdings-sector-card">
              <div className="holdings-card-head"><h3>Sector Exposure</h3><span>% of Portfolio</span></div>
              {sectorRows.map(([label, value]) => (
                <div className="holdings-sector-row" key={label}>
                  <span>{label}</span>
                  <div><i style={{ width: `${value * 2.5}%` }} /></div>
                  <strong>{value}%</strong>
                </div>
              ))}
            </article>
          </aside>
        </section>

        <section className="holdings-bottom-grid">
          {bottomStats.map((item) => <HoldingsStat item={item} key={item.label} />)}
        </section>

        <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Holdings">
          <div className="positions-modal-stack">
            <p className="positions-modal-copy">Filter the overview table by account, sector, and return profile.</p>
            <div className="holdings-filter-grid">
              <label><span>Account</span><select value={overviewFilters.account} onChange={(event) => setOverviewFilters((current) => ({ ...current, account: event.target.value }))}>{['All', 'Core', 'Growth', 'International', 'Cash'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span>Sector</span><select value={overviewFilters.sector} onChange={(event) => setOverviewFilters((current) => ({ ...current, sector: event.target.value }))}>{['All', 'Technology', 'Consumer Discretionary', 'Communication Services', 'Broad Market', 'Cash'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="checkbox-filter"><input checked={overviewFilters.winnersOnly} onChange={(event) => setOverviewFilters((current) => ({ ...current, winnersOnly: event.target.checked }))} type="checkbox" /><span>Show positive-return holdings only</span></label>
            </div>
            <div className="modal-action-row">
              <button onClick={() => setOverviewFilters({ account: 'All', sector: 'All', winnersOnly: false })} type="button">Reset</button>
              <button onClick={() => setIsFilterOpen(false)} type="button">Apply</button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
