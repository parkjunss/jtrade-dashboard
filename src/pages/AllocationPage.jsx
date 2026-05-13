import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Check, CircleDollarSign, Download, PieChart, Play, Save, ShieldCheck, SlidersHorizontal, Target, TrendingUp, Undo2, Zap } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import { tickerStrip } from '../data/mockData';
import SubPageShell from './SubPageShell.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { useAppAction } from '../context/AppActionContext.jsx';
import StatusState from '../components/StatusState.jsx';
import { APP_ACTIONS } from '../services/appActions';

const allocationRows = [
  { name: 'US Stocks', color: '#47b51e', current: 42, target: 40, value: '$177,461.64', drift: '+2.0%' },
  { name: 'Korean Stocks', color: '#91d46b', current: 18, target: 20, value: '$76,055.65', drift: '-2.0%' },
  { name: 'ETFs', color: '#3478db', current: 16, target: 15, value: '$67,604.13', drift: '+1.0%' },
  { name: 'Bonds', color: '#8f62d9', current: 14, target: 15, value: '$59,153.61', drift: '-1.0%' },
  { name: 'Cash', color: '#f7b500', current: 10, target: 10, value: '$42,250.79', drift: '0.0%' },
];

const rebalanceRows = [
  { action: 'Reduce', asset: 'US Stocks', current: '42%', target: '40%', diff: '+2.0%', amount: '-$8,451.29', tone: 'red' },
  { action: 'Increase', asset: 'Korean Stocks', current: '18%', target: '20%', diff: '-2.0%', amount: '+$8,451.29', tone: 'green' },
  { action: 'Increase', asset: 'Bonds', current: '14%', target: '15%', diff: '-1.0%', amount: '+$4,225.65', tone: 'green' },
  { action: 'Hold', asset: 'Cash', current: '10%', target: '10%', diff: '0.0%', amount: '$0.00', tone: 'neutral' },
];

const rebalanceTradeRows = [
  { action: 'Sell', ticker: 'AAPL', asset: 'US Stocks', current: 9.4, target: 8.0, drift: 1.4, amount: -5915, fee: 2.1, tax: 185, after: 8.0, taxable: true },
  { action: 'Sell', ticker: 'NVDA', asset: 'US Stocks', current: 8.8, target: 7.0, drift: 1.8, amount: -7605, fee: 2.6, tax: 420, after: 7.0, taxable: true },
  { action: 'Buy', ticker: 'EWY', asset: 'Korean Stocks', current: 4.6, target: 6.0, drift: -1.4, amount: 5915, fee: 1.9, tax: 0, after: 6.0, taxable: false },
  { action: 'Buy', ticker: 'TLT', asset: 'Bonds', current: 4.1, target: 5.0, drift: -0.9, amount: 3803, fee: 1.7, tax: 0, after: 5.0, taxable: false },
  { action: 'Buy', ticker: 'SPY', asset: 'ETFs', current: 6.4, target: 7.2, drift: -0.8, amount: 3380, fee: 1.5, tax: 0, after: 7.2, taxable: false },
  { action: 'Hold', ticker: 'Cash', asset: 'Cash', current: 10.0, target: 10.0, drift: 0, amount: 0, fee: 0, tax: 0, after: 10.0, taxable: false },
];

const sectorRows = [
  ['Technology', 21.3],
  ['Financials', 15.8],
  ['Healthcare', 13.2],
  ['Energy', 9.7],
  ['Consumer Discretionary', 9.1],
  ['Industrial', 7.8],
  ['Others', 23.1],
];

const regionRows = [
  ['United States', 60],
  ['Korea', 18],
  ['Europe', 10],
  ['Emerging Markets', 7],
  ['Cash & Equivalents', 5],
];

const trendMonths = ['Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25'];

