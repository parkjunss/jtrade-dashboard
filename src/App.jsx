import { Suspense, lazy, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';

const LockedPage = lazy(() => import('./pages/LockedPage.jsx'));
const PerformancePage = lazy(() => import('./pages/PerformancePage.jsx'));
const AllocationPage = lazy(() => import('./pages/AllocationPage.jsx'));
const BacktestPage = lazy(() => import('./pages/BacktestPage.jsx'));
const HoldingsPage = lazy(() => import('./pages/HoldingsPage.jsx'));
const InsightsPage = lazy(() => import('./pages/InsightsPage.jsx'));
const ResearchPage = lazy(() => import('./pages/ResearchPage.jsx'));
const ReportsPage = lazy(() => import('./pages/ReportsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));

const pages = {
  allocation: AllocationPage,
  backtest: BacktestPage,
  holdings: HoldingsPage,
  insights: InsightsPage,
  performance: PerformancePage,
  research: ResearchPage,
  reports: ReportsPage,
  settings: SettingsPage,
};

function isPublicRoute(activePage, activeSidebarItem) {
  return activePage === 'performance' && activeSidebarItem === 'performance-overview';
}

function PageLoadingState() {
  return (
    <main className="dashboard route-loading-state">
      <section className="card status-state loading">
        <strong>Loading dashboard page</strong>
        <p>Preparing the selected workspace.</p>
      </section>
    </main>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState('performance');
  const [activeSidebarItem, setActiveSidebarItem] = useState('performance-overview');
  const ActivePage = pages[activePage] ?? PerformancePage;
  const routeIsLocked = !isAuthenticated && !isPublicRoute(activePage, activeSidebarItem);
  const RenderPage = routeIsLocked ? LockedPage : ActivePage;

  useEffect(() => {
    setActiveSidebarItem(`${activePage}-overview`);
  }, [activePage]);

  return (
    <Suspense fallback={<PageLoadingState />}>
      <RenderPage
        activePage={activePage}
        activeSidebarItem={activeSidebarItem}
        onNavigate={setActivePage}
        onSidebarSelect={setActiveSidebarItem}
      />
    </Suspense>
  );
}
