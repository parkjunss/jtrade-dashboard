import { Brain, ChevronRight, Play, Search, Star, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import { tickerStrip } from '../data/mockData';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { APP_ACTIONS } from '../services/appActions';
import { useState } from 'react';

const statBlocks = [
  ['P/E (TTM)', '65.42'], ['Forward P/E', '42.18'], ['Beta (5Y)', '1.58'], ['Dividend Yield', '0.03%'],
  ['52W High', '$1,153.13'], ['52W Low', '$446.50'], ['Avg. Volume (30D)', '39.21M'], ['Shares Outstanding', '2.46B'],
];
const technicals = [
  ['RSI (14)', '63.4', 'Neutral'], ['MACD (12,26,9)', '', 'Bullish'], ['50-Day MA', '$952.10', 'Bullish'], ['200-Day MA', '$781.45', 'Bullish'],
];
const financials = [
  ['Revenue Growth (YoY)', '+125.9%'], ['Gross Margin', '78.1%'], ['EPS Growth (YoY)', '+144.7%'], ['Free Cash Flow', '$67.1B'],
];
const newsRows = [
  ['NVIDIA beats Q1 earnings on strong data center demand', 'Positive', 'May 7, 2025'],
  ['NVIDIA announces next-gen Blackwell Ultra platform', 'Positive', 'May 6, 2025'],
  ['AI chip demand to drive record capex in 2025: Analysts', 'Positive', 'May 5, 2025'],
  ['U.S. export restrictions to China could impact H20 sales', 'Negative', 'May 2, 2025'],
];
const peers = [
  ['NVDA', 'NVIDIA Corp.', '+171.32%', '$2.52T', '65.42', '42.3%'],
  ['AMD', 'Advanced Micro Devices', '+43.10%', '$188.61B', '58.71', '58.7%'],
  ['MSFT', 'Microsoft Corp.', '+22.87%', '$3.01T', '32.21', '23.7%'],
  ['TSM', 'Taiwan Semiconductor', '+47.11%', '$840.23B', '26.34', '28.9%'],
  ['SOXX', 'iShares Semiconductor ETF', '+38.92%', '$11.92B', '-', '30.8%'],
];

function InfoTable({ title, rows, columns = 2 }) {
  return (
    <article className="card stock-info-card">
      <h3>{title}</h3>
      <div className={`stock-info-grid cols-${columns}`}>
        {rows.map((row) => (
          <div key={row.join('-')}>
            <span>{row[0]}</span>
            <strong>{row[1]}</strong>
            {row[2] ? <em className={row[2] === 'Neutral' ? '' : 'green'}>{row[2]}</em> : null}
          </div>
        ))}
      </div>
    </article>
  );
}

export default function StockDetailPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const performanceRange = useSelection('1D');
  const earningsRange = useSelection('4Q');
  const selectedPeer = useSelection(null);

  const chartPoints = {
    '1D': '0,200 180,152 360,145 540,112 720,84 900,88 1060,66',
    '1W': '0,210 120,190 240,170 360,146 480,160 600,126 720,112 840,92 960,76 1060,70',
    '1M': '0,220 90,200 180,176 270,166 360,145 450,132 540,112 630,118 720,84 810,95 900,88 990,72 1060,66',
    '6M': '0,236 100,222 200,206 300,196 400,170 500,160 600,138 700,126 800,104 900,86 1060,66',
    '1Y': '0,250 80,232 160,218 240,198 320,180 400,176 480,154 560,132 640,140 720,110 800,96 880,82 960,74 1060,66',
    '5Y': '0,260 96,244 192,230 288,212 384,196 480,170 576,148 672,130 768,112 864,90 960,78 1060,66',
    All: '0,268 80,250 160,236 240,220 320,198 400,180 480,162 560,146 640,130 720,110 800,96 880,84 960,74 1060,66',
  };

  const toggleWatchlist = async () => {
    const next = !isWatchlisted;
    setIsWatchlisted(next);
    if (next) {
      await runAction(APP_ACTIONS.ADD_TO_WATCHLIST, { symbol: 'NVDA' });
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard stock-detail-page stock-detail-v2">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="stock-detail-top-strip">
          <div className="stock-search-box">
            <Search size={17} />
            <input 
              type="text" 
              placeholder=" "
            />
            <span>Search ticker or company...</span>
          </div>
        </section>

        <section className="stock-detail-layout">
          <div className="stock-detail-left">
            <article className="card stock-detail-hero">
              <div className="stock-detail-logo">NVIDIA</div>
              <div className="stock-detail-title">
                <h1>NVIDIA Corp. <span>(NVDA)</span> <button className={`stock-star-button ${isWatchlisted ? 'active' : ''}`} disabled={pendingAction === APP_ACTIONS.ADD_TO_WATCHLIST} onClick={toggleWatchlist} title="Toggle Watchlist" type="button"><Star size={22} /></button></h1>
                <div><strong>$1,024.32</strong><em>+18.65 (+1.85%)</em></div>
                <p>After Hours <b>$1,027.61</b> <span>+3.29 (+0.32%)</span> · As of May 7, 2025 4:00 PM ET</p>
              </div>
              <div className="stock-detail-meta">
                <div><span>Market Cap</span><b>$2.52T</b></div>
                <div><span>Sector</span><b>Semiconductors</b></div>
                <div><span>Exchange</span><b>NASDAQ</b></div>
              </div>
            </article>

            <article className="card stock-intraday-card">
              <div className="stock-card-head">
                <div>
                  <h3>Price Performance</h3>
                  <div className="stock-chart-legend"><span className="green-dot-solid" />NVDA <b>$1,024.32 (+1.85%)</b><span className="gray-dot-solid" />S&P 500 (+0.62%)</div>
                </div>
                <div className="time-tabs">
                  {['1D', '1W', '1M', '6M', '1Y', '5Y', 'All'].map(r => (
                    <button 
                      key={r} 
                      className={performanceRange.isSelected(r) ? 'active' : ''} 
                      onClick={() => performanceRange.select(r)}
                      type="button"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <svg className="stock-intraday-chart" viewBox="0 0 1060 300" role="img" aria-label="Intraday price and volume">
                {[55, 110, 165, 220].map((y) => <line key={y} x1="0" x2="1060" y1={y} y2={y} />)}
                <polyline className="stock-area-line" points={chartPoints[performanceRange.value]} />
                <polyline className="market-line" points="0,212 60,198 120,194 180,188 240,186 300,180 360,178 420,172 480,170 540,164 600,166 660,158 720,150 780,154 840,148 900,142 960,140 1060,136" />
                {Array.from({ length: 90 }).map((_, i) => {
                  const height = 18 + ((i * 13) % 34);
                  return <rect className={i % 5 === 0 ? 'volume-red' : 'volume-green'} key={i} x={i * 11.5} y={286 - height} width="4" height={height} rx="1" />;
                })}
              </svg>
            </article>

            <section className="stock-detail-info-row">
              <InfoTable title="Key Statistics" rows={statBlocks} columns={2} />
              <InfoTable title="Technical Signals" rows={technicals} columns={1} />
              <InfoTable title="Financial Snapshot" rows={financials} columns={1} />
            </section>

            <section className="stock-detail-mid-row">
              <article className="card stock-news-impact-card">
                <h3>News Impact</h3>
                {newsRows.map(([headline, tone, date]) => (
                  <div className="stock-impact-row" key={headline}><span className={tone === 'Negative' ? 'red' : 'green'}>{tone === 'Negative' ? 'Down' : 'Up'}</span><b>{headline}</b><em className={tone === 'Negative' ? 'red' : 'green'}>{tone}</em><small>{date}</small></div>
                ))}
              </article>
              <article className="card stock-peer-table-card">
                <h3>Peer Comparison</h3>
                <div className="peer-table">
                  <div><span>Company</span><span>1Y Return</span><span>Market Cap</span><span>P/E (TTM)</span><span>Volatility (1Y)</span></div>
                  {peers.map((row) => (
                    <div 
                      key={row[0]} 
                      className={`clickable ${selectedPeer.isSelected(row[0]) ? 'selected' : ''}`}
                      onClick={() => selectedPeer.select(selectedPeer.isSelected(row[0]) ? null : row[0])}
                    >
                      <b>{row[0]} <small>{row[1]}</small></b><strong>{row[2]}</strong><span>{row[3]}</span><span>{row[4]}</span><span>{row[5]}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="stock-detail-bottom-row">
              <article className="card stock-risk-return-card">
                <h3>Risk vs Return</h3>
                <div className="stock-risk-scatter">
                  <span className="risk-point nvda" style={{ left: '70%', bottom: '76%' }}>NVDA</span>
                  <span className="risk-point amd" style={{ left: '78%', bottom: '42%' }}>AMD</span>
                  <span className="risk-point msft" style={{ left: '18%', bottom: '36%' }}>MSFT</span>
                  <span className="risk-point tsm" style={{ left: '48%', bottom: '74%' }}>TSM</span>
                  <span className="risk-point portfolio" style={{ left: '42%', bottom: '45%' }}>Your Portfolio</span>
                </div>
              </article>
              <article className="card stock-earnings-card">
                <div className="stock-card-head">
                  <h3>Earnings & Revenue Trend</h3>
                  <div className="time-tabs">
                    {['4Q', '8Q', '12Q'].map(r => (
                      <button 
                        key={r} 
                        className={earningsRange.isSelected(r) ? 'active' : ''} 
                        onClick={() => earningsRange.select(r)}
                        type="button"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="earnings-bars">
                  {[7.19, 6.7, 6.05, 6.05, 7.19, 13.51, 18.12, 22.1, 26.04].map((v, i) => <div key={i}><i style={{ height: `${v * 3}px` }} /><b>${v}B</b><span>Q{i + 1}</span></div>)}
                </div>
              </article>
            </section>
          </div>

          <aside className="stock-detail-right">
            <article className="card position-card">
              <div className="stock-card-head"><h3>Position in Portfolio</h3><button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { panel: 'position', symbol: 'NVDA' })} type="button">View Details <ChevronRight size={14} /></button></div>
              <div className="position-grid"><span>Shares</span><b>120</b><span>Avg. Cost</span><b>$742.18</b><span>Market Value</span><b>$122,918.40</b><span>Unrealized P/L</span><b className="green">+$33,864.80 (37.93%)</b></div>
              <div className="position-weight"><span>Portfolio Weight</span><b>9.42%</b><i><em /></i></div>
            </article>
            <article className="card ai-stock-card">
              <div className="stock-card-head"><h3>AI Insight</h3><strong>Bullish</strong></div>
              <div className="ai-stock-content"><div><Brain size={34} /></div><p>NVIDIA shows strong momentum backed by robust demand for AI chips, expanding data center revenue, and strong earnings revisions.</p></div>
              <div className="confidence-row"><span>Confidence</span><b>High</b><em>82%</em></div>
            </article>
            <article className="card analyst-card">
              <div className="stock-card-head"><h3>Analyst Sentiment</h3><button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { panel: 'analystSentiment', symbol: 'NVDA' })} type="button">View More <ChevronRight size={14} /></button></div>
              <div className="analyst-content">
                <div className="analyst-donut"><strong>42</strong><span>Ratings</span></div>
                <div><p><i className="green-dot-solid" />Buy <b>29 (69%)</b></p><p><i className="yellow-dot" />Hold <b>10 (24%)</b></p><p><i className="red-dot" />Sell <b>3 (7%)</b></p></div>
              </div>
              <div className="price-target"><span>Consensus Price Target</span><b>$1,198.20</b><em>+16.97% Upside</em></div>
            </article>
            <article className="card stock-upcoming-card">
              <h3>Upcoming Events</h3>
              <div><span>Earnings Call</span><b>Aug 21, 2025</b><em>After Close</em></div>
              <div><span>Dividend Date</span><b>Jun 28, 2025</b><em>$0.01/share</em></div>
              <div><span>Investor Event</span><b>Sep 10, 2025</b><em>AI Roadmap</em></div>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
