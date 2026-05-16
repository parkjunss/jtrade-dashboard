import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import MoverCard from '../components/MoverCard.jsx';
import IndexCard from '../components/IndexCard.jsx';
import PortfolioChartCard from '../components/PortfolioChartCard.jsx';
import MarketSnapshot from '../components/MarketSnapshot.jsx';
import Watchlist from '../components/Watchlist.jsx';
import StatBar from '../components/StatBar.jsx';
import SubPageShell from './SubPageShell.jsx';
import { getPerformanceOverviewData, getTickerStrip } from '../data/mock/selectors';
import PerformanceBenchmarkPage from './performance/PerformanceBenchmarkPage.jsx';
import PerformanceDrawdownPage from './performance/PerformanceDrawdownPage.jsx';
import PerformanceReturnsPage from './performance/PerformanceReturnsPage.jsx';

const tickerStrip = getTickerStrip();
const { movers, portfolioSeries, marketSeries, performance, sp500, marketSnapshot, watchlist, stats } = getPerformanceOverviewData();

export default function PerformancePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  if (activeSidebarItem === 'performance-returns') {
    return <PerformanceReturnsPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'performance-benchmark') {
    return <PerformanceBenchmarkPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem === 'performance-drawdown') {
    return <PerformanceDrawdownPage activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} />;
  }

  if (activeSidebarItem !== 'performance-overview') {
    return <SubPageShell activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} fallbackTitle="Performance" />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard">
        <TopBar activePage={activePage} onNavigate={onNavigate} />
        <section className="title-row">
          <h1>Dashboard</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="top-grid">
          <MoverCard data={movers.gainers} type="gain" />
          <MoverCard data={movers.losers} type="loss" />
          <IndexCard data={sp500} />
        </section>

        <section className="main-grid">
          <div className="left-stack">
            <PortfolioChartCard performance={performance} portfolioSeries={portfolioSeries} marketSeries={marketSeries} />
            <StatBar items={stats} />
          </div>
          <div className="right-stack">
            <MarketSnapshot rows={marketSnapshot} />
            <Watchlist rows={watchlist} />
          </div>
        </section>
      </main>
    </div>
  );
}

