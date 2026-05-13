import { BriefcaseBusiness, CircleDollarSign, Layers3, List, TrendingUp } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'holdings-overview', label: 'Overview', Icon: BriefcaseBusiness },
  { id: 'holdings-positions', label: 'Positions', Icon: List },
  { id: 'holdings-movers', label: 'Movers', Icon: TrendingUp },
  { id: 'holdings-sectors', label: 'Sectors', Icon: Layers3 },
  { id: 'holdings-dividends', label: 'Dividends', Icon: CircleDollarSign },
];

export default function HoldingsSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
