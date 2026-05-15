import { ArrowDownRight, ArrowUpRight, BarChart3, Download, Eye, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import Sparkline from '../../components/Sparkline.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getHoldingsMoverData, getTickerStrip } from '../../data/mock/selectors';
import { formatSignedMoney, HoldingLogo } from './HoldingPageShared.jsx';

const tickerStrip = getTickerStrip();
const moverData = getHoldingsMoverData();

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

export default function MoversPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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


