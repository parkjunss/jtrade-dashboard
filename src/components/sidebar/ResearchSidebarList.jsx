import { Eye, GitCompareArrows, Newspaper, Search, Sparkles } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'research-overview', label: 'Research', Icon: Sparkles },
  { id: 'research-screener', label: 'Screener', Icon: Search },
  { id: 'research-stock-detail', label: 'Stock Detail', Icon: Eye },
  { id: 'research-news', label: 'News', Icon: Newspaper },
  { id: 'research-compare', label: 'Compare', Icon: GitCompareArrows },
];

export default function ResearchSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
