import { useState } from 'react';
import { ArrowUpRight, BarChart3, Bell, Eye, GitCompareArrows, Newspaper, Plus, Search, Sparkles, Star, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import Sparkline from '../components/Sparkline.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../services/appActions';
import SubPageShell from './SubPageShell.jsx';
import ScreenerPage from './ScreenerPage.jsx';
import StockDetailPage from './StockDetailPage.jsx';
import { getResearchCompareUniverse, getResearchOverviewData } from '../data/mock/selectors';

const metricTabs = ['Price', 'Valuation', 'Growth', 'Profitability', 'Risk'];
const { opportunityRows, catalystRows, recentSearches, savedScreensFallback } = getResearchOverviewData();
const compareUniverse = getResearchCompareUniverse();

function ResearchOverviewPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { mockMutations, pendingAction, runAction } = useAppAction();
  const savedScreens = [...mockMutations.savedScreens, ...savedScreensFallback];

  const openScreener = () => onSidebarSelect('research-screener');
  const openStockDetail = (symbol = 'NVDA') => {
    runAction(APP_ACTIONS.VIEW_DETAILS, { panel: 'stockDetailShortcut', symbol });
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
          <button className="card research-action-card" disabled={pendingAction === APP_ACTIONS.VIEW_OPTIONS} onClick={() => runAction(APP_ACTIONS.VIEW_OPTIONS, { target: 'ResearchAlerts' })} type="button">
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
              <button disabled={pendingAction === APP_ACTIONS.ADD_TO_WATCHLIST} key={symbol} onClick={() => runAction(APP_ACTIONS.ADD_TO_WATCHLIST, { symbol })} type="button">
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

  const exportComparison = () => runAction(APP_ACTIONS.DOWNLOAD_REPORT, {
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
          <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={exportComparison} type="button">Export</button>
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
