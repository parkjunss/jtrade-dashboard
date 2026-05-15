import { useState } from 'react';
import { Download, Eye, Waypoints } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getOptionsInsightsData, getTickerStrip } from '../../data/mock/selectors';

const tickerStrip = getTickerStrip();
const optionsData = getOptionsInsightsData();

function OptionsSummaryCard({ item }) {
  return (
    <article className={`card options-summary-card ${item.tone}`}>
      <div className="options-summary-icon"><Waypoints size={24} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

export default function OptionsInsightsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [selectedSymbol, setSelectedSymbol] = useState(optionsData.flowRows[0].symbol);
  const expiryRange = useSelection('All');
  const selectedFlow = optionsData.flowRows.find((row) => row.symbol === selectedSymbol) ?? optionsData.flowRows[0];
  const visibleExpiries = expiryRange.isSelected('All') ? optionsData.expiryRows : optionsData.expiryRows.filter((row) => row.expiry === expiryRange.value);
  const exportRows = optionsData.flowRows.map((row) => ({
    Symbol: row.symbol,
    Sentiment: row.sentiment,
    'Call Premium': `$${row.callPremium}M`,
    'Put Premium': `$${row.putPremium}M`,
    'Put/Call': row.putCall,
    'IV Rank': `${row.ivRank}%`,
    'Expected Move': row.expectedMove,
    'Max Pain': row.maxPain,
    'Gamma Wall': row.gammaWall,
    Expiry: row.expiry,
    Pressure: row.pressure,
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard insights-page options-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Options</h1>
          <div className="market-brief"><span></span><b>Insights</b><p>Options flow, expiry pressure, IV skew, gamma exposure, and expected move.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="options-summary-grid">
          {optionsData.summary.map((item) => <OptionsSummaryCard item={item} key={item.label} />)}
        </section>

        <section className="options-layout">
          <article className="card options-flow-card">
            <div className="options-card-head">
              <h3>Options Flow Signal Board</h3>
              <div className="options-actions">
                <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Options Flow Signals', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
                <button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'OptionsFlow', symbol: selectedFlow.symbol })} type="button"><Eye size={16} />Details</button>
              </div>
            </div>
            <div className="options-flow-table">
              <div className="options-flow-head"><span>Symbol</span><span>Bias</span><span>Call Premium</span><span>Put Premium</span><span>Put/Call</span><span>IV Rank</span><span>Expected Move</span><span>Pressure</span></div>
              {optionsData.flowRows.map((row) => (
                <button className={`options-flow-row ${selectedSymbol === row.symbol ? 'selected' : ''}`} key={row.symbol} onClick={() => setSelectedSymbol(row.symbol)} type="button">
                  <strong>{row.symbol}</strong>
                  <span className={row.sentiment === 'Bearish' ? 'red' : row.sentiment === 'Bullish' ? 'green' : ''}>{row.sentiment}</span>
                  <b>${row.callPremium}M</b>
                  <b>${row.putPremium}M</b>
                  <span>{row.putCall.toFixed(2)}</span>
                  <span>{row.ivRank}%</span>
                  <strong>{row.expectedMove}</strong>
                  <small>{row.pressure}</small>
                </button>
              ))}
            </div>
          </article>

          <aside className="options-detail-stack">
            <article className="card option-pressure-card">
              <div className="option-pressure-head">
                <div><span>{selectedFlow.symbol}</span><h3>{selectedFlow.sentiment} Options Setup</h3></div>
                <strong className={selectedFlow.sentiment === 'Bearish' ? 'red' : 'green'}>{selectedFlow.expectedMove}</strong>
              </div>
              <div className="option-pressure-grid">
                <div><span>Max Pain</span><b>{selectedFlow.maxPain}</b></div>
                <div><span>Gamma Wall</span><b>{selectedFlow.gammaWall}</b></div>
                <div><span>Expiry</span><b>{selectedFlow.expiry}</b></div>
                <div><span>Put/Call</span><b>{selectedFlow.putCall.toFixed(2)}</b></div>
              </div>
              <p>{selectedFlow.pressure}</p>
            </article>

            <article className="card option-skew-card">
              <h3>Premium Balance</h3>
              <div className="premium-bar">
                <i style={{ width: `${(selectedFlow.callPremium / (selectedFlow.callPremium + selectedFlow.putPremium)) * 100}%` }} />
                <b style={{ width: `${(selectedFlow.putPremium / (selectedFlow.callPremium + selectedFlow.putPremium)) * 100}%` }} />
              </div>
              <div className="premium-labels"><span>Calls ${selectedFlow.callPremium}M</span><span>Puts ${selectedFlow.putPremium}M</span></div>
            </article>
          </aside>
        </section>

        <section className="options-lower-grid">
          <article className="card expiry-card">
            <div className="options-card-head">
              <h3>Expiry Pressure</h3>
              <div className="time-tabs">
                {['All', ...optionsData.expiryRows.map((row) => row.expiry)].map((expiry) => (
                  <button className={expiryRange.isSelected(expiry) ? 'active' : ''} key={expiry} onClick={() => expiryRange.select(expiry)} type="button">{expiry}</button>
                ))}
              </div>
            </div>
            {visibleExpiries.map((row) => (
              <div className="expiry-row" key={row.expiry}>
                <strong>{row.expiry}</strong>
                <div><i style={{ width: `${row.callShare}%` }} /><b style={{ width: `${row.putShare}%` }} /></div>
                <span>{row.openInterest.toLocaleString('en-US')} OI</span>
                <em className={row.gamma < 0 ? 'red' : 'green'}>{row.gamma > 0 ? '+' : ''}${row.gamma.toFixed(1)}B gamma</em>
                <small>{row.expectedMove.toFixed(1)}% expected move</small>
              </div>
            ))}
          </article>

          <article className="card strike-card">
            <h3>Strike Map</h3>
            {optionsData.strikeRows.map((row) => (
              <div className="strike-row" key={row.strike}>
                <strong>{row.strike}</strong>
                <div><i style={{ width: `${Math.min(100, row.callOi / 1400)}%` }} /><b style={{ width: `${Math.min(100, row.putOi / 1400)}%` }} /></div>
                <span>{row.zone}</span>
                <em className={row.netGamma < 0 ? 'red' : 'green'}>{row.netGamma > 0 ? '+' : ''}{row.netGamma.toFixed(1)}</em>
              </div>
            ))}
          </article>
        </section>
      </main>
    </div>
  );
}
