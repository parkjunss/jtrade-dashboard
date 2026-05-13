import { Bookmark, ChevronDown, Download, Filter, Funnel, Play, Rocket, Search, Target, Trophy, Gem, Layers3 } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import Sparkline from '../components/Sparkline.jsx';
import Modal from '../components/Modal.jsx';
import StatusState from '../components/StatusState.jsx';
import { tickerStrip } from '../data/mockData';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { APP_ACTIONS } from '../services/appActions';
import { useState, useEffect, useMemo, useRef } from 'react';
import { getScreenerRows } from '../data/mock/selectors';

const results = getScreenerRows();

const distribution = [
  ['90+', 38, '29.7%'],
  ['80 - 89', 33, '25.8%'],
  ['70 - 79', 28, '21.9%'],
  ['60 - 69', 18, '14.1%'],
  ['< 60', 11, '8.6%'],
];

const sectors = [
  ['Technology', 48, '37.5%'],
  ['Semiconductors', 32, '25.0%'],
  ['Communication Services', 18, '14.1%'],
  ['Industrials', 12, '9.4%'],
  ['Healthcare', 10, '7.8%'],
  ['Energy', 8, '6.2%'],
];

const themes = [
  ['AI Infrastructure', 52, '40.6%'],
  ['Semiconductors', 46, '35.9%'],
  ['Cloud Software', 31, '24.2%'],
  ['Grid & Power', 22, '17.2%'],
  ['Defense Tech', 14, '10.9%'],
];

const quickScreens = [
  ['AI Leaders', '128 results', 'Updated 2m ago'],
  ['High ROE Compounders', '96 results', 'Updated 1h ago'],
  ['Undervalued Growth', '87 results', 'Updated 3h ago'],
  ['Momentum Breakouts', '75 results', 'Updated 1d ago'],
  ['Low Vol Quality', '64 results', 'Updated 2d ago'],
];

const screenerColumns = [
  { key: 'ticker', label: 'Ticker' },
  { key: 'company', label: 'Company' },
  { key: 'price', label: 'Price' },
  { key: 'day', label: '1D %' },
  { key: 'return1Y', label: '1Y Return' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'pe', label: 'P/E' },
  { key: 'growth', label: 'Revenue Growth' },
  { key: 'roe', label: 'ROE' },
  { key: 'volume', label: 'Volume' },
  { key: 'score', label: 'Score' },
  { key: 'trend', label: 'Trend (1Y)' },
];

const toResultObject = (row) => ({
  ticker: row[0],
  company: row[1],
  price: row[2],
  day: row[3],
  return1Y: row[4],
  marketCap: row[5],
  pe: row[6],
  growth: row[7],
  roe: row[8],
  volume: row[9],
  score: row[10],
  trend: row[11],
});

