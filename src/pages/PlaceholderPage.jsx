import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import { getTickerStrip } from '../data/mock/selectors';

const tickerStrip = getTickerStrip();

export default function PlaceholderPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect, title }) {
  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard">
        <TopBar activePage={activePage} onNavigate={onNavigate} />
        <section className="title-row">
          <h1>{title}</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>
        <section className="card placeholder-panel" />
      </main>
    </div>
  );
}
