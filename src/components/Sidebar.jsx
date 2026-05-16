import AllocationSidebarList from './sidebar/AllocationSidebarList.jsx';
import BacktestSidebarList from './sidebar/BacktestSidebarList.jsx';
import HoldingsSidebarList from './sidebar/HoldingsSidebarList.jsx';
import InsightsSidebarList from './sidebar/InsightsSidebarList.jsx';
import MarketSidebarList from './sidebar/MarketSidebarList.jsx';
import PerformanceSidebarList from './sidebar/PerformanceSidebarList.jsx';
import ResearchSidebarList from './sidebar/ResearchSidebarList.jsx';
import ReportsSidebarList from './sidebar/ReportsSidebarList.jsx';
import SettingsSidebarList from './sidebar/SettingsSidebarList.jsx';

const sidebarLists = {
  allocation: AllocationSidebarList,
  backtest: BacktestSidebarList,
  holdings: HoldingsSidebarList,
  insights: InsightsSidebarList,
  market: MarketSidebarList,
  performance: PerformanceSidebarList,
  research: ResearchSidebarList,
  reports: ReportsSidebarList,
  settings: SettingsSidebarList,
};

export default function Sidebar({ activePage = 'performance', activeItem, onSelect }) {
  const ActiveSidebarList = sidebarLists[activePage] ?? PerformanceSidebarList;

  return (
    <aside className="sidebar">
      <ActiveSidebarList activeItem={activeItem} onSelect={onSelect} />
    </aside>
  );
}
