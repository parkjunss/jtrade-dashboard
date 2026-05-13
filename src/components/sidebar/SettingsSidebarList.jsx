import { BellRing, Database, Palette, ShieldCheck, SlidersHorizontal, UserRound, WalletCards } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'settings-overview', label: 'Settings', Icon: SlidersHorizontal },
  { id: 'settings-profile', label: 'Profile', Icon: UserRound },
  { id: 'settings-portfolio', label: 'Portfolio', Icon: WalletCards },
  { id: 'settings-data', label: 'Data Sources', Icon: Database },
  { id: 'settings-notifications', label: 'Notifications', Icon: BellRing },
  { id: 'settings-appearance', label: 'Appearance', Icon: Palette },
  { id: 'settings-security', label: 'Security', Icon: ShieldCheck },
];

export default function SettingsSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
