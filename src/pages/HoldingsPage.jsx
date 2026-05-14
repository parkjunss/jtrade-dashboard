import { ArrowDownRight, ArrowUpRight, BarChart3, Clock3, Download, Eye, Filter, Layers3, LineChart, PieChart, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Target, Upload, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import Sparkline from '../components/Sparkline.jsx';
import Modal from '../components/Modal.jsx';
import StatusState from '../components/StatusState.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { downloadFile, serializeCsv } from '../services/downloadUtils.js';
import { APP_ACTIONS } from '../services/appActions';
import { getHoldingsAllocationRows, getHoldingsMoverData, getHoldingsPositionDetails, getHoldingsRows, getHoldingsSectorExposureData, getHoldingsSectorRows, getHoldingsSummaryCards, getTickerStrip } from '../data/mock/selectors';

const tickerStrip = getTickerStrip();
const summaryIcons = [WalletCards, LineChart, BarChart3, WalletCards];
const summaryCards = getHoldingsSummaryCards().map((item, index) => ({ ...item, icon: summaryIcons[index] }));
const holdingsRows = getHoldingsRows();
const positionDetails = getHoldingsPositionDetails();

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

const allocationRows = getHoldingsAllocationRows();
const sectorRows = getHoldingsSectorRows();
const moverData = getHoldingsMoverData();
const sectorExposureData = getHoldingsSectorExposureData();

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

function formatSignedMoney(value) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(value));
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}

function MoverSummaryCard({ icon: Icon, label, value, sub, tone = 'neutral' }) {
  return (
    <article className={`card mover-summary-card ${tone}`}>
      <div className="mover-summary-icon"><Icon size={24} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </article>
  );
}

function MoversPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [query, setQuery] = useState('');
  const [selectedTicker, setSelectedTicker] = useState(moverData.impactLeaders[0]?.ticker ?? 'NVDA');
  const directionFilter = useSelection('All');
  const rankingMode = useSelection('Impact');
  const selectedRow = moverData.rows.find((row) => row.ticker === selectedTicker) ?? moverData.impactLeaders[0];
  const normalizedQuery = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const filteredRows = moverData.rows.filter((row) => {
      const matchesDirection = directionFilter.isSelected('All')
        || (directionFilter.isSelected('Gainers') && row.dayPct > 0)
        || (directionFilter.isSelected('Losers') && row.dayPct < 0);
      const matchesQuery = !normalizedQuery || `${row.ticker} ${row.name} ${row.sector}`.toLowerCase().includes(normalizedQuery);
      return matchesDirection && matchesQuery;
    });

    return [...filteredRows].sort((a, b) => {
      if (rankingMode.isSelected('Impact')) return Math.abs(b.portfolioImpact) - Math.abs(a.portfolioImpact);
      return b.dayPct - a.dayPct;
    });
  }, [directionFilter.value, normalizedQuery, rankingMode.value]);
  const topGainer = moverData.gainers[0];
  const topLoser = moverData.losers[0];
  const exportRows = rows.map((row) => ({
    Ticker: row.ticker,
    Company: row.name,
    Sector: row.sector,
    Account: row.account,
    'Day Change': row.day,
    'Portfolio Impact': formatSignedMoney(row.portfolioImpact),
    'Impact %': `${row.impactPct >= 0 ? '+' : ''}${row.impactPct.toFixed(2)}%`,
    'Market Value': row.value,
    Catalyst: row.catalyst,
  }));

  const openDetail = async () => {
    await runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'HoldingMover', symbol: selectedRow.ticker });
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard holdings-page movers-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Movers</h1>
          <div className="market-brief"><span></span><b>Holdings</b><p>Price movers ranked by portfolio impact and session change.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="mover-summary-grid">
          <MoverSummaryCard icon={ArrowUpRight} label="Top Gainer" value={`${topGainer.ticker} ${topGainer.day}`} sub={topGainer.name} tone="gain" />
          <MoverSummaryCard icon={ArrowDownRight} label="Top Loser" value={`${topLoser.ticker} ${topLoser.day}`} sub={topLoser.name} tone="loss" />
          <MoverSummaryCard icon={BarChart3} label="Net Portfolio Impact" value={formatSignedMoney(moverData.netImpact)} sub={`${moverData.breadth} today`} tone={moverData.netImpact >= 0 ? 'gain' : 'loss'} />
          <MoverSummaryCard icon={ShieldCheck} label="Largest Impact" value={`${moverData.impactLeaders[0].ticker} ${formatSignedMoney(moverData.impactLeaders[0].portfolioImpact)}`} sub="Absolute P/L contribution" />
        </section>

        <section className="movers-layout">
          <article className="card movers-table-card">
            <div className="holdings-table-head">
              <h3>Session Movers</h3>
              <div className="holdings-actions">
                <div className="holdings-search">
                  <Search size={16} />
                  <input onChange={(event) => setQuery(event.target.value)} placeholder="Search movers..." type="text" value={query} />
                </div>
                <button disabled={pendingAction === APP_ACTIONS.REFRESH_SNAPSHOT} onClick={() => runAction(APP_ACTIONS.REFRESH_SNAPSHOT, { target: 'HoldingsMovers' })} type="button"><RefreshCw size={16} />Refresh</button>
                <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Holdings Movers', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
              </div>
            </div>

            <div className="movers-toolbar">
              <div className="holdings-filter-tabs">
                {['All', 'Gainers', 'Losers'].map((filter) => (
                  <button className={directionFilter.isSelected(filter) ? 'active' : ''} key={filter} onClick={() => directionFilter.select(filter)} type="button">{filter}</button>
                ))}
              </div>
              <div className="time-tabs">
                {['Impact', 'Price'].map((mode) => (
                  <button className={rankingMode.isSelected(mode) ? 'active' : ''} key={mode} onClick={() => rankingMode.select(mode)} type="button">{mode}</button>
                ))}
              </div>
            </div>

            <div className="movers-table">
              <div className="movers-table-row movers-table-header">
                <span>Ticker</span><span>Name</span><span>Sector</span><span>Day</span><span>Portfolio Impact</span><span>Impact %</span><span>Trend</span>
              </div>
              {rows.map((row) => (
                <button className={`movers-table-row clickable ${selectedRow.ticker === row.ticker ? 'selected' : ''}`} key={row.ticker} onClick={() => setSelectedTicker(row.ticker)} type="button">
                  <span className="holding-ticker"><HoldingLogo row={row} /><b>{row.ticker}</b></span>
                  <span>{row.name}</span>
                  <span>{row.sector}</span>
                  <strong className={row.dayPct < 0 ? 'red' : 'green'}>{row.day}</strong>
                  <strong className={row.portfolioImpact < 0 ? 'red' : 'green'}>{formatSignedMoney(row.portfolioImpact)}</strong>
                  <span className={row.impactPct < 0 ? 'red' : 'green'}>{row.impactPct >= 0 ? '+' : ''}{row.impactPct.toFixed(2)}%</span>
                  <Sparkline data={row.series} danger={row.dayPct < 0} />
                </button>
              ))}
              {rows.length === 0 ? <StatusState title="No movers found" message="Clear the search or switch direction filters." /> : null}
            </div>
          </article>

          <aside className="mover-detail-stack">
            <article className="card mover-detail-card">
              <div className="position-detail-head">
                <HoldingLogo row={selectedRow} />
                <div>
                  <h3>{selectedRow.ticker}</h3>
                  <span>{selectedRow.name}</span>
                </div>
                <strong className={selectedRow.dayPct < 0 ? 'loss-pill' : ''}>{selectedRow.day}</strong>
              </div>
              <div className="mover-impact-bars">
                <div>
                  <span>Portfolio impact</span>
                  <b className={selectedRow.portfolioImpact < 0 ? 'red' : 'green'}>{formatSignedMoney(selectedRow.portfolioImpact)}</b>
                  <i><em style={{ width: `${Math.min(100, Math.abs(selectedRow.impactPct) * 80)}%` }} /></i>
                </div>
                <div>
                  <span>Position weight</span>
                  <b>{selectedRow.weight}</b>
                  <i><em style={{ width: selectedRow.weight }} /></i>
                </div>
              </div>
              <div className="position-detail-grid">
                <div><span>Market Value</span><b>{selectedRow.value}</b></div>
                <div><span>Account</span><b>{selectedRow.account}</b></div>
                <div><span>Sector</span><b>{selectedRow.sector}</b></div>
                <div><span>Total Return</span><b className={selectedRow.return.startsWith('+') ? 'green' : 'red'}>{selectedRow.return}</b></div>
              </div>
              <p className="mover-catalyst">{selectedRow.catalyst}</p>
              <div className="position-detail-actions">
                <button onClick={openDetail} type="button"><Eye size={16} />View Details</button>
                <button onClick={() => runAction(APP_ACTIONS.ADD_TO_WATCHLIST, { symbol: selectedRow.ticker, name: selectedRow.name })} type="button">Add Watch</button>
              </div>
            </article>

            <article className="card mover-rank-card">
              <h3>Impact Ranking</h3>
              {moverData.impactLeaders.slice(0, 5).map((row, index) => (
                <button className={selectedRow.ticker === row.ticker ? 'active' : ''} key={row.ticker} onClick={() => setSelectedTicker(row.ticker)} type="button">
                  <span>{index + 1}</span>
                  <b>{row.ticker}</b>
                  <strong className={row.portfolioImpact < 0 ? 'red' : 'green'}>{formatSignedMoney(row.portfolioImpact)}</strong>
                </button>
              ))}
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}

function formatCompactMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function SectorSummaryCard({ icon: Icon, label, value, sub, tone = 'neutral' }) {
  return (
    <article className={`card sector-summary-card ${tone}`}>
      <div className="sector-summary-icon"><Icon size={24} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </article>
  );
}

function SectorsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [selectedSectorName, setSelectedSectorName] = useState(sectorExposureData.largest?.name ?? 'Technology');
  const [query, setQuery] = useState('');
  const selectedSector = sectorExposureData.sectors.find((row) => row.name === selectedSectorName) ?? sectorExposureData.sectors[0];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSectors = useMemo(() => {
    return sectorExposureData.sectors.filter((row) => {
      if (!normalizedQuery) return true;
      return row.name.toLowerCase().includes(normalizedQuery)
        || row.holdings.some((holding) => `${holding.symbol} ${holding.name}`.toLowerCase().includes(normalizedQuery));
    });
  }, [normalizedQuery]);
  const exportRows = sectorExposureData.sectors.map((row) => ({
    Sector: row.name,
    Weight: `${row.weight.toFixed(2)}%`,
    Benchmark: `${row.benchmark.toFixed(2)}%`,
    Difference: `${row.weight - row.benchmark >= 0 ? '+' : ''}${(row.weight - row.benchmark).toFixed(2)} pts`,
    Target: `${row.target.toFixed(2)}%`,
    Drift: `${row.drift >= 0 ? '+' : ''}${row.drift.toFixed(2)} pts`,
    Value: formatCompactMoney(row.value),
    Holdings: row.holdings.map((holding) => holding.symbol).join(', '),
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard holdings-page sectors-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Sectors</h1>
          <div className="market-brief"><span></span><b>Holdings</b><p>Sector exposure, benchmark comparison, and holding-level drilldown.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="sector-summary-grid">
          <SectorSummaryCard icon={Layers3} label="Covered Sectors" value={sectorExposureData.totalSectors} sub="Across active holdings and cash" />
          <SectorSummaryCard icon={PieChart} label="Largest Sector" value={`${sectorExposureData.largest.name} ${sectorExposureData.largest.weight.toFixed(1)}%`} sub={formatCompactMoney(sectorExposureData.largest.value)} />
          <SectorSummaryCard icon={ArrowUpRight} label="Largest Overweight" value={sectorExposureData.largestOverweight.name} sub={`${(sectorExposureData.largestOverweight.weight - sectorExposureData.largestOverweight.benchmark).toFixed(1)} pts vs benchmark`} tone="gain" />
          <SectorSummaryCard icon={Target} label="Largest Underweight" value={sectorExposureData.largestUnderweight.name} sub={`${(sectorExposureData.largestUnderweight.weight - sectorExposureData.largestUnderweight.benchmark).toFixed(1)} pts vs benchmark`} tone="loss" />
        </section>

        <section className="sectors-layout">
          <article className="card sector-exposure-card">
            <div className="holdings-table-head">
              <h3>Sector Exposure</h3>
              <div className="holdings-actions">
                <div className="holdings-search">
                  <Search size={16} />
                  <input onChange={(event) => setQuery(event.target.value)} placeholder="Search sector or holding..." type="text" value={query} />
                </div>
                <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Sector Exposure', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
              </div>
            </div>

            <div className="sector-exposure-list">
              {visibleSectors.map((row) => {
                const activeShare = row.weight - row.benchmark;
                return (
                  <button className={`sector-exposure-row ${selectedSector.name === row.name ? 'selected' : ''}`} key={row.name} onClick={() => setSelectedSectorName(row.name)} type="button">
                    <div className="sector-row-title">
                      <i style={{ background: row.color }} />
                      <div><b>{row.name}</b><span>{row.holdings.length} holdings</span></div>
                    </div>
                    <div className="sector-compare-track">
                      <i style={{ width: `${Math.min(100, row.weight * 2.4)}%`, background: row.color }} />
                      <b style={{ left: `${Math.min(100, row.benchmark * 2.4)}%` }} />
                    </div>
                    <strong>{row.weight.toFixed(1)}%</strong>
                    <em className={activeShare >= 0 ? 'green' : 'red'}>{activeShare >= 0 ? '+' : ''}{activeShare.toFixed(1)} pts</em>
                    <span>{formatCompactMoney(row.value)}</span>
                  </button>
                );
              })}
              {visibleSectors.length === 0 ? <StatusState title="No sectors found" message="Clear the search to show all sector exposure rows." /> : null}
            </div>
          </article>

          <aside className="sector-detail-stack">
            <article className="card sector-detail-card">
              <div className="sector-detail-head">
                <div><i style={{ background: selectedSector.color }} /><h3>{selectedSector.name}</h3></div>
                <strong>{selectedSector.weight.toFixed(1)}%</strong>
              </div>
              <div className="sector-detail-grid">
                <div><span>Market Value</span><b>{formatCompactMoney(selectedSector.value)}</b></div>
                <div><span>Benchmark</span><b>{selectedSector.benchmark.toFixed(1)}%</b></div>
                <div><span>Target</span><b>{selectedSector.target.toFixed(1)}%</b></div>
                <div><span>Target Drift</span><b className={selectedSector.drift >= 0 ? 'red' : 'green'}>{selectedSector.drift >= 0 ? '+' : ''}{selectedSector.drift.toFixed(1)} pts</b></div>
              </div>
              <div className="sector-benchmark-card">
                <span>Portfolio vs benchmark</span>
                <div>
                  <i style={{ width: `${Math.min(100, selectedSector.weight * 2.4)}%`, background: selectedSector.color }} />
                  <b style={{ left: `${Math.min(100, selectedSector.benchmark * 2.4)}%` }} />
                </div>
                <small>Marker shows benchmark sector weight.</small>
              </div>
              <button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'SectorExposure', sector: selectedSector.name })} type="button"><Eye size={16} />View Sector Detail</button>
            </article>

            <article className="card sector-holdings-card">
              <h3>Sector Holdings</h3>
              {selectedSector.holdings.map((holding) => (
                <button className="sector-holding-row" key={holding.symbol} onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'Holding', symbol: holding.symbol })} type="button">
                  <span className="holding-ticker"><HoldingLogo row={holding} /><b>{holding.symbol}</b></span>
                  <div><strong>{holding.weight}</strong><small>{holding.value}</small></div>
                  <Sparkline data={holding.series} danger={holding.danger} />
                </button>
              ))}
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
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

  if (activeSidebarItem === 'holdings-movers') {
    return <MoversPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'holdings-sectors') {
    return <SectorsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
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
