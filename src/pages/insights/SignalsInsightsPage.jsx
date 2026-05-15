import { useState } from 'react';
import { Activity, Download, Eye } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getSignalsInsightsData, getTickerStrip } from '../../data/mock/selectors';
import { signalPoints, toneClass } from './InsightPageShared.jsx';

const tickerStrip = getTickerStrip();
const signalsData = getSignalsInsightsData();

function SignalSummaryCard({ item }) {
  return (
    <article className={`card signal-summary-card ${item.tone}`}>
      <div className="signal-summary-icon"><Activity size={24} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

export default function SignalsInsightsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const categorySelection = useSelection('All');
  const [selectedSignalName, setSelectedSignalName] = useState(signalsData.signalRows[0].name);
  const visibleSignals = categorySelection.isSelected('All')
    ? signalsData.signalRows
    : signalsData.signalRows.filter((row) => row.category === categorySelection.value);
  const selectedSignal = visibleSignals.find((row) => row.name === selectedSignalName) ?? visibleSignals[0] ?? signalsData.signalRows[0];
  const exportRows = signalsData.signalRows.map((row) => ({
    Signal: row.name,
    Category: row.category,
    Status: row.status,
    Strength: row.strength,
    Confidence: row.confidence,
    Horizon: row.horizon,
    Driver: row.driver,
    Action: row.action,
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard insights-page signals-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Signals</h1>
          <div className="market-brief"><span></span><b>Insights</b><p>Technical, macro, and factor signals for portfolio decisions.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="signal-summary-grid">
          {signalsData.summary.map((item) => <SignalSummaryCard item={item} key={item.label} />)}
        </section>

        <section className="signals-workspace">
          <article className="card signal-board-card">
            <div className="signal-card-toolbar">
              <h3>Signal Board</h3>
              <div className="time-tabs">
                {signalsData.categories.map((category) => (
                  <button className={categorySelection.isSelected(category) ? 'active' : ''} key={category} onClick={() => categorySelection.select(category)} type="button">{category}</button>
                ))}
              </div>
            </div>
            <div className="signal-board-list">
              {visibleSignals.map((row) => (
                <button className={selectedSignal.name === row.name ? 'selected' : ''} key={row.name} onClick={() => setSelectedSignalName(row.name)} type="button">
                  <div>
                    <strong>{row.name}</strong>
                    <small>{row.category} - {row.horizon}</small>
                  </div>
                  <span className={toneClass(row.status)}>{row.status}</span>
                  <div className="signal-strength-bar"><i style={{ width: `${row.strength}%` }} /></div>
                  <b>{row.strength}</b>
                </button>
              ))}
            </div>
          </article>

          <aside className="signal-detail-stack">
            <article className="card signal-detail-card">
              <div className="signal-detail-head">
                <div><span>{selectedSignal.category}</span><h3>{selectedSignal.name}</h3></div>
                <strong className={toneClass(selectedSignal.status)}>{selectedSignal.status}</strong>
              </div>
              <div className="signal-detail-grid">
                <div><span>Strength</span><b>{selectedSignal.strength}/100</b></div>
                <div><span>Confidence</span><b>{selectedSignal.confidence}%</b></div>
                <div><span>Horizon</span><b>{selectedSignal.horizon}</b></div>
              </div>
              <p>{selectedSignal.driver}</p>
              <footer>
                <span>{selectedSignal.action}</span>
                <button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'Signal', signal: selectedSignal.name })} type="button"><Eye size={16} />Details</button>
              </footer>
            </article>

            <article className="card signal-trend-card">
              <h3>Signal Trend</h3>
              <svg viewBox="0 0 760 220" role="img" aria-label="Signal trend chart">
                {[50, 90, 130, 170].map((y) => <line key={y} x1="0" x2="760" y1={y} y2={y} />)}
                <polyline className="portfolio-line" points={signalPoints(signalsData.timeline, 'technical')} />
                <polyline className="market-line" points={signalPoints(signalsData.timeline, 'macro')} />
                <polyline className="factor-line" points={signalPoints(signalsData.timeline, 'factor')} />
              </svg>
              <div className="signal-legend"><span>Technical</span><b>Macro</b><em>Factor</em></div>
            </article>
          </aside>
        </section>

        <section className="signals-lower-grid">
          <article className="card technical-signal-card">
            <h3>Technical Signals</h3>
            {signalsData.technicalRows.map((row) => (
              <div className="technical-signal-row" key={row.symbol}>
                <strong>{row.symbol}<small>{row.signal}</small></strong>
                <div><i style={{ width: `${row.value}%` }} /></div>
                <span>{row.trigger}</span>
                <b>{row.stance}</b>
              </div>
            ))}
          </article>

          <article className="card macro-signal-card">
            <h3>Macro Signals</h3>
            {signalsData.macroRows.map((row) => (
              <button key={row.indicator} onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'MacroSignal', indicator: row.indicator })} type="button">
                <strong>{row.indicator}<small>{row.reading}</small></strong>
                <span className={toneClass(row.pressure)}>{row.pressure}</span>
                <div><i style={{ width: `${row.score}%` }} /></div>
                <p>{row.note}</p>
              </button>
            ))}
          </article>
        </section>

        <section className="signals-bottom-grid">
          <article className="card factor-signal-card">
            <div className="signal-card-toolbar">
              <h3>Factor Signal Board</h3>
              <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Signal Board Export', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
            </div>
            {signalsData.factorRows.map((row) => (
              <div className="factor-signal-row" key={row.factor}>
                <strong>{row.factor}</strong>
                <span>{row.exposure.toFixed(2)}x exposure</span>
                <div><i style={{ width: `${row.signal}%` }} /></div>
                <b className={row.contribution < 0 ? 'red' : 'green'}>{row.contribution > 0 ? '+' : ''}{row.contribution.toFixed(1)}%</b>
                <em>{row.stance}</em>
              </div>
            ))}
          </article>

          <article className="card signal-impact-card">
            <h3>Portfolio Impact</h3>
            {signalsData.impactRows.map((row) => (
              <div className="signal-impact-row" key={row.area}>
                <strong>{row.area}<small>{row.weight}% weight</small></strong>
                <span className={toneClass(row.signal)}>{row.signal}</span>
                <p>{row.action}</p>
                <b className={row.impact.startsWith('-') ? 'red' : 'green'}>{row.impact}</b>
              </div>
            ))}
          </article>
        </section>
      </main>
    </div>
  );
}
