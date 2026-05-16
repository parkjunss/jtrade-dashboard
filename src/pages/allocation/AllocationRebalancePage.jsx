import { useMemo, useState } from 'react';
import { CircleDollarSign, Download, Play, SlidersHorizontal } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getAllocationRebalanceTradeRows, getTickerStrip } from '../../data/mock/selectors';

const tickerStrip = getTickerStrip();
const rebalanceTradeRows = getAllocationRebalanceTradeRows();

export default function AllocationRebalancePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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


