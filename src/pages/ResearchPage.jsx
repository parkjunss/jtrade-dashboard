import { useState } from 'react';
import { ArrowUpRight, BarChart3, Bell, Eye, GitCompareArrows, Newspaper, Plus, Search, Sparkles, Star, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import Sparkline from '../components/Sparkline.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import SubPageShell from './SubPageShell.jsx';
import ScreenerPage from './ScreenerPage.jsx';
import StockDetailPage from './StockDetailPage.jsx';

const opportunityRows = [
  { symbol: 'NVDA', company: 'NVIDIA Corp.', theme: 'AI infrastructure', score: 96, change: '+2.4%', series: [18, 20, 21, 24, 23, 27, 29] },
  { symbol: 'AVGO', company: 'Broadcom Inc.', theme: 'Semis / networking', score: 91, change: '+1.3%', series: [14, 16, 15, 18, 20, 19, 23] },
  { symbol: 'MSFT', company: 'Microsoft Corp.', theme: 'Cloud quality', score: 89, change: '+0.7%', series: [12, 14, 15, 16, 18, 20, 21] },
  { symbol: 'TSM', company: 'Taiwan Semiconductor', theme: 'Foundry demand', score: 87, change: '+0.8%', series: [10, 12, 13, 12, 16, 17, 20] },
];

const catalystRows = [
  ['NVDA', 'Blackwell demand checks remain above plan', 'Positive', 'High'],
  ['MSFT', 'Azure AI growth offsets margin pressure', 'Positive', 'Medium'],
  ['TSM', 'Foundry utilization improving into Q3', 'Positive', 'Medium'],
  ['XLE', 'Crude pullback weighs on energy revisions', 'Negative', 'Low'],
];

const recentSearches = ['NVDA', 'MSFT', 'AAPL', 'TSM', 'AVGO'];

const savedScreensFallback = [
  { name: 'AI Leaders', count: '42 results', updated: 'Updated today' },
  { name: 'Quality Compounders', count: '31 results', updated: 'Updated yesterday' },
  { name: 'Oversold Large Caps', count: '18 results', updated: 'Updated 2 days ago' },
];

const compareUniverse = [
  { symbol: 'NVDA', company: 'NVIDIA Corp.', price: '$1,024.32', change: '+2.41%', pe: 42.8, growth: 38, margin: 57, beta: 1.7, score: 96, ytd: 82, valuation: 78, risk: 62, series: [12, 16, 18, 22, 28, 33, 39] },
  { symbol: 'MSFT', company: 'Microsoft Corp.', price: '$415.60', change: '+0.72%', pe: 31.4, growth: 16, margin: 44, beta: 0.92, score: 89, ytd: 18, valuation: 71, risk: 38, series: [14, 15, 17, 18, 21, 22, 24] },
  { symbol: 'AAPL', company: 'Apple Inc.', price: '$212.44', change: '+0.38%', pe: 28.7, growth: 8, margin: 31, beta: 1.15, score: 76, ytd: 11, valuation: 64, risk: 43, series: [15, 14, 16, 17, 18, 19, 21] },
  { symbol: 'AVGO', company: 'Broadcom Inc.', price: '$1,621.10', change: '+1.29%', pe: 36.2, growth: 21, margin: 49, beta: 1.28, score: 91, ytd: 42, valuation: 74, risk: 51, series: [11, 13, 16, 18, 22, 24, 29] },
  { symbol: 'TSM', company: 'Taiwan Semiconductor', price: '$156.74', change: '+0.81%', pe: 22.9, growth: 19, margin: 43, beta: 1.08, score: 87, ytd: 34, valuation: 82, risk: 45, series: [10, 12, 13, 15, 18, 20, 23] },
];

const metricTabs = ['Price', 'Valuation', 'Growth', 'Profitability', 'Risk'];

function ResearchOverviewPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { mockMutations, pendingAction, runAction } = useAppAction();
  const savedScreens = [...mockMutations.savedScreens, ...savedScreensFallback];

  const openScreener = () => onSidebarSelect('research-screener');
  const openStockDetail = (symbol = 'NVDA') => {
    runAction('viewDetails', { panel: 'stockDetailShortcut', symbol });
    onSidebarSelect('research-stock-detail');
  };
  const openCompare = () => onSidebarSelect('research-compare');

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard research-overview-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Research</h1>
        </section>

        <section className="research-action-grid">
          <button className="card research-action-card primary" onClick={openScreener} type="button">
            <Search size={25} /><span>Screener</span><strong>Find candidates</strong><ArrowUpRight size={18} />
          </button>
          <button className="card research-action-card" onClick={() => openStockDetail('NVDA')} type="button">
            <Eye size={25} /><span>Stock Detail</span><strong>Open NVDA profile</strong><ArrowUpRight size={18} />
          </button>
          <button className="card research-action-card" onClick={openCompare} type="button">
            <GitCompareArrows size={25} /><span>Compare</span><strong>Build peer set</strong><ArrowUpRight size={18} />
          </button>
          <button className="card research-action-card" disabled={pendingAction === 'viewOptions'} onClick={() => runAction('viewOptions', { target: 'ResearchAlerts' })} type="button">
            <Bell size={25} /><span>Alerts</span><strong>Review catalysts</strong><ArrowUpRight size={18} />
          </button>
        </section>

        <section className="research-main-grid">
          <article className="card research-opportunities-card">
            <div className="research-card-head">
              <div><h3>Market Opportunities</h3><p>High-score symbols from current research signals</p></div>
              <button onClick={openScreener} type="button">View Screener <ArrowUpRight size={15} /></button>
            </div>
            <div className="research-opportunity-table">
              {opportunityRows.map((row) => (
                <button className="research-opportunity-row" key={row.symbol} onClick={() => openStockDetail(row.symbol)} type="button">
                  <strong>{row.symbol}<small>{row.company}</small></strong>
                  <span>{row.theme}</span>
                  <b>{row.score}</b>
                  <em>{row.change}</em>
                  <Sparkline data={row.series} width={120} height={34} />
                </button>
              ))}
            </div>
          </article>

          <aside className="research-side-stack">
            <article className="card research-side-card">
              <div className="research-card-head">
                <h3>Recent Searches</h3>
              </div>
              <div className="recent-search-list">
                {recentSearches.map((symbol) => <button key={symbol} onClick={() => openStockDetail(symbol)} type="button">{symbol}</button>)}
              </div>
            </article>

            <article className="card research-side-card">
              <div className="research-card-head">
                <h3>Saved Screens</h3>
                <button onClick={openScreener} type="button">Open</button>
              </div>
              <div className="research-screen-list">
                {savedScreens.slice(0, 4).map((screen) => (
                  <button key={`${screen.name}-${screen.updated}`} onClick={openScreener} type="button">
                    <span>{screen.name}</span><b>{screen.count}</b><small>{screen.updated}</small>
                  </button>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="research-lower-grid">
          <article className="card research-theme-card">
            <h3>Top Themes</h3>
            {[
              ['AI infrastructure', 92, TrendingUp],
              ['Quality balance sheets', 84, Star],
              ['Semiconductor capex', 81, BarChart3],
            ].map(([label, score, Icon]) => (
              <div className="research-theme-row" key={label}>
                <Icon size={18} /><span>{label}</span><i><b style={{ width: `${score}%` }} /></i><strong>{score}</strong>
              </div>
            ))}
          </article>

          <article className="card research-catalyst-card">
            <div className="research-card-head">
              <h3>News Impact Summary</h3>
              <Newspaper size={20} />
            </div>
            {catalystRows.map(([symbol, headline, tone, impact]) => (
              <div className="research-catalyst-row" key={`${symbol}-${headline}`}>
                <b>{symbol}</b><span>{headline}</span><em className={tone === 'Negative' ? 'red' : ''}>{tone}</em><strong>{impact}</strong>
              </div>
            ))}
          </article>

          <article className="card research-watch-card">
            <h3>Watch Candidates</h3>
            {['AVGO', 'TSM', 'AMZN'].map((symbol) => (
              <button disabled={pendingAction === 'addToWatchlist'} key={symbol} onClick={() => runAction('addToWatchlist', { symbol })} type="button">
                <Plus size={16} />Add {symbol}
              </button>
            ))}
          </article>
        </section>
      </main>
    </div>
  );
}

function ResearchComparePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [symbols, setSymbols] = useState(['NVDA', 'MSFT', 'AVGO']);
  const [query, setQuery] = useState('');
  const [metricTab, setMetricTab] = useState('Price');
  const rows = symbols.map((symbol) => compareUniverse.find((item) => item.symbol === symbol)).filter(Boolean);
  const candidates = compareUniverse.filter((item) => !symbols.includes(item.symbol) && `${item.symbol} ${item.company}`.toLowerCase().includes(query.toLowerCase()));
  const leader = rows.reduce((best, row) => row.score > best.score ? row : best, rows[0]);

  const addSymbol = (symbol) => {
    setSymbols((current) => current.includes(symbol) ? current : [...current, symbol]);
    setQuery('');
  };

  const removeSymbol = (symbol) => {
    setSymbols((current) => current.length > 1 ? current.filter((item) => item !== symbol) : current);
  };

  const exportComparison = () => runAction('downloadReport', {
    reportName: 'Research Comparison',
    type: 'CSV',
    rows: rows.map((row) => ({
      Symbol: row.symbol,
      Company: row.company,
      Price: row.price,
      Change: row.change,
      PE: row.pe,
      Growth: `${row.growth}%`,
      Margin: `${row.margin}%`,
      Beta: row.beta,
      Score: row.score,
    })),
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard research-overview-page research-compare-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Compare</h1>
          <div className="page-brief compare-brief">
            <strong>Peer comparison workspace</strong>
            <p>Add up to five symbols, switch metric categories, then scan ranking, relative performance, and valuation risk in one pass.</p>
          </div>
        </section>

        <section className="compare-builder card">
          <div className="compare-symbols">
            {symbols.map((symbol) => <button key={symbol} onClick={() => removeSymbol(symbol)} type="button">{symbol} x</button>)}
          </div>
          <label className="compare-search"><Search size={16} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Add symbol..." value={query} /></label>
          <button disabled={pendingAction === 'downloadReport'} onClick={exportComparison} type="button">Export</button>
          {query ? (
            <div className="compare-candidates">
              {candidates.map((item) => <button key={item.symbol} onClick={() => addSymbol(item.symbol)} type="button">{item.symbol}<span>{item.company}</span></button>)}
            </div>
          ) : null}
        </section>

        <section className="compare-tab-row">
          {metricTabs.map((tab) => <button className={metricTab === tab ? 'active' : ''} key={tab} onClick={() => setMetricTab(tab)} type="button">{tab}</button>)}
        </section>

        <section className="compare-main-grid">
          <article className="card compare-table-card">
            <div className="research-card-head"><h3>Comparison Table</h3><span>{metricTab} metrics</span></div>
            <div className="compare-table">
              <div className="compare-row compare-head"><span>Symbol</span><span>Price</span><span>P/E</span><span>Growth</span><span>Margin</span><span>Beta</span><span>Score</span></div>
              {rows.map((row) => (
                <div className="compare-row" key={row.symbol}>
                  <strong>{row.symbol}<small>{row.company}</small></strong>
                  <span>{row.price}</span>
                  <span>{row.pe}</span>
                  <b>{row.growth}%</b>
                  <b>{row.margin}%</b>
                  <span>{row.beta}</span>
                  <em>{row.score}</em>
                </div>
              ))}
            </div>
          </article>

          <aside className="compare-side-stack">
            <article className="card compare-highlight-card">
              <span>Peer Leader</span>
              <strong>{leader?.symbol}</strong>
              <small>{leader?.company}</small>
            </article>
            <article className="card compare-highlight-card">
              <span>Best Valuation</span>
              <strong>{rows.reduce((best, row) => row.valuation > best.valuation ? row : best, rows[0])?.symbol}</strong>
              <small>Highest valuation score</small>
            </article>
          </aside>
        </section>

        <section className="compare-lower-grid">
          <article className="card compare-chart-card">
            <div className="compare-card-title">
              <h3>Relative Performance</h3>
              <span>YTD move</span>
            </div>
            <div className="compare-lines">
              {rows.map((row) => (
                <div key={row.symbol}>
                  <span>{row.symbol}</span>
                  <Sparkline data={row.series} width={180} height={44} />
                  <strong>{row.ytd > 0 ? '+' : ''}{row.ytd}%</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="card compare-scatter-card">
            <div className="compare-card-title">
              <h3>Valuation Scatter</h3>
              <span>Growth vs valuation</span>
            </div>
            <div className="compare-scatter">
              {rows.map((row) => <span key={row.symbol} style={{ left: `${row.valuation}%`, bottom: `${row.growth + 15}%` }}>{row.symbol}</span>)}
            </div>
            <div className="scatter-axis-labels"><span>Cheaper</span><span>Richer</span></div>
          </article>

          <article className="card compare-ranking-card">
            <div className="compare-card-title">
              <h3>Peer Ranking</h3>
              <span>Composite score</span>
            </div>
            {[...rows].sort((a, b) => b.score - a.score).map((row, index) => (
              <div key={row.symbol}><span>{index + 1}</span><strong>{row.symbol}</strong><i><b style={{ width: `${row.score}%` }} /></i><em>{row.score}</em></div>
            ))}
          </article>
        </section>
      </main>
    </div>
  );
}

export default function ResearchPage(props) {
  if (props.activeSidebarItem === 'research-overview') {
    return <ResearchOverviewPage {...props} />;
  }

  if (props.activeSidebarItem === 'research-screener') {
    return <ScreenerPage {...props} />;
  }

  if (props.activeSidebarItem === 'research-stock-detail') {
    return <StockDetailPage {...props} />;
  }

  if (props.activeSidebarItem === 'research-compare') {
    return <ResearchComparePage {...props} />;
  }

  return <SubPageShell {...props} fallbackTitle="Research" />;
}