function parsePercent(value) {
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

function parseMarketCap(value) {
  const text = String(value).toUpperCase();
  const amount = Number(text.replace(/[^0-9.-]/g, '')) || 0;

  if (text.includes('T')) return amount * 1_000_000;
  if (text.includes('B')) return amount * 1_000;
  if (text.includes('M')) return amount;
  return amount;
}

function parseCompactNumber(value) {
  const text = String(value).toUpperCase();
  const amount = Number(text.replace(/[^0-9.-]/g, '')) || 0;

  if (text.includes('B')) return amount * 1_000;
  if (text.includes('M')) return amount;
  if (text.includes('K')) return amount / 1_000;
  return amount;
}

function SelectBox({ label, options, selection }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`dropdown-wrap ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <div className="screen-filter-field">
        <span>{label}</span>
        <button type="button" onClick={() => setIsOpen((open) => !open)}>
          {selection.value}<ChevronDown size={15} />
        </button>
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map(opt => (
            <button 
              key={opt} 
              className={`dropdown-item ${selection.isSelected(opt) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                selection.select(opt);
                setIsOpen(false);
              }}
              type="button"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressList({ title, rows, onViewDetails }) {
  return (
    <article className="card screener-side-card">
      <div className="screener-card-head"><h3>{title}</h3><button onClick={() => onViewDetails?.(title, rows)} type="button">View Details</button></div>
      {rows.map(([label, value, pct], index) => (
        <div className="screener-progress-row" key={label}>
          <span>{label}</span>
          <div><i style={{ width: `${Math.min(value * 2.4, 100)}%` }} /></div>
          <strong>{value}</strong>
          <em>{pct}</em>
        </div>
      ))}
    </article>
  );
}

export default function ScreenerPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { mockMutations, pendingAction, runAction } = useAppAction();
  const [activeModal, setActiveModal] = useState(null);
  const [activeDetail, setActiveDetail] = useState({ title: '', rows: [] });
  const [isScreenRunning, setIsScreenRunning] = useState(false);
  const [resultObjects, setResultObjects] = useState(results.map(toResultObject));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Score');
  const [visibleColumns, setVisibleColumns] = useState(screenerColumns.map((column) => column.key));
  const market = useSelection('US');
  const country = useSelection('United States');
  const sector = useSelection('Technology');
  const selectedRow = useSelection(null);

  const [themeTags, setThemeTags] = useState(['AI Infrastructure', 'Semiconductors', 'Cloud', 'Power']);
  const marketCap = useSelection('Large Cap+');
  const peRange = useSelection('15 - 50');
  const revenueGrowth = useSelection('> 15%');
  const roe = useSelection('> 15%');
  const avgVolume = useSelection('> 1M');
  const range52W = useSelection('Within 30% of High');

  const removeTag = (tag) => {
    setThemeTags(prev => prev.filter(t => t !== tag));
  };

  const quickScreenRows = [
    ...mockMutations.savedScreens.map((row) => [row.name, row.count, row.updated]),
    ...quickScreens,
  ];
  const filteredResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const sorted = [...resultObjects].filter((row) => !normalizedQuery || `${row.ticker} ${row.company}`.toLowerCase().includes(normalizedQuery));

    sorted.sort((a, b) => {
      if (sortBy === '1Y Return') return parsePercent(b.return1Y) - parsePercent(a.return1Y);
      if (sortBy === 'Market Cap') return parseMarketCap(b.marketCap) - parseMarketCap(a.marketCap);
      if (sortBy === 'P/E Low') return Number(a.pe) - Number(b.pe);
      if (sortBy === 'P/E High') return Number(b.pe) - Number(a.pe);
      if (sortBy === 'Volume') return parseCompactNumber(b.volume) - parseCompactNumber(a.volume);
      return Number(b.score) - Number(a.score);
    });

    return sorted;
  }, [resultObjects, searchQuery, sortBy]);
  const visibleColumnConfig = screenerColumns.filter((column) => visibleColumns.includes(column.key));
  const screenerGridTemplate = `repeat(${Math.max(visibleColumnConfig.length, 1)}, minmax(82px, 1fr))`;
  const exportRows = filteredResults.map((row) => Object.fromEntries(
    visibleColumnConfig
      .filter((column) => column.key !== 'trend')
      .map((column) => [column.label, row[column.key]]),
  ));
  const avgReturn = filteredResults.length ? filteredResults.reduce((sum, row) => sum + parsePercent(row.return1Y), 0) / filteredResults.length : 0;
  const medianPe = filteredResults.length ? [...filteredResults].sort((a, b) => Number(a.pe) - Number(b.pe))[Math.floor(filteredResults.length / 2)]?.pe : '0';
  const highMomentumRatio = filteredResults.length ? Math.round((filteredResults.filter((row) => Number(row.score) >= 80).length / filteredResults.length) * 100) : 0;

  const runScreen = async () => {
    setIsScreenRunning(true);
    await runAction(APP_ACTIONS.RUN_SCREEN, { market: market.value, themeTags, sector: sector.value, country: country.value });
    const nextRows = results.map(toResultObject).filter((row) => {
      if (market.isSelected('ETFs')) return ['SPY', 'QQQ'].includes(row.ticker);
      if (country.isSelected('Taiwan')) return row.ticker === 'TSM';
      if (country.isSelected('Netherlands')) return row.ticker === 'ASML';
      return true;
    });
    setResultObjects(nextRows.length ? nextRows : results.map(toResultObject).slice(0, 4));
    setIsScreenRunning(false);
  };

  const saveScreen = () => runAction(APP_ACTIONS.SAVE_SCREEN, {
    name: `${sector.value} ${market.value} Screen`,
    resultCount: `${filteredResults.length} results`,
  });

  const openDetail = (title, rows) => {
    setActiveDetail({ title, rows });
    setActiveModal('detail');
  };

  const restoreQuickScreen = (name) => {
    if (name.includes('AI')) {
      sector.select('Technology');
      market.select('US');
    }
    setActiveModal(null);
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard screener-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="screener-top-strip">
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious path...</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <h1>Screener</h1>

        <section className="screener-filter-layout">
          <article className="card screener-filter-panel">
            <div className="filter-group wide">
              <span>Market</span>
              <div className="segmented-filter">
                {['US', 'Korea', 'ETFs'].map((item) => <button className={market.isSelected(item) ? 'active' : ''} key={item} onClick={() => market.select(item)} type="button">{item}</button>)}
              </div>
            </div>
            <div className="filter-group">
              <span>Sector</span>
              <div className="chip-row">
                {['Technology', 'Semiconductors', 'Financials', 'Healthcare'].map((item) => (
                  <button 
                    className={sector.isSelected(item) ? 'active' : ''} 
                    key={item} 
                    onClick={() => sector.select(item)} 
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <span>Country</span>
              <div className="chip-row">
                {['United States', 'Korea', 'Taiwan', 'Netherlands'].map((item) => <button className={country.isSelected(item) ? 'active' : ''} key={item} onClick={() => country.select(item)} type="button">{item}</button>)}
              </div>
            </div>
            <SelectBox label="Market Cap" options={['Small Cap', 'Mid Cap', 'Large Cap', 'Large Cap+']} selection={marketCap} />
            <SelectBox label="P/E Range" options={['Any', '< 15', '15 - 50', '> 50']} selection={peRange} />
            <SelectBox label="Revenue Growth" options={['Any', '> 5%', '> 15%', '> 30%']} selection={revenueGrowth} />
            <SelectBox label="ROE" options={['Any', '> 10%', '> 15%', '> 25%']} selection={roe} />
            <SelectBox label="Avg Volume" options={['Any', '> 100K', '> 500K', '> 1M']} selection={avgVolume} />
            <SelectBox label="52W Range" options={['Any', 'Within 10%', 'Within 30% of High']} selection={range52W} />
            <label className="screen-filter-field tags-field">
              <span>Theme Tags</span>
              <button type="button">
                {themeTags.map(tag => (
                  <b key={tag} onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>{tag} x</b>
                ))}
                <ChevronDown size={15} />
              </button>
            </label>
          </article>
          <aside className="card screener-actions">
            <button className="run-screen" disabled={pendingAction === APP_ACTIONS.RUN_SCREEN || isScreenRunning} onClick={runScreen} type="button"><Play size={17} />{pendingAction === APP_ACTIONS.RUN_SCREEN || isScreenRunning ? 'Running...' : 'Run Screen'}</button>
            <button disabled={pendingAction === APP_ACTIONS.SAVE_SCREEN} onClick={saveScreen} type="button"><Bookmark size={17} />Save Screen</button>
          </aside>
        </section>

        <section className="screener-stat-grid">
          <article className="card">
            <div className='stat-icon'>
              <Funnel />
            </div>
            <span>Matches Found</span><strong>{filteredResults.length}</strong></article>
          <article className="card"><TrendingUpIcon /><span>Avg 1Y Return</span><strong className="green">+{avgReturn.toFixed(1)}%</strong></article>
          <article className="card"><BarIcon /><span>Median P/E</span><strong>{medianPe}</strong></article>
          <article className="card"><PieIcon /><span>Avg Market Cap</span><strong>$186B</strong></article>
          <article className="card"><TrendingUpIcon /><span>High Momentum Ratio</span><strong>{highMomentumRatio}%</strong></article>
        </section>

        <section className="screener-main-grid">
          <div className="screener-left">
            <article className="card screener-results-card">
              <div className="screener-results-head">
                <h3>Screen Results</h3>
                <div className="screener-table-tools">
                  <label className="screener-search-tool"><Search size={16} /><input onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tickers or companies..." type="text" value={searchQuery} /></label>
                  <button onClick={() => setActiveModal('columns')} type="button">Columns <ChevronDown size={15} /></button>
                  <button disabled={pendingAction === APP_ACTIONS.EXPORT_SCREENER} onClick={() => runAction(APP_ACTIONS.EXPORT_SCREENER, { format: 'csv', name: `${sector.value} ${market.value} Screener Export`, rows: exportRows })} type="button"><Download size={15} />Export</button>
                  <button onClick={() => setActiveModal('sort')} type="button">Sort by: {sortBy} <ChevronDown size={15} /></button>
                  <button className="icon-filter" onClick={() => setActiveModal('advancedFilter')} type="button"><Filter size={17} /></button>
                </div>
              </div>
              <div className="screener-table">
                <div className="screener-row screener-header" style={{ gridTemplateColumns: screenerGridTemplate }}>{visibleColumnConfig.map((column) => <span key={column.key}>{column.label}</span>)}</div>
                {filteredResults.map((row) => (
                  <div 
                    className={`screener-row clickable ${selectedRow.isSelected(row.ticker) ? 'selected' : ''}`} 
                    key={row.ticker}
                    onClick={() => selectedRow.select(selectedRow.isSelected(row.ticker) ? null : row.ticker)}
                    style={{ gridTemplateColumns: screenerGridTemplate }}
                  >
                    {visibleColumnConfig.map((column) => {
                      if (column.key === 'ticker') return <b key={column.key}>{row.ticker}</b>;
                      if (column.key === 'day') return <span className={row.day.startsWith('-') ? 'red' : 'green'} key={column.key}>{row.day}</span>;
                      if (column.key === 'return1Y' || column.key === 'growth') return <span className="green" key={column.key}>{row[column.key]}</span>;
                      if (column.key === 'score') return <em key={column.key}>{row.score}</em>;
                      if (column.key === 'trend') return <Sparkline data={row.trend} className={row.day.startsWith('-') ? 'red-line' : 'green-line'} key={column.key} width={92} />;
                      return <span key={column.key}>{row[column.key]}</span>;
                    })}
                  </div>
                ))}
                {filteredResults.length === 0 ? <StatusState title="No matching symbols" message="Adjust filters or clear search to broaden the result set." /> : null}
              </div>
            </article>

            <section className="screener-lower-grid">
              <article className="card screener-risk-card">
                <h3>Risk vs Return <span>(Screened Names)</span></h3>
                <div className="screener-scatter">
                  <span style={{ left: '12%', bottom: '58%' }}>MSFT</span>
                  <span style={{ left: '20%', bottom: '48%' }}>ASML</span>
                  <span style={{ left: '34%', bottom: '56%' }}>TSM</span>
                  <span className="screener-profile-point" style={{ left: '50%', bottom: '62%' }}>Avg Screener Profile</span>
                  <span style={{ left: '69%', bottom: '54%' }}>AMD</span>
                  <span style={{ left: '76%', bottom: '69%' }}>ARM</span>
                  <span style={{ left: '86%', bottom: '78%' }}>PLTR</span>
                </div>
              </article>
              <article className="card quick-screens-card">
                <div className="screener-card-head"><h3>Quick Screens</h3><button onClick={() => setActiveModal('quickScreens')} type="button">View All</button></div>
                {quickScreenRows.map(([name, count, updated]) => <button className="quick-screen-row" key={name} onClick={() => restoreQuickScreen(name)} type="button"><Bookmark size={15} /><b>{name}</b><span>{count}</span><em>{updated}</em></button>)}
              </article>
            </section>
          </div>

          <aside className="screener-right">
            <ProgressList title="Opportunity Score Distribution" rows={distribution} onViewDetails={openDetail} />
            <ProgressList title="Sector Breakdown" rows={sectors} onViewDetails={openDetail} />
            <ProgressList title="Top Themes" rows={themes} onViewDetails={openDetail} />
          </aside>
        </section>

        <section className="screener-awards-grid">
          <article className="card"><Trophy size={30} /><span>Top Score</span><strong>NVDA</strong><em>96 Score</em></article>
          <article className="card"><Gem size={30} /><span>Best Value (Lowest P/E)</span><strong>TSM</strong><em>19.8 P/E</em></article>
          <article className="card"><Rocket size={30} /><span>Fastest Growth (Rev)</span><strong>ARM</strong><em>+65.4%</em></article>
          <article className="card"><Target size={30} /><span>Highest ROE</span><strong>META</strong><em>27.9%</em></article>
          <article className="card"><Layers3 size={30} /><span>Most Liquid (Volume)</span><strong>MSFT</strong><em>22.1M Volume</em></article>
        </section>

        <Modal isOpen={activeModal === 'columns'} onClose={() => setActiveModal(null)} title="Screener Columns">
          <div className="column-toggle-grid">
            {screenerColumns.map((column) => (
              <label key={column.key}>
                <input checked={visibleColumns.includes(column.key)} onChange={() => setVisibleColumns((current) => current.includes(column.key) ? current.filter((key) => key !== column.key) : [...current, column.key])} type="checkbox" />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'sort'} onClose={() => setActiveModal(null)} title="Sort Screen Results">
          <div className="screener-modal-list">
            {['Score', '1Y Return', 'Market Cap', 'P/E Low', 'P/E High', 'Volume'].map((item) => <button className={sortBy === item ? 'active' : ''} key={item} onClick={() => { setSortBy(item); setActiveModal(null); }} type="button">{item}</button>)}
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'advancedFilter'} onClose={() => setActiveModal(null)} title="Advanced Filters">
          <div className="positions-modal-stack">
            <p className="positions-modal-copy">Current filter set is applied from the screener panel. Use Run Screen to refresh the result set.</p>
            <div className="import-format-grid">
              {[market.value, country.value, sector.value, marketCap.value, peRange.value, revenueGrowth.value].map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="modal-action-row"><button onClick={() => setActiveModal(null)} type="button">Close</button><button onClick={runScreen} type="button">Run Screen</button></div>
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'detail'} onClose={() => setActiveModal(null)} title={activeDetail.title}>
          <div className="screener-modal-list">
            {activeDetail.rows.map(([label, value, pct]) => <div className="screener-detail-row" key={label}><b>{label}</b><span>{value}</span><strong>{pct}</strong></div>)}
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'quickScreens'} onClose={() => setActiveModal(null)} title="Saved Screens">
          <div className="screener-modal-list">
            {quickScreenRows.map(([name, count, updated]) => <button key={name} onClick={() => restoreQuickScreen(name)} type="button"><b>{name}</b><span>{count}</span><em>{updated}</em></button>)}
          </div>
        </Modal>
      </main>
    </div>
  );
}

function TrendingUpIcon() {
  return <span className="fake-icon">T</span>;
}

function BarIcon() {
  return <span className="fake-icon">B</span>;
}

function PieIcon() {
  return <span className="fake-icon">P</span>;
}
