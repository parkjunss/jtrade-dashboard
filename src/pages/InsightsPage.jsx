import { Activity, ArrowDown, ArrowUp, Brain, Cpu, Download, Eye, HeartPulse, Newspaper, Radar, ShieldCheck, Sparkles, TrendingUp, UsersRound, Waypoints, Zap } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { useAppAction } from '../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../services/appActions';
import { getInsightsData, getOptionsInsightsData, getTickerStrip } from '../data/mock/selectors';

const tickerStrip = getTickerStrip();
const insightIcons = { Activity, Cpu, HeartPulse, Radar, ShieldCheck, TrendingUp, UsersRound, Zap };
const insightData = getInsightsData();
const themeRows = insightData.themeRows.map((item) => ({ ...item, icon: insightIcons[item.icon] }));
const sectorRows = insightData.sectorRows;
const newsRows = insightData.newsRows;
const opportunities = insightData.opportunities;
const metricTiles = insightData.metricTiles.map((item) => ({ ...item, icon: insightIcons[item.icon] }));
const optionsData = getOptionsInsightsData();

function InsightMeter() {
  return (
    <div className="sentiment-meter">
      <svg className="sentiment-gauge" viewBox="0 0 220 130" aria-hidden="true">
        <path className="gauge-bg" d="M 32 106 A 78 78 0 0 1 188 106" />
        <path className="gauge-value" d="M 32 106 A 78 78 0 0 1 166 51" />
      </svg>
      <div className="sentiment-score">
        <strong>72 <span>/100</span></strong>
        <b>Positive</b>
      </div>
      <small>Sentiment Score</small>
    </div>
  );
}

function ThemeRow({ item }) {
  const Icon = item.icon;
  return (
    <div className="theme-row">
      <div className="theme-icon"><Icon size={20} /></div>
      <b>{item.label}</b>
      <div className="insight-track"><i style={{ width: `${item.value}%` }} /></div>
      <strong>{item.tone}</strong>
    </div>
  );
}

function InsightMetric({ item }) {
  const Icon = item.icon;
  return (
    <article className="card insight-metric">
      <div className="insight-metric-icon"><Icon size={28} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

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

function OptionsInsightsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
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

export default function InsightsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const trendRange = useSelection('6M');

  if (activeSidebarItem === 'insights-options') {
    return <OptionsInsightsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem !== 'insights-overview') {
    return <SubPageShell activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} fallbackTitle="Insights" />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard insights-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Insights</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="insights-top-grid">
          <article className="card ai-insight-card">
            <h3><Sparkles size={22} />AI Market Insight</h3>
            <p>Markets maintain a balanced risk-on tone with strength in AI infrastructure and semiconductors leading gains. Economic data remains resilient, while the Fed's cautious stance keeps policy uncertainty in check.</p>
            <div className="insight-pills">
              <span><ArrowUp size={17} />Bullish Bias</span>
              <span><Activity size={17} />78% Confidence</span>
            </div>
          </article>

          <article className="card sentiment-card">
            <h3>Market Sentiment</h3>
            <div className="sentiment-content">
              <InsightMeter />
              <div className="sentiment-list">
                <div><Newspaper size={18} /><b>News</b><span className="green"><ArrowUp size={14} />Positive</span></div>
                <div><TrendingUp size={18} /><b>Technical</b><span className="green"><ArrowUp size={14} />Positive</span></div>
                <div><Activity size={18} /><b>Macro</b><span>Neutral</span></div>
                <div><Zap size={18} /><b>Volatility</b><span><ArrowDown size={14} />Mild</span></div>
              </div>
            </div>
          </article>

          <article className="card top-themes-card">
            <h3>Top Themes</h3>
            {themeRows.map((item) => <ThemeRow item={item} key={item.label} />)}
          </article>
        </section>

        <section className="insights-middle-grid">
          <article className="card sector-rotation-card">
            <h3>Sector Rotation</h3>
            {sectorRows.map(([label, value, stance, tone]) => (
              <div className="sector-row" key={label}>
                <span>{label}</span>
                <div className="insight-track"><i style={{ width: `${value}%` }} /></div>
                <strong className={tone}>{stance}</strong>
              </div>
            ))}
          </article>

          <article className="card factor-card">
            <h3>Portfolio Factor Exposure</h3>
            <div className="factor-content">
              <div className="radar-plot">
                <svg className="radar-svg" viewBox="0 0 260 230" aria-hidden="true">
                  <polygon className="radar-ring" points="130,16 235,86 196,206 64,206 25,86" />
                  <polygon className="radar-ring radar-ring-mid" points="130,54 196,98 172,174 88,174 64,98" />
                  <line x1="130" y1="115" x2="130" y2="16" />
                  <line x1="130" y1="115" x2="235" y2="86" />
                  <line x1="130" y1="115" x2="196" y2="206" />
                  <line x1="130" y1="115" x2="64" y2="206" />
                  <line x1="130" y1="115" x2="25" y2="86" />
                  <polygon className="radar-area" points="130,50 181,100 170,178 90,176 76,101" />
                </svg>
                <span className="factor-growth">Growth<br /><b>1.34</b></span>
                <span className="factor-value">Value<br /><b>0.72</b></span>
                <span className="factor-quality">Quality<br /><b>1.21</b></span>
                <span className="factor-momentum">Momentum<br /><b>1.15</b></span>
                <span className="factor-vol">Low Volatility<br /><b>0.88</b></span>
              </div>
              <div className="factor-benchmark">
                <b>Exposure vs Benchmark</b>
                <p>Growth <span className="green">+0.32</span></p>
                <p>Value <span className="red">-0.18</span></p>
                <p>Quality <span className="green">+0.28</span></p>
                <p>Momentum <span className="green">+0.21</span></p>
                <p>Low Vol. <span className="green">+0.09</span></p>
              </div>
            </div>
          </article>

          <article className="card news-impact-card">
            <div className="insight-card-head"><h3>News Impact</h3><button type="button">View All</button></div>
            {newsRows.map(([rank, catalyst, impact, tone]) => (
              <div className="news-row" key={rank}>
                <span>{rank}</span>
                <b>{catalyst}</b>
                <strong className={tone}>{impact}</strong>
              </div>
            ))}
          </article>
        </section>

        <section className="insights-lower-grid">
          <article className="card insight-trend-card">
            <div className="insight-card-head">
              <h3>Insight Trend</h3>
              <div className="time-tabs">
                {['1M', '3M', '6M', '1Y'].map(r => (
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
            <svg className="insight-line-chart" viewBox="0 0 760 220" role="img" aria-label="Insight trend chart">
              {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" x2="760" y1={y} y2={y} />)}
              <polyline className="portfolio-line" points="0,78 70,68 140,83 210,66 280,74 350,62 420,70 490,65 560,74 630,60 700,67 760,62" />
              <polyline className="market-line" points="0,96 70,88 140,112 210,92 280,107 350,135 420,160 490,128 560,144 630,121 700,86 760,98" />
            </svg>
          </article>

          <article className="card watch-opportunities-card">
            <div className="insight-card-head"><h3>Watch Opportunities</h3><button type="button">View All</button></div>
            <div className="opportunity-table">
              {opportunities.map(([ticker, name, rationale, change, tone]) => (
                <div className="opportunity-row" key={ticker}>
                  <b>{ticker}</b>
                  <span>{name}</span>
                  <p>{rationale}</p>
                  <strong className={tone}>{change}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="insight-metric-grid">
          {metricTiles.map((item) => <InsightMetric item={item} key={item.label} />)}
        </section>
      </main>
    </div>
  );
}
