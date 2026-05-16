import { LockKeyhole, ShieldCheck, TrendingUp } from 'lucide-react';
import AuthPrompt from '../components/AuthPrompt.jsx';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';

export default function LockedPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard locked-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="locked-layout">
          <article className="locked-preview card">
            <div className="locked-icon"><LockKeyhole size={28} /></div>
            <span>Login required</span>
            <h1>Sign in to view this workspace</h1>
            <p>Public visitors can preview the main dashboard. Portfolio holdings, allocation, backtests, reports, settings, and detailed performance views require a signed-in session.</p>
            <div className="locked-highlights">
              <div><TrendingUp size={18} /><strong>Market overview remains visible</strong></div>
              <div><ShieldCheck size={18} /><strong>Portfolio-specific data stays protected</strong></div>
            </div>
          </article>

          <AuthPrompt
            message="Sign in to unlock the selected page and continue from this route."
            title="Unlock page"
          />
        </section>
      </main>
    </div>
  );
}