const targetGroups = {
  'Asset Class': [
    { name: 'US Stocks', current: 42, target: 40, tolerance: 3, threshold: 2, color: '#47b51e' },
    { name: 'Korean Stocks', current: 18, target: 20, tolerance: 4, threshold: 2, color: '#91d46b' },
    { name: 'ETFs', current: 16, target: 15, tolerance: 3, threshold: 2, color: '#3478db' },
    { name: 'Bonds', current: 14, target: 15, tolerance: 2, threshold: 1.5, color: '#8f62d9' },
    { name: 'Cash', current: 10, target: 10, tolerance: 2, threshold: 1, color: '#f7b500' },
  ],
  Region: [
    { name: 'United States', current: 60, target: 58, tolerance: 5, threshold: 3, color: '#47b51e' },
    { name: 'Korea', current: 18, target: 20, tolerance: 4, threshold: 2, color: '#91d46b' },
    { name: 'Europe', current: 10, target: 11, tolerance: 3, threshold: 2, color: '#3478db' },
    { name: 'Emerging Markets', current: 7, target: 8, tolerance: 3, threshold: 2, color: '#8f62d9' },
    { name: 'Cash & Equivalents', current: 5, target: 3, tolerance: 2, threshold: 1, color: '#f7b500' },
  ],
  Sector: [
    { name: 'Technology', current: 21.3, target: 20, tolerance: 4, threshold: 2.5, color: '#47b51e' },
    { name: 'Financials', current: 15.8, target: 15, tolerance: 3, threshold: 2, color: '#91d46b' },
    { name: 'Healthcare', current: 13.2, target: 14, tolerance: 3, threshold: 2, color: '#3478db' },
    { name: 'Energy', current: 9.7, target: 8, tolerance: 2.5, threshold: 1.5, color: '#8f62d9' },
    { name: 'Consumer Discretionary', current: 9.1, target: 10, tolerance: 3, threshold: 2, color: '#f7b500' },
  ],
  Symbol: [
    { name: 'AAPL', current: 9.4, target: 8, tolerance: 2, threshold: 1.5, color: '#47b51e' },
    { name: 'NVDA', current: 8.8, target: 7, tolerance: 2, threshold: 1.5, color: '#91d46b' },
    { name: 'MSFT', current: 7.2, target: 7, tolerance: 2, threshold: 1, color: '#3478db' },
    { name: 'SPY', current: 6.4, target: 8, tolerance: 2, threshold: 1.5, color: '#8f62d9' },
    { name: 'TLT', current: 4.1, target: 5, tolerance: 1.5, threshold: 1, color: '#f7b500' },
  ],
};

function MetricTile({ icon: Icon, label, value, sub }) {
  return (
    <article className="allocation-metric card">
      <div className="allocation-metric-icon"><Icon size={25} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </article>
  );
}

function ProgressRow({ label, value, target, color = 'var(--green)' }) {
  return (
    <div className="allocation-progress-row">
      <span>{label}</span>
      <div className="progress-track">
        <i style={{ width: `${value}%`, background: color }} />
        {target ? <b style={{ width: `${target}%` }} /> : null}
      </div>
      <strong>{value.toFixed ? value.toFixed(1) : value}%</strong>
    </div>
  );
}

function normalizeTargetRows(rows) {
  return rows.map((row) => ({
    ...row,
    target: Number(row.target),
    tolerance: Number(row.tolerance),
    threshold: Number(row.threshold),
  }));
}

function AllocationTargetsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [group, setGroup] = useState('Asset Class');
  const [rowsByGroup, setRowsByGroup] = useState(targetGroups);
  const rows = rowsByGroup[group];
  const normalizedRows = useMemo(() => normalizeTargetRows(rows), [rows]);
  const totalTarget = normalizedRows.reduce((sum, row) => sum + row.target, 0);
  const warnings = normalizedRows.filter((row) => Math.abs(row.current - row.target) > row.tolerance);
  const driftRows = normalizedRows.map((row) => ({
    ...row,
    drift: row.current - row.target,
    outOfTolerance: Math.abs(row.current - row.target) > row.tolerance,
    needsReview: Math.abs(row.current - row.target) > row.threshold,
  }));

  const updateRow = (index, field, value) => {
    setRowsByGroup((current) => ({
      ...current,
      [group]: current[group].map((row, rowIndex) => (
        rowIndex === index ? { ...row, [field]: value } : row
      )),
    }));
  };

  const resetGroup = () => {
    setRowsByGroup((current) => ({ ...current, [group]: targetGroups[group] }));
  };

  const saveTargets = () => runAction(APP_ACTIONS.SAVE_ALLOCATION_TARGETS, {
    modelName: `${group} Policy Model`,
    group,
    rows: normalizedRows,
    totalTarget,
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard allocation-page allocation-targets-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Targets</h1>
          <div className="market-brief"><span></span><b>Allocation</b><p>Target weights, tolerance bands, and drift policy</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="allocation-target-toolbar card">
          <div className="target-group-tabs">
            {Object.keys(targetGroups).map((item) => (
              <button className={group === item ? 'active' : ''} key={item} onClick={() => setGroup(item)} type="button">
                {item}
              </button>
            ))}
          </div>
          <div className="target-toolbar-actions">
            <button onClick={resetGroup} type="button"><Undo2 size={16} />Reset</button>
            <button disabled={pendingAction === APP_ACTIONS.SAVE_ALLOCATION_TARGETS} onClick={saveTargets} type="button"><Save size={16} />Save Model</button>
          </div>
        </section>

        <section className="allocation-target-summary-grid">
          <article className="card target-summary-card">
            <span>Total target</span>
            <strong className={Math.abs(totalTarget - 100) > 0.01 ? 'red' : ''}>{totalTarget.toFixed(1)}%</strong>
            <small>{Math.abs(totalTarget - 100) > 0.01 ? 'Target model should total 100%' : 'Policy model is balanced'}</small>
          </article>
          <article className="card target-summary-card">
            <span>Out of tolerance</span>
            <strong>{warnings.length}</strong>
            <small>Rows outside policy bands</small>
          </article>
          <article className="card target-summary-card">
            <span>Largest drift</span>
            <strong>{driftRows.reduce((max, row) => Math.abs(row.drift) > Math.abs(max.drift) ? row : max, driftRows[0]).name}</strong>
            <small>{driftRows.reduce((max, row) => Math.abs(row.drift) > Math.abs(max.drift) ? row : max, driftRows[0]).drift.toFixed(1)} pts from target</small>
          </article>
          <article className="card target-summary-card">
            <span>Model scope</span>
            <strong>{group}</strong>
            <small>{rows.length} editable policy rows</small>
          </article>
        </section>

        <section className="allocation-targets-grid">
          <article className="card target-editor-card">
            <div className="allocation-card-head">
              <h3>Policy Allocation Editor</h3>
              <div><span className="dot green-dot-solid" />Current <span className="dot gray-dot-solid" />Target</div>
            </div>
            <div className="target-editor-table">
              <div className="target-editor-head"><span>Name</span><span>Current</span><span>Target</span><span>Tolerance</span><span>Drift threshold</span><span>Status</span></div>
              {driftRows.map((row, index) => (
                <div className="target-editor-row" key={row.name}>
                  <span><i style={{ background: row.color }} />{row.name}</span>
                  <strong>{row.current.toFixed(1)}%</strong>
                  <label><input min="0" max="100" onChange={(event) => updateRow(index, 'target', event.target.value)} step="0.5" type="number" value={rows[index].target} /><b>%</b></label>
                  <label><input min="0" max="25" onChange={(event) => updateRow(index, 'tolerance', event.target.value)} step="0.5" type="number" value={rows[index].tolerance} /><b>pts</b></label>
                  <label><input min="0" max="25" onChange={(event) => updateRow(index, 'threshold', event.target.value)} step="0.5" type="number" value={rows[index].threshold} /><b>pts</b></label>
                  <em className={row.outOfTolerance ? 'red' : row.needsReview ? 'orange' : 'green'}>
                    {row.outOfTolerance ? 'Outside band' : row.needsReview ? 'Review drift' : 'In range'}
                  </em>
                </div>
              ))}
            </div>
          </article>

          <article className="card target-drift-card">
            <div className="allocation-card-head">
              <h3>Current vs Target Drift</h3>
              <Target size={22} />
            </div>
            <div className="target-drift-list">
              {driftRows.map((row) => (
                <div className="target-drift-row" key={row.name}>
                  <div><span>{row.name}</span><small>{row.current.toFixed(1)}% current / {row.target.toFixed(1)}% target</small></div>
                  <div className="target-drift-track">
                    <i style={{ width: `${Math.min(100, row.current)}%`, background: row.color }} />
                    <b style={{ left: `${Math.min(100, row.target)}%` }} />
                  </div>
                  <strong className={row.drift > 0 ? 'red' : row.drift < 0 ? 'green' : ''}>{row.drift > 0 ? '+' : ''}{row.drift.toFixed(1)} pts</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="allocation-warning-grid">
          <article className="card target-warning-card">
            <div className="allocation-card-head">
              <h3>Out-of-Tolerance Warnings</h3>
              <AlertTriangle size={22} />
            </div>
            {warnings.length > 0 ? warnings.map((row) => (
              <div className="target-warning-row" key={row.name}>
                <span>{row.name}</span>
                <b>{Math.abs(row.current - row.target).toFixed(1)} pts drift</b>
                <small>Tolerance band: +/-{row.tolerance.toFixed(1)} pts</small>
              </div>
            )) : <StatusState title="All rows within tolerance" message="No allocation policy row is currently outside its tolerance band." />}
          </article>

          <article className="card target-policy-card">
            <h3>Policy Allocation Table</h3>
            <div className="target-policy-table">
              {driftRows.map((row) => (
                <div key={row.name}>
                  <span>{row.name}</span>
                  <strong>{row.target.toFixed(1)}%</strong>
                  <small>Band {(row.target - row.tolerance).toFixed(1)}% - {(row.target + row.tolerance).toFixed(1)}%</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function money(value) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function AllocationRebalancePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [cashOnly, setCashOnly] = useState(false);
  const [sellRequired, setSellRequired] = useState(true);
  const [taxAware, setTaxAware] = useState(true);
  const [minTradeSize, setMinTradeSize] = useState(2500);

  const planRows = useMemo(() => {
    return rebalanceTradeRows
      .filter((row) => sellRequired || row.action !== 'Sell')
      .map((row) => {
        const taxAdjustedAmount = taxAware && row.taxable ? row.amount * 0.72 : row.amount;
        const cashAdjustedAmount = cashOnly && row.action === 'Buy' ? Math.min(row.amount, 4850) : taxAdjustedAmount;
        return {
          ...row,
          amount: Math.round(cashAdjustedAmount),
          tax: taxAware ? row.tax : 0,
          fee: row.action === 'Hold' ? 0 : row.fee,
        };
      })
      .filter((row) => row.action === 'Hold' || Math.abs(row.amount) >= minTradeSize);
  }, [cashOnly, minTradeSize, sellRequired, taxAware]);

  const totals = useMemo(() => {
    const buys = planRows.filter((row) => row.action === 'Buy').reduce((sum, row) => sum + row.amount, 0);
    const sells = planRows.filter((row) => row.action === 'Sell').reduce((sum, row) => sum + Math.abs(row.amount), 0);
    const fees = planRows.reduce((sum, row) => sum + row.fee, 0);
    const taxes = planRows.reduce((sum, row) => sum + row.tax, 0);
    return {
      buys,
      sells,
      fees,
      taxes,
      netCash: sells - buys - fees - taxes,
      tradeCount: planRows.filter((row) => row.action !== 'Hold').length,
    };
  }, [planRows]);

  const exportRows = planRows.map((row) => ({
    Action: row.action,
    Ticker: row.ticker,
    Asset: row.asset,
    CurrentWeight: `${row.current.toFixed(1)}%`,
    TargetWeight: `${row.target.toFixed(1)}%`,
    Drift: `${row.drift > 0 ? '+' : ''}${row.drift.toFixed(1)} pts`,
    Amount: money(row.amount),
    EstimatedFee: `$${row.fee.toFixed(2)}`,
    EstimatedTax: `$${row.tax.toFixed(2)}`,
    AfterTradeWeight: `${row.after.toFixed(1)}%`,
  }));
  const hiddenRowSlots = Math.max(0, rebalanceTradeRows.length - planRows.length);
  const afterAllocationRows = planRows.filter((row) => row.action !== 'Hold');
  const hiddenAfterSlots = Math.max(0, rebalanceTradeRows.filter((row) => row.action !== 'Hold').length - afterAllocationRows.length);

  const applyPlan = () => runAction(APP_ACTIONS.APPLY_REBALANCE_PLAN, {
    planName: 'Core Portfolio Rebalance',
    controls: { cashOnly, sellRequired, taxAware, minTradeSize },
    trades: exportRows,
  });

  const exportPlan = () => runAction(APP_ACTIONS.DOWNLOAD_REPORT, {
    reportName: 'Rebalance Plan',
    type: 'CSV',
    rows: exportRows,
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard allocation-page allocation-rebalance-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Rebalance</h1>
          <div className="market-brief"><span></span><b>Allocation</b><p>Suggested trades to bring the portfolio back to target</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="rebalance-control-card card">
          <div className="rebalance-control-head">
            <div><SlidersHorizontal size={22} /><strong>Plan Controls</strong></div>
            <div className="rebalance-page-actions">
              <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={exportPlan} type="button"><Download size={16} />Export</button>
              <button disabled={pendingAction === APP_ACTIONS.APPLY_REBALANCE_PLAN} onClick={applyPlan} type="button"><Play size={16} />Apply Plan</button>
            </div>
          </div>
          <div className="rebalance-control-grid">
            <label className="toggle-control"><input checked={cashOnly} onChange={(event) => setCashOnly(event.target.checked)} type="checkbox" /><span>Cash-only buys</span></label>
            <label className="toggle-control"><input checked={sellRequired} onChange={(event) => setSellRequired(event.target.checked)} type="checkbox" /><span>Allow sells</span></label>
            <label className="toggle-control"><input checked={taxAware} onChange={(event) => setTaxAware(event.target.checked)} type="checkbox" /><span>Tax-aware</span></label>
            <label className="trade-size-control"><span>Minimum trade size</span><input max="10000" min="0" onChange={(event) => setMinTradeSize(Number(event.target.value))} step="500" type="range" value={minTradeSize} /><b>{money(minTradeSize)}</b></label>
          </div>
        </section>

        <section className="rebalance-summary-grid">
          <article className="card rebalance-summary-tile"><span>Suggested trades</span><strong>{totals.tradeCount}</strong><small>{planRows.length} rows after filters</small></article>
          <article className="card rebalance-summary-tile"><span>Buy orders</span><strong>{money(totals.buys)}</strong><small>New capital deployed</small></article>
          <article className="card rebalance-summary-tile"><span>Sell orders</span><strong>{money(totals.sells)}</strong><small>Gross proceeds</small></article>
          <article className="card rebalance-summary-tile"><span>Net cash impact</span><strong className={totals.netCash < 0 ? 'red' : ''}>{money(totals.netCash)}</strong><small>After fees and tax estimate</small></article>
        </section>

        <section className="rebalance-plan-grid">
          <article className="card rebalance-plan-card">
            <div className="allocation-card-head">
              <h3>Suggested Trades</h3>
              <div><span className="dot green-dot-solid" />Buy <span className="dot red-dot-solid" />Sell</div>
            </div>
            <div className="rebalance-plan-table">
              <div className="rebalance-plan-head"><span>Action</span><span>Ticker</span><span>Asset</span><span>Current</span><span>Target</span><span>Drift</span><span>Amount</span><span>After</span></div>
              {planRows.map((row) => (
                <div className="rebalance-plan-row" key={`${row.ticker}-${row.action}`}>
                  <span><b className={row.action.toLowerCase()}>{row.action}</b></span>
                  <strong>{row.ticker}</strong>
                  <span>{row.asset}</span>
                  <span>{row.current.toFixed(1)}%</span>
                  <span>{row.target.toFixed(1)}%</span>
                  <em className={row.drift > 0 ? 'red' : row.drift < 0 ? 'green' : ''}>{row.drift > 0 ? '+' : ''}{row.drift.toFixed(1)} pts</em>
                  <strong className={row.amount < 0 ? 'red' : row.amount > 0 ? 'green' : ''}>{money(row.amount)}</strong>
                  <span>{row.after.toFixed(1)}%</span>
                </div>
              ))}
              {Array.from({ length: hiddenRowSlots }).map((_, index) => (
                <div aria-hidden="true" className="rebalance-plan-row placeholder" key={`placeholder-${index}`} />
              ))}
            </div>
          </article>

          <article className="card rebalance-impact-card">
            <h3>Estimated Impact</h3>
            <div className="impact-row"><span>Estimated fees</span><strong>${totals.fees.toFixed(2)}</strong></div>
            <div className="impact-row"><span>Tax impact</span><strong>${totals.taxes.toFixed(2)}</strong></div>
            <div className="impact-row"><span>Cash after trade</span><strong>{money(4850 + totals.netCash)}</strong></div>
            <div className="after-allocation">
              {afterAllocationRows.map((row) => (
                <div key={row.ticker}>
                  <span>{row.ticker}</span>
                  <i><b style={{ width: `${Math.min(100, row.after * 9)}%` }} /></i>
                  <strong>{row.after.toFixed(1)}%</strong>
                </div>
              ))}
              {Array.from({ length: hiddenAfterSlots }).map((_, index) => (
                <div aria-hidden="true" className="placeholder" key={`after-placeholder-${index}`} />
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default function AllocationPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const trendRange = useSelection('6M');

  if (activeSidebarItem === 'allocation-targets') {
    return <AllocationTargetsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'allocation-rebalance') {
    return <AllocationRebalancePage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
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
