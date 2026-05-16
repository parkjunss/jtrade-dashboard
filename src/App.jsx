import { Suspense, lazy, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';

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

  useEffect(() => {
    setActiveSidebarItem(`${activePage}-overview`);
  }, [activePage]);

  return isAuthenticated ? (
    <Suspense fallback={<PageLoadingState />}>
      <ActivePage
        activePage={activePage}
        activeSidebarItem={activeSidebarItem}
        onNavigate={setActivePage}
        onSidebarSelect={setActiveSidebarItem}
      />
    </Suspense>
  ) : (
    <LoginPage />
  );
}
