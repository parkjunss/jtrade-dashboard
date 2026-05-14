import { Brain, ChevronRight, Play, Search, Star, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import Modal from '../components/Modal.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { useSelection } from '../hooks/useSelection.js';
import { APP_ACTIONS } from '../services/appActions';
import { useState } from 'react';
import { getStockDetailData, getTickerStrip } from '../data/mock/selectors';

const tickerStrip = getTickerStrip();
const { statBlocks, technicals, financials, newsRows, peers, chartPoints } = getStockDetailData();

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
  const [activeModal, setActiveModal] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const performanceRange = useSelection('1D');
  const earningsRange = useSelection('4Q');
  const selectedPeer = useSelection(null);

  const toggleWatchlist = async () => {
    const next = !isWatchlisted;
    setIsWatchlisted(next);
    if (next) {
      await runAction(APP_ACTIONS.ADD_TO_WATCHLIST, { symbol: 'NVDA' });
    }
  };

  const openDetailModal = async (panel) => {
    await runAction(APP_ACTIONS.VIEW_DETAILS, { panel, symbol: 'NVDA' });
    setActiveModal(panel);
  };

  const confirmRunBacktest = async () => {
    await runAction(APP_ACTIONS.RUN_BACKTEST, {
      strategy: 'Momentum Rotation',
      dateRange: 'Jan 2020 - May 2025',
      assets: ['NVDA', 'SPY'],
      source: 'stockDetail',
    });
    setActiveModal(null);
    onNavigate('backtest');
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
              <div className="stock-detail-actions">
                <button disabled={pendingAction === APP_ACTIONS.RUN_BACKTEST} onClick={() => setActiveModal('runBacktest')} type="button"><Play size={16} />Run Backtest</button>
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
              <div className="stock-card-head"><h3>Position in Portfolio</h3><button onClick={() => openDetailModal('position')} type="button">View Details <ChevronRight size={14} /></button></div>
              <div className="position-grid"><span>Shares</span><b>120</b><span>Avg. Cost</span><b>$742.18</b><span>Market Value</span><b>$122,918.40</b><span>Unrealized P/L</span><b className="green">+$33,864.80 (37.93%)</b></div>
              <div className="position-weight"><span>Portfolio Weight</span><b>9.42%</b><i><em /></i></div>
            </article>
            <article className="card ai-stock-card">
              <div className="stock-card-head"><h3>AI Insight</h3><strong>Bullish</strong></div>
              <div className="ai-stock-content"><div><Brain size={34} /></div><p>NVIDIA shows strong momentum backed by robust demand for AI chips, expanding data center revenue, and strong earnings revisions.</p></div>
              <div className="confidence-row"><span>Confidence</span><b>High</b><em>82%</em></div>
            </article>
            <article className="card analyst-card">
              <div className="stock-card-head"><h3>Analyst Sentiment</h3><button onClick={() => openDetailModal('analystSentiment')} type="button">View More <ChevronRight size={14} /></button></div>
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

        <Modal isOpen={activeModal === 'position'} onClose={() => setActiveModal(null)} title="NVDA Position Details">
          <div className="position-detail-modal">
            <div className="position-detail-grid">
              <div><span>Shares</span><b>120</b></div>
              <div><span>Average Cost</span><b>$742.18</b></div>
              <div><span>Market Value</span><b>$122,918.40</b></div>
              <div><span>Unrealized P/L</span><b className="green">+$33,864.80</b></div>
              <div><span>Portfolio Weight</span><b>9.42%</b></div>
              <div><span>Account</span><b>Growth</b></div>
            </div>
            <div className="position-lots-table">
              <div><span>Date</span><span>Shares</span><span>Cost</span><span>Return</span></div>
              <div><b>Jan 12, 2024</b><span>50</span><span>$698.12</span><strong className="green">+46.7%</strong></div>
              <div><b>Mar 18, 2024</b><span>40</span><span>$774.42</span><strong className="green">+32.3%</strong></div>
              <div><b>Feb 03, 2025</b><span>30</span><span>$944.12</span><strong className="green">+8.5%</strong></div>
            </div>
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'analystSentiment'} onClose={() => setActiveModal(null)} title="NVDA Analyst Sentiment">
          <div className="position-detail-modal">
            <div className="position-detail-grid">
              <div><span>Ratings</span><b>42</b></div>
              <div><span>Buy</span><b className="green">29 (69%)</b></div>
              <div><span>Hold</span><b>10 (24%)</b></div>
              <div><span>Sell</span><b className="red">3 (7%)</b></div>
              <div><span>Consensus Target</span><b>$1,198.20</b></div>
              <div><span>Upside</span><b className="green">+16.97%</b></div>
            </div>
            <div className="position-lots-table">
              <div><span>Firm</span><span>Rating</span><span>Target</span><span>Date</span></div>
              <div><b>Morgan Stanley</b><span>Buy</span><span>$1,240</span><strong>May 7</strong></div>
              <div><b>Goldman Sachs</b><span>Buy</span><span>$1,220</span><strong>May 6</strong></div>
              <div><b>Bernstein</b><span>Hold</span><span>$1,080</span><strong>May 3</strong></div>
            </div>
          </div>
        </Modal>

        <Modal isOpen={activeModal === 'runBacktest'} onClose={() => setActiveModal(null)} title="Run NVDA Backtest">
          <div className="positions-modal-stack">
            <p className="positions-modal-copy">Run a mock backtest with NVDA preselected alongside SPY as the benchmark anchor.</p>
            <div className="import-format-grid">
              {['Momentum Rotation', 'NVDA', 'SPY', 'Jan 2020 - May 2025'].map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="modal-action-row">
              <button onClick={() => setActiveModal(null)} type="button">Cancel</button>
              <button disabled={pendingAction === APP_ACTIONS.RUN_BACKTEST} onClick={confirmRunBacktest} type="button">{pendingAction === APP_ACTIONS.RUN_BACKTEST ? 'Running...' : 'Run Backtest'}</button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
