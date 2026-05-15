import { useState } from 'react';
import { Brain, Download, Eye } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getSentimentInsightsData, getTickerStrip } from '../../data/mock/selectors';
import { InsightMeter, sentimentPoints, toneClass } from './InsightPageShared.jsx';

const tickerStrip = getTickerStrip();
const sentimentData = getSentimentInsightsData();

function SentimentSummaryCard({ item }) {
  return (
    <article className={`card sentiment-summary-card ${item.tone}`}>
      <div className="sentiment-summary-icon"><Brain size={24} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

export default function SentimentInsightsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const scopeSelection = useSelection('Market');
  const [selectedHolding, setSelectedHolding] = useState(sentimentData.holdingRows[0].symbol);
  const selectedScope = sentimentData.scopeRows.find((row) => row.scope === scopeSelection.value) ?? sentimentData.scopeRows[0];
  const selectedHoldingRow = sentimentData.holdingRows.find((row) => row.symbol === selectedHolding) ?? sentimentData.holdingRows[0];
  const filteredDrivers = scopeSelection.isSelected('Market')
    ? sentimentData.driverRows
    : sentimentData.driverRows.filter((row) => row.scope === selectedScope.scope || row.scope === 'Market');
  const exportRows = sentimentData.holdingRows.map((row) => ({
    Symbol: row.symbol,
    Name: row.name,
    Score: row.score,
    Change: row.change,
    News: row.news,
    Social: row.social,
    Analyst: row.analyst,
    Driver: row.driver,
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard insights-page sentiment-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Sentiment</h1>
          <div className="market-brief"><span></span><b>Insights</b><p>Market, sector, and holdings sentiment with explainable drivers.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="sentiment-summary-grid">
          {sentimentData.summary.map((item) => <SentimentSummaryCard item={item} key={item.label} />)}
        </section>

        <section className="sentiment-workspace">
          <article className="card sentiment-map-card">
            <div className="sentiment-card-toolbar">
              <h3>Sentiment Scope</h3>
              <div className="time-tabs">
                {sentimentData.scopeRows.map((row) => (
                  <button className={scopeSelection.isSelected(row.scope) ? 'active' : ''} key={row.scope} onClick={() => scopeSelection.select(row.scope)} type="button">{row.scope}</button>
                ))}
              </div>
            </div>
            <div className="sentiment-scope-layout">
              <div className="sentiment-score-dial">
                <InsightMeter label={selectedScope.score >= 65 ? 'Positive' : selectedScope.score >= 50 ? 'Neutral' : 'Negative'} score={selectedScope.score} />
                <p>{selectedScope.driver}</p>
              </div>
              <div className="sentiment-breakdown">
                {['positive', 'neutral', 'negative'].map((key) => (
                  <div className={`sentiment-breakdown-row ${key}`} key={key}>
                    <span>{key}</span>
                    <div><i style={{ width: `${selectedScope[key]}%` }} /></div>
                    <strong>{selectedScope[key]}%</strong>
                  </div>
                ))}
                <div className="sentiment-delta-card">
                  <span>Scope score</span>
                  <strong>{selectedScope.score}/100</strong>
                  <b className={selectedScope.trend.startsWith('-') ? 'red' : 'green'}>{selectedScope.trend} pts</b>
                </div>
              </div>
            </div>
          </article>

          <article className="card sentiment-driver-card">
            <div className="sentiment-card-toolbar">
              <h3>Primary Drivers</h3>
              <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Sentiment Holdings Export', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
            </div>
            <div className="sentiment-driver-list">
              {filteredDrivers.map((row) => (
                <button key={row.name} onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'SentimentDriver', driver: row.name })} type="button">
                  <span className={toneClass(row.tone)}>{row.impact > 0 ? '+' : ''}{row.impact}</span>
                  <div>
                    <strong>{row.name}</strong>
                    <small>{row.source} - {row.scope}</small>
                    <p>{row.note}</p>
                  </div>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className="sentiment-lower-grid">
          <article className="card sentiment-holdings-card">
            <div className="sentiment-card-toolbar">
              <h3>Holdings Sentiment</h3>
              <button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'HoldingSentiment', symbol: selectedHoldingRow.symbol })} type="button"><Eye size={16} />Details</button>
            </div>
            <div className="sentiment-holdings-table">
              <div className="sentiment-holdings-head"><span>Symbol</span><span>Score</span><span>News</span><span>Social</span><span>Analyst</span><span>Driver</span></div>
              {sentimentData.holdingRows.map((row) => (
                <button className={selectedHolding === row.symbol ? 'selected' : ''} key={row.symbol} onClick={() => setSelectedHolding(row.symbol)} type="button">
                  <strong>{row.symbol}<small>{row.name}</small></strong>
                  <b>{row.score}<em className={row.change.startsWith('-') ? 'red' : 'green'}>{row.change}</em></b>
                  <span>{row.news}</span>
                  <span>{row.social}</span>
                  <span>{row.analyst}</span>
                  <p>{row.driver}</p>
                </button>
              ))}
            </div>
          </article>

          <aside className="sentiment-side-stack">
            <article className="card sentiment-source-card">
              <h3>Source Mix</h3>
              {sentimentData.sourceRows.map((row) => (
                <div className="sentiment-source-row" key={row.source}>
                  <div><strong>{row.source}</strong><small>{row.volume}</small></div>
                  <div className="sentiment-source-bar"><i style={{ width: `${row.positive}%` }} /><b style={{ width: `${row.neutral}%` }} /><em style={{ width: `${row.negative}%` }} /></div>
                  <span>{row.freshness}</span>
                </div>
              ))}
            </article>

            <article className="card sentiment-history-card">
              <h3>Sentiment Trend</h3>
              <svg viewBox="0 0 760 220" role="img" aria-label="Sentiment trend chart">
                {[50, 90, 130, 170].map((y) => <line key={y} x1="0" x2="760" y1={y} y2={y} />)}
                <polyline className="market-line" points={sentimentPoints(sentimentData.historyRows, 'market')} />
                <polyline className="portfolio-line" points={sentimentPoints(sentimentData.historyRows, 'portfolio')} />
              </svg>
              <div className="sentiment-legend"><span>Market</span><b>Portfolio Holdings</b></div>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
