import { ArrowUpRight, Layers3, PanelTop, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import { tickerStrip } from '../data/mockData';
import { subPageRegistry } from '../data/pageRegistry';

export default function SubPageShell({ activePage, activeSidebarItem, onNavigate, onSidebarSelect, fallbackTitle }) {
  const page = subPageRegistry[activeSidebarItem] ?? {
    title: fallbackTitle ?? 'Page',
    eyebrow: activePage,
    description: 'This page shell is ready for implementation.',
    metrics: ['Primary metric', 'Secondary metric', 'Status'],
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard shell-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />
        <section className="title-row">
          <h1>{page.title}</h1>
          <div className="market-brief"><span></span><b>{page.eyebrow}</b><p>{page.description}</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="shell-grid">
          <article className="card shell-hero-card">
            <div className="shell-icon"><PanelTop size={30} /></div>
            <span>{page.eyebrow}</span>
            <h2>{page.title}</h2>
            <p>{page.description}</p>
            <button type="button">Build Section <ArrowUpRight size={17} /></button>
          </article>
          <article className="card shell-panel">
            <h3>Primary Surface</h3>
            <div className="shell-wire large" />
            <div className="shell-wire" />
            <div className="shell-wire short" />
          </article>
          <article className="card shell-panel">
            <h3>Controls</h3>
            <div className="shell-control-row"><Sparkles size={18} /><span>Filters and actions</span></div>
            <div className="shell-control-row"><Layers3 size={18} /><span>Panels and tables</span></div>
          </article>
        </section>

        <section className="shell-metric-grid">
          {page.metrics.map((metric) => (
            <article className="card shell-metric" key={metric}>
              <span>{metric}</span>
              <strong>Ready</strong>
              <small>Placeholder shell</small>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
