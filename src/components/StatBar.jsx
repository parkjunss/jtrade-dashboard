import {
  BarChart3,
  Bolt,
  CircleDollarSign,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
const icons = {
  rotate: RefreshCw,
  cash: CircleDollarSign,
  bolt: Bolt,
  shield: ShieldCheck,
  chart: BarChart3,
};
export default function StatBar({ items }) {
  return (
    <section className="stat-bar">
      {items.map((item) => {
        const Icon = icons[item.icon];
        return (
          <div className="stat-item" key={item.label}>
            <div className="stat-icon">
              <Icon size={18} />
            </div>
            <div>
              <small>{item.label}</small>
              <b>{item.value}</b>
              <p>{item.sub}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
