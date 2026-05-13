import { MoreVertical, RefreshCw } from 'lucide-react';
import Sparkline from './Sparkline.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';

export default function MarketSnapshot({ rows }) {
  const { pendingAction, runAction } = useAppAction();

  return (
    <article className="card snapshot-card">
      <div className="card-head">
        <h3>Market Snapshot</h3>
        <div className="card-actions">
          <button 
            type="button" 
            className={`icon-btn ${pendingAction === 'refreshSnapshot' ? 'spinning' : ''}`}
            onClick={() => runAction('refreshSnapshot')}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            type="button" 
            className="icon-btn"
            onClick={() => runAction('viewOptions', { target: 'MarketSnapshot' })}
            title="More Options"
          >
            <MoreVertical size={17} />
          </button>
        </div>
      </div>
      <div className="snapshot-value"><h2>$1,585,525.75</h2><em>▲ 1.87%</em></div>
      <p className="muted">02:15 PM · Today</p>
      <div className="market-open"><span /><b>● Market Open</b></div>
      {rows.map(row => <div className="market-row" key={row.name}><b>{row.name}</b><Sparkline data={row.series} className={row.danger ? 'red-line' : 'green-line'} width={110} height={28} strokeWidth={2} /><span>{row.value}</span><em>{row.change}</em></div>)}
    </article>
  );
}
