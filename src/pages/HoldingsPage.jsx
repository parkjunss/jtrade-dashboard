import { BarChart3, Clock3, Filter, LineChart, PieChart, Search, ShieldCheck, WalletCards } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import Sparkline from '../components/Sparkline.jsx';
import Modal from '../components/Modal.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { APP_ACTIONS } from '../services/appActions';
import { getHoldingsAllocationRows, getHoldingsRows, getHoldingsSectorRows, getHoldingsSummaryCards, getTickerStrip } from '../data/mock/selectors';
import MoversPage from './holdings/MoversPage.jsx';
import PositionsPage from './holdings/PositionsPage.jsx';
import SectorsPage from './holdings/SectorsPage.jsx';
import { getPositionDetails, HoldingLogo } from './holdings/HoldingPageShared.jsx';

const tickerStrip = getTickerStrip();
const summaryIcons = [WalletCards, LineChart, BarChart3, WalletCards];
const summaryCards = getHoldingsSummaryCards().map((item, index) => ({ ...item, icon: summaryIcons[index] }));
const holdingsRows = getHoldingsRows();
const allocationRows = getHoldingsAllocationRows();
const sectorRows = getHoldingsSectorRows();

const bottomStats = [
  { icon: BarChart3, label: 'Number of Holdings', value: '36', sub: 'vs last month  +3' },
  { icon: PieChart, label: 'Largest Position', value: 'NVDA', sub: '12.44% of portfolio' },
  { icon: WalletCards, label: 'Dividend Yield', value: '2.18%', sub: 'vs benchmark  1.62%' },
  { icon: Clock3, label: 'Avg. Holding Period', value: '14.2 months', sub: 'vs last month  +1.8 mo' },
  { icon: ShieldCheck, label: 'Concentration Score', value: 'Moderate', sub: 'vs benchmark  Moderate' },
];

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

