import { ChartNoAxesCombined } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'market-overview', label: 'Market', Icon: ChartNoAxesCombined },
];

export default function MarketSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
