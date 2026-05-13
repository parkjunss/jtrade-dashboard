import { useEffect, useState } from 'react';
import PerformancePage from './pages/PerformancePage.jsx';
import AllocationPage from './pages/AllocationPage.jsx';
import BacktestPage from './pages/BacktestPage.jsx';
import HoldingsPage from './pages/HoldingsPage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import ResearchPage from './pages/ResearchPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

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

export default function App() {
  const [activePage, setActivePage] = useState('performance');
  const [activeSidebarItem, setActiveSidebarItem] = useState('performance-overview');
  const ActivePage = pages[activePage] ?? PerformancePage;

  useEffect(() => {
    setActiveSidebarItem(`${activePage}-overview`);
  }, [activePage]);

  return (
    <ActivePage
      activePage={activePage}
      activeSidebarItem={activeSidebarItem}
      onNavigate={setActivePage}
      onSidebarSelect={setActiveSidebarItem}
    />
  );
}
