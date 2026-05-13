import { Bookmark, CheckCircle2, ChevronDown, Eye, Play, Plus, Save, Search, ShieldCheck, X } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import Sparkline from '../components/Sparkline.jsx';
import { tickerStrip } from '../data/mockData';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import Modal from '../components/Modal.jsx';
import StatusState from '../components/StatusState.jsx';
import { APP_ACTIONS } from '../services/appActions';
import { useState, useEffect, useRef } from 'react';

const kpis = [
  { label: 'Total Return', value: '+148.3%', tone: 'green', series: [18, 21, 20, 24, 23, 26, 28] },
  { label: 'CAGR', value: '19.6%', tone: 'green', series: [15, 16, 18, 17, 20, 22, 24] },
  { label: 'Max Drawdown', value: '-12.4%', tone: 'red', series: [24, 22, 23, 20, 21, 19, 20] },
  { label: 'Sharpe Ratio', value: '1.46', tone: 'neutral', series: [14, 16, 18, 17, 20, 23, 25] },
  { label: 'Win Rate', value: '63%', tone: 'green', series: [16, 15, 19, 18, 21, 20, 22] },
  { label: 'Final Value', value: '$248,300', tone: 'neutral', series: [12, 15, 14, 18, 17, 22, 24] },
];

const allocationRows = [
  ['NVDA', '26%', '#47b51e'],
  ['MSFT', '22%', '#3478db'],
  ['SPY', '18%', '#8f62d9'],
  ['QQQ', '17%', '#f7a600'],
  ['TLT', '15%', '#25b6bd'],
];

const riskMetrics = [
  ['Sharpe Ratio', '1.46'],
  ['Volatility', '14.2%'],
  ['Beta', '0.91'],
  ['Alpha', '9.4%'],
  ['Calmar Ratio', '1.58'],
];

const tradeRows = [
  ['May 1, 2025', 'Buy', 'NVDA', '$122.48', '220', 'Momentum breakout'],
  ['May 1, 2025', 'Buy', 'MSFT', '$415.62', '120', 'Rebalance'],
  ['May 1, 2025', 'Sell', 'QQQ', '$482.10', '80', 'Rebalance'],
  ['May 1, 2025', 'Buy', 'TLT', '$92.34', '430', 'Risk adj. +tail'],
  ['May 1, 2025', 'Buy', 'SPY', '$501.21', '90', 'Core allocation'],
];

const notes = [
  'Monthly rebalanced based on 12M momentum ranking.',
  'Hold top 3 momentum assets + SPY + defensive allocation (TLT).',
  'Risk filter: 97% VaR < 20% NAV, de-leverage TLT drawdowns.',
  'Transaction fee: 0.05% per trade (market assumption).',
  'Benchmark: S&P 500 Total Return.',
];

const universeCatalog = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'Stock', sector: 'Technology', assetClass: 'Equity', liquidity: 98, coverage: 99, missing: 0 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'Stock', sector: 'Technology', assetClass: 'Equity', liquidity: 96, coverage: 99, missing: 0 },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', sector: 'Technology', assetClass: 'Equity', liquidity: 97, coverage: 99, missing: 0 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock', sector: 'Consumer Discretionary', assetClass: 'Equity', liquidity: 94, coverage: 98, missing: 1 },
  { symbol: 'GOOG', name: 'Alphabet Inc.', type: 'Stock', sector: 'Communication Services', assetClass: 'Equity', liquidity: 93, coverage: 98, missing: 1 },
  { symbol: 'JPM', name: 'JPMorgan Chase', type: 'Stock', sector: 'Financials', assetClass: 'Equity', liquidity: 90, coverage: 97, missing: 2 },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', type: 'ETF', sector: 'Energy', assetClass: 'ETF', liquidity: 86, coverage: 96, missing: 3 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF', sector: 'Broad Market', assetClass: 'ETF', liquidity: 99, coverage: 99, missing: 0 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', sector: 'Broad Market', assetClass: 'ETF', liquidity: 99, coverage: 99, missing: 0 },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'ETF', sector: 'Fixed Income', assetClass: 'Bond', liquidity: 88, coverage: 98, missing: 1 },
  { symbol: 'EWY', name: 'iShares MSCI South Korea ETF', type: 'ETF', sector: 'International', assetClass: 'ETF', liquidity: 74, coverage: 93, missing: 4 },
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'ETF', sector: 'Commodities', assetClass: 'Alternative', liquidity: 84, coverage: 97, missing: 2 },
];

