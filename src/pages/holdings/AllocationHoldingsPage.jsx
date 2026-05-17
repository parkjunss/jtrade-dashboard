import { Download, Eye, PieChart, Scale, WalletCards } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getHoldingsAllocationRows, getHoldingsRows, getTickerStrip } from '../../data/mock/selectors';
import { getPositionDetails, HoldingLogo } from './HoldingPageShared.jsx';

const tickerStrip = getTickerStrip();
const allocationRows = getHoldingsAllocationRows();
const holdingsRows = getHoldingsRows();

function parsePct(value) {
  return Number(String(value).replace('%', '')) || 0;
}

function parseMoney(value) {
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

const allocationDetails = allocationRows.map(([name, weight, value, color]) => {
  const symbolsByGroup = {
    'Apple (AAPL)': ['AAPL'],
    'ETFs': ['SPY', 'QQQ'],
    'Microsoft (MSFT)': ['MSFT'],
    'NVIDIA (NVDA)': ['NVDA'],
    'Samsung Elec.': ['005930.KS'],
    Cash: ['CASH'],
  };
  const symbols = symbolsByGroup[name] ?? [];
  const holdings = holdingsRows.filter((row) => symbols.includes(row.ticker));

  return {
    color,
    holdings,
    name,
    value,
    valueNumber: parseMoney(value),
    weight,
    weightNumber: parsePct(weight),
  };
});

const largestGroup = allocationDetails.reduce((max, row) => (row.weightNumber > max.weightNumber ? row : max), allocationDetails[0]);
const equityWeight = allocationDetails
  .filter((row) => row.name !== 'Cash')
  .reduce((sum, row) => sum + row.weightNumber, 0);
const concentratedWeight = allocationDetails
  .filter((row) => row.holdings.length === 1 && row.name !== 'Cash')
  .reduce((sum, row) => sum + row.weightNumber, 0);

function AllocationSummaryCard({ icon: Icon, label, value, sub }) {
  return (
    <article className="card sector-summary-card">
      <div className="sector-summary-icon"><Icon size={24} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </article>
  );
}

export default function AllocationHoldingsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const exportRows = allocationDetails.map((row) => ({
    Group: row.name,
    Weight: row.weight,
    Value: row.value,
    Holdings: row.holdings.map((holding) => holding.ticker).join(', ') || row.name,
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard holdings-page holdings-allocation-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Allocation</h1>
          <div className="market-brief"><span></span><b>Holdings</b><p>Holding-level allocation groups, weights, values, and concentration detail.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="sector-summary-grid">
          <AllocationSummaryCard icon={PieChart} label="Largest Group" value={largestGroup.name} sub={`${largestGroup.weight} of portfolio`} />
          <AllocationSummaryCard icon={WalletCards} label="Equity Exposure" value={`${equityWeight.toFixed(2)}%`} sub="Excluding cash balance" />
          <AllocationSummaryCard icon={Scale} label="Single-name Weight" value={`${concentratedWeight.toFixed(2)}%`} sub="Direct stock groups" />
          <AllocationSummaryCard icon={Eye} label="Groups" value={allocationDetails.length} sub="Allocation buckets tracked" />
        </section>

        <section className="holdings-allocation-detail-layout">
          <article className="card holdings-allocation-detail-card">
            <div className="holdings-table-head">
              <h3>Allocation Breakdown</h3>
              <div className="holdings-actions">
                <button
                  disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT}
                  onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Holdings Allocation', type: 'CSV', rows: exportRows })}
                  type="button"
                >
                  <Download size={16} />Export
                </button>
              </div>
            </div>

            <div className="holdings-allocation-detail-list">
              {allocationDetails.map((row) => (
                <div className="holdings-allocation-detail-row" key={row.name}>
                  <div className="allocation-group-title">
                    <i style={{ background: row.color }} />
                    <div><b>{row.name}</b><span>{row.holdings.length || 1} holding bucket</span></div>
                  </div>
                  <div className="allocation-weight-track"><i style={{ width: row.weight }} /></div>
                  <strong>{row.weight}</strong>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          </article>

          <aside className="holdings-allocation-detail-stack">
            <article className="card holdings-allocation-card">
              <h3>Portfolio Mix</h3>
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

            <article className="card holdings-allocation-holdings-card">
              <h3>Direct Holdings</h3>
              {holdingsRows.filter((row) => row.ticker !== 'CASH').slice(0, 6).map((row) => {
                const details = getPositionDetails(row);
                return (
                  <div className="allocation-holding-row" key={row.ticker}>
                    <span className="holding-ticker"><HoldingLogo row={row} /><b>{row.ticker}</b></span>
                    <div><strong>{row.weight}</strong><small>{details.sector}</small></div>
                    <em className={row.day.startsWith('-') ? 'red' : 'green'}>{row.day}</em>
                  </div>
                );
              })}
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
