import { ClipboardList, Download, ReceiptText } from 'lucide-react';
import SidebarMenuList from './SidebarMenuList.jsx';

const items = [
  { id: 'reports-overview', label: 'Center', Icon: ClipboardList },
  { id: 'reports-tax', label: 'Tax', Icon: ReceiptText },
  { id: 'reports-exports', label: 'Exports', Icon: Download },
];

export default function ReportsSidebarList(props) {
  return <SidebarMenuList {...props} items={items} />;
}
