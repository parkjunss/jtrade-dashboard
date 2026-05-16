import { BarChart3, Check, CircleDollarSign, PieChart, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { getAllocationRebalanceRows, getAllocationRegionRows, getAllocationRows, getAllocationSectorRows, getAllocationTrendMonths, getTickerStrip } from '../data/mock/selectors';
import AllocationAssetsPage from './allocation/AllocationAssetsPage.jsx';
import AllocationRebalancePage from './allocation/AllocationRebalancePage.jsx';
import AllocationRiskPage from './allocation/AllocationRiskPage.jsx';
import AllocationTargetsPage from './allocation/AllocationTargetsPage.jsx';
import { MetricTile, ProgressRow } from './allocation/AllocationPageShared.jsx';

const tickerStrip = getTickerStrip();
const allocationRows = getAllocationRows();
const rebalanceRows = getAllocationRebalanceRows();
const sectorRows = getAllocationSectorRows();
const regionRows = getAllocationRegionRows();
const trendMonths = getAllocationTrendMonths();

export default function AllocationPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const trendRange = useSelection('6M');

  if (activeSidebarItem === 'allocation-targets') {
    return <AllocationTargetsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'allocation-rebalance') {
    return <AllocationRebalancePage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'allocation-assets') {
    return <AllocationAssetsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'allocation-risk') {
    return <AllocationRiskPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem !== 'allocation-overview') {
    return <SubPageShell activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} fallbackTitle="Allocation" />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard allocation-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Allocation</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="allocation-hero-grid">
          <article className="card allocation-summary">
            <h3>Portfolio Allocation</h3>
            <p>Total Portfolio Value</p>
            <strong>$422,525.82</strong>
            <small>Diversified across 5 asset groups</small>
            <div className="allocation-status">
              <div><ShieldCheck size={24} /><span>Risk Level</span><b>Moderate</b></div>
              <div><Check size={24} /><span>Rebalance Status</span><b>On Track</b></div>
              <div><Zap size={24} /><span>Target Drift</span><b className="orange">2.3%</b></div>
            </div>
          </article>

          <article className="card allocation-current">
            <h3>Current Allocation</h3>
            <div className="allocation-donut-wrap">
              <div className="allocation-donut"><b>$422,525.82</b><span>Total Value</span></div>
              <div className="allocation-legend-list">
                {allocationRows.map((row) => (
                  <div key={row.name}>
                    <i style={{ background: row.color }} />
                    <span>{row.name}</span>
                    <b>{row.current}%</b>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="card allocation-target">
            <div className="allocation-card-head">
              <h3>Target vs Current Allocation</h3>
              <div><span className="dot green-dot-solid" />Current <span className="dot gray-dot-solid" />Target</div>
            </div>
            {allocationRows.map((row) => (
              <div className="target-row" key={row.name}>
                <span>{row.name}</span>
                <div className="target-bars">
                  <i style={{ width: `${row.current}%` }} />
                  <b style={{ width: `${row.target}%` }} />
                </div>
                <strong>{row.current}%</strong>
                <em className={row.drift.startsWith('+') ? 'red' : row.drift.startsWith('-') ? 'green' : ''}>{row.drift}</em>
              </div>
            ))}
          </article>
        </section>

        <section className="allocation-middle-grid">
          <article className="card rebalance-card">
            <div className="allocation-card-head">
              <h3>Rebalance Suggestions</h3>
              <button type="button">View Details</button>
            </div>
            <div className="rebalance-table">
              <div className="rebalance-head"><span>Action</span><span>Asset Class</span><span>Current %</span><span>Target %</span><span>Difference</span><span>Suggested Amount</span></div>
              {rebalanceRows.map((row) => (
                <div className="rebalance-row" key={row.asset}>
                  <span><b className={row.tone}>{row.action}</b></span>
                  <span>{row.asset}</span>
                  <span>{row.current}</span>
                  <span>{row.target}</span>
                  <span className={row.tone}>{row.diff}</span>
                  <strong className={row.tone}>{row.amount}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="card allocation-bars-card">
            <h3>Sector Exposure</h3>
            {sectorRows.map(([label, value]) => <ProgressRow key={label} label={label} value={value} />)}
          </article>

          <article className="card allocation-bars-card">
            <h3>Regional Split</h3>
            {regionRows.map(([label, value]) => <ProgressRow key={label} label={label} value={value} />)}
          </article>
        </section>

        <section className="allocation-trend-grid">
          <article className="card allocation-trend-card">
            <div className="allocation-card-head">
              <h3>Allocation Trend</h3>
              <div className="time-tabs">
                {['6M', '1Y', '2Y', 'All'].map(r => (
                  <button 
                    key={r} 
                    className={trendRange.isSelected(r) ? 'active' : ''} 
                    onClick={() => trendRange.select(r)}
                    type="button"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="allocation-stacked-chart">
              {trendMonths.map((month, index) => (
                <div className="stack-column" key={month}>
                  <div style={{ height: `${42 + index}%`, background: '#47b51e' }} />
                  <div style={{ height: `${18 + (index % 2)}%`, background: '#91d46b' }} />
                  <div style={{ height: `${16 + (index % 3)}%`, background: '#3478db' }} />
                  <div style={{ height: `${14 - (index % 2)}%`, background: '#8f62d9' }} />
                  <div style={{ height: '10%', background: '#f7b500' }} />
                  <span>{month}</span>
                </div>
              ))}
            </div>
          </article>

          <MetricTile icon={BarChart3} label="Number of Holdings" value="36" sub="vs last month 35  +1" />
          <MetricTile icon={PieChart} label="Largest Position" value="9.42%" sub="Apple Inc. (AAPL)" />
          <MetricTile icon={ShieldCheck} label="Diversification Score" value="8.3/10" sub="Well Diversified" />
          <MetricTile icon={CircleDollarSign} label="Dividend Yield" value="2.18%" sub="vs benchmark 1.62%" />
          <MetricTile icon={TrendingUp} label="Avg. Beta" value="0.87" sub="vs benchmark 1.00" />
        </section>
      </main>
    </div>
  );
}
