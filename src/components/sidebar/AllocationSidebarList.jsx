import { Boxes, Globe2, PieChart, Scale, ShieldCheck, Target } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'allocation-overview', label: 'Overview', Icon: PieChart },
  { id: 'allocation-targets', label: 'Targets', Icon: Target },
  { id: 'allocation-rebalance', label: 'Rebalance', Icon: Scale },
  { id: 'allocation-assets', label: 'Assets', Icon: Boxes },
  { id: 'allocation-regions', label: 'Regions', Icon: Globe2 },
  { id: 'allocation-risk', label: 'Risk', Icon: ShieldCheck },
];

export default function AllocationSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