const universePresets = {
  'Momentum Core': ['NVDA', 'MSFT', 'SPY', 'QQQ', 'TLT'],
  'ETF Rotation': ['SPY', 'QQQ', 'TLT', 'EWY', 'GLD', 'XLE'],
  'Mega Cap Tech': ['NVDA', 'MSFT', 'AAPL', 'AMZN', 'GOOG'],
};

const defaultBacktestParams = {
  dateRange: 'Jan 2020 - May 2025',
  startDate: '2020-01-01',
  endDate: '2025-05-31',
  initialCapital: 100000,
  feePct: 0.05,
  slippagePct: 0.03,
  rebalance: 'Monthly',
  strategy: 'Momentum Rotation',
  weightMode: 'Risk parity',
  momentumWindow: 12,
  maxPosition: 28,
  stopLoss: 12,
  volatilityTarget: 14,
};

const dateRangeOptions = ['1Y', '3Y', '5Y', 'Jan 2020 - May 2025', 'Custom Range'];
const cadenceOptions = ['None', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const strategyOptions = ['Momentum Rotation', 'Mean Reversion', 'Value Investing'];
const weightModeOptions = ['Equal weight', 'Risk parity', 'Market cap', 'Momentum score'];

function BacktestKpi({ item }) {
  return (
    <article className="card backtest-kpi">
      <span>{item.label}</span>
      <strong className={item.tone}>{item.value}</strong>
      {/* <Sparkline data={item.series} danger={item.tone === 'red'} /> */}
    </article>
  );
}

function DropdownField({ label, options, selection }) {
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
    <div className={`dropdown-wrap backtest-field ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <label>{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)}>
        {selection.value} <ChevronDown size={15} />
      </button>
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

function BacktestUniversePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [included, setIncluded] = useState(universePresets['Momentum Core']);
  const [excluded, setExcluded] = useState(['TSLA']);
  const [query, setQuery] = useState('');
  const typeFilter = useSelection('All');
  const sectorFilter = useSelection('All');
  const assetFilter = useSelection('All');
  const benchmarkSelection = useSelection('S&P 500');
  const [presetName, setPresetName] = useState('Momentum Core');
  const [savedPresets, setSavedPresets] = useState(universePresets);

  const sectors = ['All', ...Array.from(new Set(universeCatalog.map((item) => item.sector)))];
  const assetClasses = ['All', ...Array.from(new Set(universeCatalog.map((item) => item.assetClass)))];
  const filteredCatalog = universeCatalog.filter((item) => {
    const matchesQuery = `${item.symbol} ${item.name}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter.value === 'All' || item.type === typeFilter.value;
    const matchesSector = sectorFilter.value === 'All' || item.sector === sectorFilter.value;
    const matchesAsset = assetFilter.value === 'All' || item.assetClass === assetFilter.value;
    return matchesQuery && matchesType && matchesSector && matchesAsset;
  });
  const selectedRows = included.map((symbol) => universeCatalog.find((item) => item.symbol === symbol)).filter(Boolean);
  const avgCoverage = selectedRows.length ? selectedRows.reduce((sum, item) => sum + item.coverage, 0) / selectedRows.length : 0;
  const avgLiquidity = selectedRows.length ? selectedRows.reduce((sum, item) => sum + item.liquidity, 0) / selectedRows.length : 0;
  const missingWarnings = selectedRows.filter((item) => item.missing >= 3);

  const addSymbol = (symbol) => {
    setExcluded((current) => current.filter((item) => item !== symbol));
    setIncluded((current) => current.includes(symbol) ? current : [...current, symbol]);
  };

  const excludeSymbol = (symbol) => {
    setIncluded((current) => current.filter((item) => item !== symbol));
    setExcluded((current) => current.includes(symbol) ? current : [...current, symbol]);
  };

  const loadPreset = (name) => {
    setPresetName(name);
    setIncluded(savedPresets[name] ?? []);
  };

  const savePreset = async () => {
    const name = presetName.trim() || 'Custom Universe';
    await runAction(APP_ACTIONS.SAVE_UNIVERSE_PRESET, { name, symbols: included, excluded, benchmark: benchmarkSelection.value });
    setSavedPresets((current) => ({ ...current, [name]: included }));
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard backtest-page backtest-universe-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Universe</h1>
          <div className="market-brief"><span></span><b>Backtest</b><p>Build the eligible assets and benchmark set</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="universe-summary-grid">
          <article className="card universe-kpi"><span>Universe size</span><strong>{included.length}</strong><small>Included tradable assets</small></article>
          <article className="card universe-kpi"><span>Data coverage</span><strong>{avgCoverage.toFixed(1)}%</strong><small>Average history coverage</small></article>
          <article className="card universe-kpi"><span>Liquidity score</span><strong>{avgLiquidity.toFixed(0)}/100</strong><small>Average daily liquidity proxy</small></article>
          <article className="card universe-kpi"><span>Missing data warnings</span><strong>{missingWarnings.length}</strong><small>Assets need review</small></article>
        </section>

        <section className="universe-builder-grid">
          <article className="card universe-builder-card">
            <div className="universe-card-head">
              <h3>Universe Builder</h3>
              <div className="universe-save-controls">
                <input onChange={(event) => setPresetName(event.target.value)} value={presetName} />
                <button disabled={pendingAction === APP_ACTIONS.SAVE_UNIVERSE_PRESET} onClick={savePreset} type="button"><Save size={16} />Save</button>
              </div>
            </div>
            <div className="universe-filters">
              <label className="universe-search"><Search size={16} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Search symbols or companies..." value={query} /></label>
              <DropdownField label="Type" options={['All', 'Stock', 'ETF']} selection={typeFilter} />
              <DropdownField label="Sector" options={sectors} selection={sectorFilter} />
              <DropdownField label="Asset Class" options={assetClasses} selection={assetFilter} />
            </div>
            <div className="universe-catalog-table">
              <div className="universe-catalog-head"><span>Symbol</span><span>Name</span><span>Type</span><span>Sector</span><span>Coverage</span><span>Liquidity</span><span>Action</span></div>
              {filteredCatalog.map((item) => (
                <div className="universe-catalog-row" key={item.symbol}>
                  <strong>{item.symbol}</strong>
                  <span>{item.name}</span>
                  <span>{item.type}</span>
                  <span>{item.sector}</span>
                  <b>{item.coverage}%</b>
                  <b>{item.liquidity}</b>
                  {included.includes(item.symbol) ? (
                    <button onClick={() => excludeSymbol(item.symbol)} type="button"><X size={14} />Exclude</button>
                  ) : (
                    <button onClick={() => addSymbol(item.symbol)} type="button"><Plus size={14} />Include</button>
                  )}
                </div>
              ))}
            </div>
          </article>

          <aside className="universe-side-stack">
            <article className="card universe-panel">
              <h3>Presets</h3>
              <div className="universe-preset-list">
                {Object.keys(savedPresets).map((name) => (
                  <button className={presetName === name ? 'active' : ''} key={name} onClick={() => loadPreset(name)} type="button">
                    <span>{name}</span><b>{savedPresets[name].length} assets</b>
                  </button>
                ))}
              </div>
            </article>

            <article className="card universe-panel">
              <h3>Benchmark</h3>
              <DropdownField label="Benchmark" options={['S&P 500', 'Nasdaq 100', '60/40 Portfolio', 'MSCI ACWI', 'None']} selection={benchmarkSelection} />
            </article>

            <article className="card universe-panel">
              <h3>Include / Exclude</h3>
              <div className="universe-chip-block">
                <span>Included</span>
                <div>{included.map((symbol) => <button key={symbol} onClick={() => excludeSymbol(symbol)} type="button">{symbol}<X size={13} /></button>)}</div>
              </div>
              <div className="universe-chip-block excluded">
                <span>Excluded</span>
                <div>{excluded.map((symbol) => <button key={symbol} onClick={() => addSymbol(symbol)} type="button">{symbol}<Plus size={13} /></button>)}</div>
              </div>
            </article>
          </aside>
        </section>

        <section className="universe-detail-grid">
          <article className="card universe-panel selected-assets-card">
            <h3>Selected Assets</h3>
            <div className="selected-assets-table">
              {selectedRows.map((item) => (
                <div key={item.symbol}><strong>{item.symbol}</strong><span>{item.assetClass}</span><span>{item.sector}</span><b>{item.coverage}% coverage</b><em className={item.missing >= 3 ? 'red' : ''}>{item.missing} missing</em></div>
              ))}
            </div>
          </article>

          <article className="card universe-panel warnings-card">
            <h3>Eligibility Warnings</h3>
            {missingWarnings.length > 0 ? missingWarnings.map((item) => (
              <p key={item.symbol}><ShieldCheck size={16} /><span>{item.symbol} has {item.missing} missing data windows and {item.liquidity}/100 liquidity.</span></p>
            )) : <StatusState title="Eligibility checks passed" message="All selected assets pass current liquidity and coverage checks." />}
          </article>
        </section>
      </main>
    </div>
  );
}

function BacktestParametersPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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

export default function BacktestPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const equityRange = useSelection('All');
  const dateRange = useSelection('Jan 2020 - May 2025');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [lastRun, setLastRun] = useState('Not run in this session');
  const [runCount, setRunCount] = useState(0);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const strategyDropdown = useSelection('Momentum Rotation');
  const rebalanceDropdown = useSelection('Monthly');
  const [assets, setAssets] = useState(['NVDA', 'MSFT', 'SPY', 'QQQ', 'TLT']);
  const initialCapital = useSelection('$100,000');
  const transactionFee = useSelection('0.05%');
  const benchmark = useSelection('S&P 500');

  const openModal = (title) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const removeAsset = (asset) => {
    setAssets(prev => prev.filter(a => a !== asset));
  };

  const handleRunBacktest = async () => {
    await runAction(APP_ACTIONS.RUN_BACKTEST, { strategy: strategyDropdown.value, dateRange: dateRange.value, assets });
    setRunCount((current) => current + 1);
    setLastRun(`Just now · ${dateRange.value}`);
  };

  const handleSaveStrategy = async () => {
    await runAction(APP_ACTIONS.SAVE_STRATEGY, { strategy: strategyDropdown.value, benchmark: benchmark.value });
    setSavedStrategies((current) => {
      const next = { name: strategyDropdown.value, benchmark: benchmark.value, dateRange: dateRange.value, assets: assets.join(', ') };
      return [next, ...current.filter((item) => item.name !== next.name)];
    });
    openModal('Saved Strategies');
  };

  const handleCompare = async () => {
    await runAction(APP_ACTIONS.COMPARE_BACKTEST, { benchmark: benchmark.value, strategy: strategyDropdown.value });
    openModal('Strategy Compare');
  };

  const equityPoints = equityRange.isSelected('1W')
    ? '0,190 180,176 360,142 540,130 720,92 900,64 980,48'
    : equityRange.isSelected('1M')
      ? '0,210 120,195 240,154 360,126 480,154 600,142 720,72 840,80 980,30'
      : '0,210 80,195 160,178 240,154 320,126 400,116 480,154 560,142 640,110 720,72 800,80 880,52 980,30';

  if (activeSidebarItem === 'backtest-universe') {
    return <BacktestUniversePage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'backtest-parameters') {
    return <BacktestParametersPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem !== 'backtest-overview') {
    return <SubPageShell activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} fallbackTitle="Backtest" />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard backtest-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Backtest</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="backtest-layout">
          <div className="backtest-left">
            <article className="card backtest-controls">
              <DropdownField label="Strategy" options={['Momentum Rotation', 'Mean Reversion', 'Value Investing']} selection={strategyDropdown} />
              <div className="backtest-field assets-field">
                <label>Assets</label>
                <div className="tags-container">
                  {assets.map(asset => (
                    <b key={asset} onClick={() => removeAsset(asset)}>{asset} x</b>
                  ))}
                  <ChevronDown size={15} />
                </div>
              </div>
              <DropdownField label="Date Range" options={['1Y', '3Y', '5Y', 'Jan 2020 - May 2025', 'Custom Range']} selection={dateRange} />
              <DropdownField label="Initial Capital" options={['$10,000', '$50,000', '$100,000', '$250,000', '$1,000,000']} selection={initialCapital} />
              <DropdownField label="Rebalancing" options={['None', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']} selection={rebalanceDropdown} />
              <DropdownField label="Transaction Fee" options={['0.00%', '0.01%', '0.05%', '0.10%', '0.20%']} selection={transactionFee} />
              <DropdownField label="Benchmark" options={['None', 'S&P 500', 'Nasdaq 100', 'Dow Jones']} selection={benchmark} />
              <div className="backtest-actions">
                <button className="run-backtest" disabled={pendingAction === APP_ACTIONS.RUN_BACKTEST} onClick={handleRunBacktest} type="button"><Play size={16} />{pendingAction === APP_ACTIONS.RUN_BACKTEST ? 'Running...' : 'Run Backtest'}</button>
                <button disabled={pendingAction === APP_ACTIONS.SAVE_STRATEGY} onClick={handleSaveStrategy} type="button"><Bookmark size={16} />Save Strategy</button>
                <button disabled={pendingAction === APP_ACTIONS.COMPARE_BACKTEST} onClick={handleCompare} type="button"><Eye size={16} />Compare</button>
              </div>
              <p className="backtest-last-run">Last run: {lastRun}</p>
            </article>

            <section className="backtest-kpi-grid">
              {kpis.map((item) => <BacktestKpi item={item} key={item.label} />)}
            </section>

            <article className="card equity-card">
              <div className="backtest-card-head">
                <h3>Equity Curve vs Benchmark</h3>
                <div className="time-tabs">
                  {['1W', '1M', '3M', '1Y', 'All'].map(r => (
                    <button 
                      key={r} 
                      className={equityRange.isSelected(r) ? 'active' : ''} 
                      onClick={() => equityRange.select(r)}
                      type="button"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="backtest-legend"><span className="green-dot-solid" />Momentum Rotation <b>Total Return +148.3%</b><span className="gray-dot-solid" />S&P 500 <b>Total Return +63.2%</b></div>
              <svg className="equity-chart" viewBox="0 0 980 260" role="img" aria-label="Equity curve vs benchmark">
                {[45, 90, 135, 180, 225].map((y) => <line key={y} x1="0" x2="980" y1={y} y2={y} />)}
                <polyline className="equity-fill-line" points={equityPoints} />
                <polyline className="market-line" points="0,215 80,205 160,192 240,178 320,158 400,148 480,178 560,170 640,156 720,124 800,132 880,104 980,92" />
              </svg>
            </article>

            <section className="backtest-mini-grid">
              <article className="card backtest-mini-card drawdown-card">
                <div className="backtest-card-head"><h3>Drawdown</h3><em>Max DD -12.4%</em></div>
                <svg viewBox="0 0 320 150" className="mini-chart">
                  {[35, 70, 105].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} />)}
                  <polyline points="0,20 28,34 55,78 82,42 110,36 138,50 166,86 194,72 222,112 250,94 278,70 320,120" />
                </svg>
              </article>
              <article className="card backtest-mini-card rolling-card">
                <h3>Rolling Returns (12M)</h3>
                <svg viewBox="0 0 320 150" className="mini-chart">
                  {[35, 70, 105].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} />)}
                  <polyline className="portfolio-line" points="0,48 36,34 72,52 108,80 144,118 180,88 216,62 252,36 288,52 320,44" />
                  <polyline className="market-line" points="0,72 36,58 72,74 108,96 144,128 180,112 216,86 252,64 288,78 320,70" />
                </svg>
              </article>
              <article className="card backtest-mini-card yearly-card">
                <h3>Yearly Returns</h3>
                <div className="yearly-bars">
                  {[18.5, 32.8, -6.7, 24.7, 24.1, 13.1].map((value, idx) => (
                    <div key={idx}><b>{value}%</b><i className={value < 0 ? 'negative' : ''} style={{ height: `${Math.abs(value) * 2.1}px` }} /><span>{2020 + idx}</span></div>
                  ))}
                </div>
              </article>
            </section>

            <section className="backtest-bottom-grid">
              <article className="card trade-log-card">
                <h3>Trade Log</h3>
                <div className="trade-log-table">
                  <div className="trade-row trade-head"><span>Date</span><span>Action</span><span>Asset</span><span>Price</span><span>Shares</span><span>Reason</span></div>
                  {tradeRows.map(([date, action, asset, price, shares, reason]) => (
                    <div className="trade-row" key={`${asset}-${shares}`}>
                      <span>{date}</span><b className={action === 'Sell' ? 'red' : 'green'}>{action}</b><strong>{asset}</strong><span>{price}</span><span>{shares}</span><span>{reason}</span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="card strategy-notes-card">
                <h3>Strategy Notes</h3>
                {notes.map((note) => <p key={note}><CheckCircle2 size={17} />{note}</p>)}
              </article>
            </section>
          </div>

          <aside className="backtest-right">
            <article className="card backtest-allocation-card">
              <div className="backtest-card-head">
                <h3>Portfolio Allocation</h3>
                <button type="button" onClick={() => openModal('Allocation Details')}>View Details <ChevronDown size={14} /></button>
              </div>
              <div className="backtest-allocation-content">
                <div className="backtest-donut"><strong>$248,300</strong><span>Total Value</span></div>
                <div className="backtest-allocation-list">
                  {allocationRows.map(([name, weight, color]) => <div key={name}><i style={{ background: color }} /><span>{name}</span><strong>{weight}</strong></div>)}
                </div>
              </div>
            </article>

            <article className="card backtest-risk-card">
              <h3>Risk Metrics</h3>
              {riskMetrics.map(([label, value]) => (
                <div className="backtest-risk-row" key={label}><ShieldCheck size={17} /><span>{label}</span><strong>{value}</strong></div>
              ))}
            </article>

            <article className="card risk-return-card">
              <h3>Risk vs Return</h3>
              <p>Annual Return vs Annualized Volatility</p>
              <div className="risk-scatter">
                <span className="point portfolio" style={{ left: '48%', bottom: '58%' }}>Portfolio</span>
                <span className="point nvda" style={{ left: '78%', bottom: '76%' }}>NVDA</span>
                <span className="point msft" style={{ left: '59%', bottom: '46%' }}>MSFT</span>
                <span className="point spy" style={{ left: '45%', bottom: '39%' }}>SPY</span>
                <span className="point qqq" style={{ left: '74%', bottom: '56%' }}>QQQ</span>
                <span className="point tlt" style={{ left: '20%', bottom: '20%' }}>TLT</span>
                <span className="point benchmark" style={{ left: '39%', bottom: '31%' }}>S&P 500</span>
              </div>
              <div className="scatter-legend"><span>Portfolio</span><span>NVDA</span><span>MSFT</span><span>SPY</span><span>QQQ</span><span>TLT</span><span>S&P 500</span></div>
            </article>
          </aside>
        </section>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        {modalTitle === 'Saved Strategies' ? (
          <div className="backtest-modal-list">
            {(savedStrategies.length ? savedStrategies : [{ name: strategyDropdown.value, benchmark: benchmark.value, dateRange: dateRange.value, assets: assets.join(', ') }]).map((item) => (
              <div key={item.name}><b>{item.name}</b><span>{item.dateRange}</span><strong>{item.benchmark}</strong><small>{item.assets}</small></div>
            ))}
          </div>
        ) : modalTitle === 'Strategy Compare' ? (
          <div className="backtest-compare-grid">
            <div><span>Current Strategy</span><b>{strategyDropdown.value}</b><strong>+{148.3 + runCount * 1.7}%</strong></div>
            <div><span>Benchmark</span><b>{benchmark.value}</b><strong>+63.2%</strong></div>
            <div><span>Delta</span><b>Outperformance</b><strong>+{(85.1 + runCount * 1.7).toFixed(1)}%</strong></div>
          </div>
        ) : (
          <div className="modal-placeholder"><p>Detailed breakdown for <b>{modalTitle}</b></p></div>
        )}
      </Modal>
    </div>
  );
}
