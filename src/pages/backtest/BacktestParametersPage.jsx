import { useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getBacktestData, getTickerStrip } from '../../data/mock/selectors';
import { cadenceOptions, dateRangeOptions, DropdownField, strategyOptions, weightModeOptions } from './BacktestPageShared.jsx';

const tickerStrip = getTickerStrip();
const backtestData = getBacktestData();
const defaultBacktestParams = backtestData.defaultParams;

export default function BacktestParametersPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [params, setParams] = useState(defaultBacktestParams);
  const dateRange = useSelection(params.dateRange);
  const rebalance = useSelection(params.rebalance);
  const strategy = useSelection(params.strategy);
  const weightMode = useSelection(params.weightMode);

  const mergedParams = {
    ...params,
    dateRange: dateRange.value,
    rebalance: rebalance.value,
    strategy: strategy.value,
    weightMode: weightMode.value,
  };

  const changedFields = Object.entries(mergedParams)
    .filter(([key, value]) => value !== defaultBacktestParams[key])
    .map(([key]) => key);

  const validationWarnings = [
    mergedParams.initialCapital < 10000 ? 'Initial capital should be at least $10,000 for stable position sizing.' : null,
    mergedParams.feePct > 0.2 ? 'Transaction fee is high enough to materially reduce CAGR.' : null,
    mergedParams.slippagePct > 0.25 ? 'Slippage assumption is above normal liquid-market ranges.' : null,
    mergedParams.maxPosition > 35 ? 'Max position limit is above diversification policy.' : null,
    mergedParams.stopLoss < 5 ? 'Stop-loss is tight and may over-trade in volatile regimes.' : null,
  ].filter(Boolean);

  const updateParam = (key, value) => {
    setParams((current) => ({ ...current, [key]: value }));
  };

  const resetDefaults = () => {
    setParams(defaultBacktestParams);
    dateRange.select(defaultBacktestParams.dateRange);
    rebalance.select(defaultBacktestParams.rebalance);
    strategy.select(defaultBacktestParams.strategy);
    weightMode.select(defaultBacktestParams.weightMode);
  };

  const saveParameters = () => runAction(APP_ACTIONS.SAVE_STRATEGY, {
    strategy: `${mergedParams.strategy} Parameters`,
    benchmark: 'S&P 500',
    parameters: mergedParams,
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard backtest-page backtest-parameters-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Parameters</h1>
          <div className="market-brief"><span></span><b>Backtest</b><p>Assumptions, strategy controls, and validation</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="parameter-toolbar card">
          <div>
            <strong>{mergedParams.strategy}</strong>
            <span>{changedFields.length} changed fields from default</span>
          </div>
          <div className="parameter-actions">
            <button onClick={resetDefaults} type="button">Reset Defaults</button>
            <button disabled={pendingAction === APP_ACTIONS.SAVE_STRATEGY} onClick={saveParameters} type="button"><Save size={16} />Save Parameters</button>
          </div>
        </section>

        <section className="parameter-layout">
          <div className="parameter-left">
            <article className="card parameter-card">
              <h3>Run Setup</h3>
              <div className="parameter-form-grid">
                <DropdownField label="Date Range" options={dateRangeOptions} selection={dateRange} />
                <label className="parameter-field"><span>Start Date</span><input onChange={(event) => updateParam('startDate', event.target.value)} type="date" value={params.startDate} /></label>
                <label className="parameter-field"><span>End Date</span><input onChange={(event) => updateParam('endDate', event.target.value)} type="date" value={params.endDate} /></label>
                <label className="parameter-field"><span>Initial Capital</span><input min="0" onChange={(event) => updateParam('initialCapital', Number(event.target.value))} step="10000" type="number" value={params.initialCapital} /></label>
                <label className="parameter-field"><span>Transaction Fee (%)</span><input min="0" onChange={(event) => updateParam('feePct', Number(event.target.value))} step="0.01" type="number" value={params.feePct} /></label>
                <label className="parameter-field"><span>Slippage (%)</span><input min="0" onChange={(event) => updateParam('slippagePct', Number(event.target.value))} step="0.01" type="number" value={params.slippagePct} /></label>
                <DropdownField label="Rebalance Cadence" options={cadenceOptions} selection={rebalance} />
              </div>
            </article>

            <article className="card parameter-card">
              <h3>Strategy Controls</h3>
              <div className="parameter-form-grid">
                <DropdownField label="Strategy" options={strategyOptions} selection={strategy} />
                <DropdownField label="Weight Mode" options={weightModeOptions} selection={weightMode} />
                <label className="parameter-slider"><span>Momentum Window</span><input max="24" min="3" onChange={(event) => updateParam('momentumWindow', Number(event.target.value))} type="range" value={params.momentumWindow} /><b>{params.momentumWindow} months</b></label>
                <label className="parameter-slider"><span>Max Position</span><input max="50" min="5" onChange={(event) => updateParam('maxPosition', Number(event.target.value))} type="range" value={params.maxPosition} /><b>{params.maxPosition}%</b></label>
                <label className="parameter-slider"><span>Stop Loss</span><input max="30" min="0" onChange={(event) => updateParam('stopLoss', Number(event.target.value))} type="range" value={params.stopLoss} /><b>{params.stopLoss}%</b></label>
                <label className="parameter-slider"><span>Volatility Target</span><input max="25" min="5" onChange={(event) => updateParam('volatilityTarget', Number(event.target.value))} type="range" value={params.volatilityTarget} /><b>{params.volatilityTarget}%</b></label>
              </div>
            </article>
          </div>

          <aside className="parameter-right">
            <article className="card parameter-summary-card">
              <h3>Current Parameter Set</h3>
              <div className="parameter-summary-list">
                <div><span>Date range</span><strong>{mergedParams.dateRange}</strong></div>
                <div><span>Capital</span><strong>${mergedParams.initialCapital.toLocaleString('en-US')}</strong></div>
                <div><span>Fees + slippage</span><strong>{(mergedParams.feePct + mergedParams.slippagePct).toFixed(2)}%</strong></div>
                <div><span>Rebalance</span><strong>{mergedParams.rebalance}</strong></div>
                <div><span>Weighting</span><strong>{mergedParams.weightMode}</strong></div>
                <div><span>Risk limit</span><strong>{mergedParams.maxPosition}% max position</strong></div>
              </div>
            </article>

            <article className="card parameter-summary-card">
              <h3>Changed Fields</h3>
              {changedFields.length > 0 ? (
                <div className="changed-field-list">
                  {changedFields.map((field) => <span key={field}>{field}</span>)}
                </div>
              ) : <StatusState title="Matches defaults" message="No parameter values have changed from the default set." />}
            </article>

            <article className="card parameter-summary-card">
              <h3>Validation Warnings</h3>
              {validationWarnings.length > 0 ? validationWarnings.map((warning) => (
                <p className="parameter-warning" key={warning}><ShieldCheck size={16} />{warning}</p>
              )) : <StatusState title="Assumptions in range" message="All backtest assumptions are within policy ranges." />}
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
