import { useState } from 'react';
import { Bookmark, CheckCircle2, ChevronDown, Eye, Play, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import Modal from '../components/Modal.jsx';
import { APP_ACTIONS } from '../services/appActions';
import { getBacktestData, getTickerStrip } from '../data/mock/selectors';
import BacktestComparePage from './backtest/BacktestComparePage.jsx';
import BacktestParametersPage from './backtest/BacktestParametersPage.jsx';
import BacktestUniversePage from './backtest/BacktestUniversePage.jsx';
import { BacktestKpi, DropdownField } from './backtest/BacktestPageShared.jsx';

const tickerStrip = getTickerStrip();
const backtestData = getBacktestData();
const kpis = backtestData.kpis;
const allocationRows = backtestData.allocationRows;
const riskMetrics = backtestData.riskMetrics;
const tradeRows = backtestData.tradeRows;
const notes = backtestData.notes;

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

  if (activeSidebarItem === 'backtest-compare') {
    return <BacktestComparePage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
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

