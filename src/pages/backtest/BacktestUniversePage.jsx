import { useState } from 'react';
import { Plus, Save, Search, ShieldCheck, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getBacktestData, getTickerStrip } from '../../data/mock/selectors';
import { DropdownField } from './BacktestPageShared.jsx';

const tickerStrip = getTickerStrip();
const backtestData = getBacktestData();
const universeCatalog = backtestData.universeCatalog;
const universePresets = backtestData.universePresets;

export default function BacktestUniversePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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
