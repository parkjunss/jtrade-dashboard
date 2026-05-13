import { FlaskConical, GitCompareArrows, SlidersHorizontal, WalletCards } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'backtest-overview', label: 'Strategy', Icon: FlaskConical },
  { id: 'backtest-universe', label: 'Universe', Icon: WalletCards },
  { id: 'backtest-parameters', label: 'Parameters', Icon: SlidersHorizontal },
  { id: 'backtest-compare', label: 'Compare', Icon: GitCompareArrows },
];

export default function BacktestSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
