import { Clock3, Gauge, Grid2X2, LineChart, TrendingUp } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'performance-overview', label: 'Overview', Icon: Grid2X2 },
  { id: 'performance-returns', label: 'Returns', Icon: LineChart },
  { id: 'performance-benchmark', label: 'Benchmark', Icon: Gauge },
  { id: 'performance-drawdown', label: 'Drawdown', Icon: TrendingUp },
  { id: 'performance-markets', label: 'Markets', Icon: Clock3 },
];

export default function PerformanceSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
