import { CalendarDays, ChartNoAxesCombined, Newspaper, RadioTower } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'market-overview', label: 'Market', Icon: ChartNoAxesCombined },
  { id: 'market-breadth', label: 'Breadth', Icon: RadioTower },
  { id: 'market-news', label: 'News', Icon: Newspaper },
  { id: 'market-calendar', label: 'Calendar', Icon: CalendarDays },
];

export default function MarketSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
