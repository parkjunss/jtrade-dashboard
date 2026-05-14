import { Activity, BellRing, Gauge, Layers3, Newspaper, Sparkles, Waypoints } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'insights-overview', label: 'AI Insight', Icon: Sparkles },
  { id: 'insights-sentiment', label: 'Sentiment', Icon: Gauge },
  { id: 'insights-themes', label: 'Themes', Icon: Layers3 },
  { id: 'insights-news', label: 'News', Icon: Newspaper },
  { id: 'insights-signals', label: 'Signals', Icon: Activity },
  { id: 'insights-options', label: 'Options', Icon: Waypoints },
  { id: 'insights-alerts', label: 'Alerts', Icon: BellRing },
];

export default function InsightsSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
