import { MoreVertical, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import Sparkline from './Sparkline.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import Modal from './Modal.jsx';

const watchlistSearchRows = [
  { name: 'Microsoft Corp.', symbol: 'MSFT', price: '$415.60', change: '+0.72%', icon: 'M', trend: 'up', series: [13, 14, 16, 15, 18, 20, 23] },
  { name: 'Broadcom Inc.', symbol: 'AVGO', price: '$1,621.10', change: '+1.29%', icon: 'B', trend: 'up', series: [10, 12, 13, 15, 18, 17, 20] },
  { name: 'Taiwan Semiconductor', symbol: 'TSM', price: '$156.74', change: '+0.81%', icon: 'T', trend: 'up', series: [11, 13, 15, 14, 16, 19, 21] },
  { name: 'Advanced Micro Devices', symbol: 'AMD', price: '$166.98', change: '+2.14%', icon: 'A', trend: 'up', series: [9, 11, 10, 13, 16, 15, 18] },
];

export default function Watchlist({ rows }) {
  const { mockMutations, pendingAction, runAction } = useAppAction();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [query, setQuery] = useState('');
  const watchlistRows = [...mockMutations.watchlist, ...rows];
  const symbols = new Set(watchlistRows.map((row) => row.symbol));
  const searchRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return watchlistSearchRows.filter((row) => !normalizedQuery || `${row.symbol} ${row.name}`.toLowerCase().includes(normalizedQuery));
  }, [query]);

  const addSymbol = async (row) => {
    await runAction('addToWatchlist', { symbol: row.symbol });
    setIsAddOpen(false);
    setQuery('');
  };

  return (
    <article className="card watch-card">
      <div className="card-head">
        <h3>Watchlist</h3>
        <div className="card-actions">
          <button 
            className="add-btn" 
            onClick={() => setIsAddOpen(true)}
            disabled={pendingAction === 'addToWatchlist'}
            title="Add Ticker"
          >
            <Plus size={20} />
          </button>
          <button 
            type="button" 
            className="icon-btn"
            onClick={() => runAction('viewOptions', { target: 'Watchlist' })}
            title="More Options"
          >
            <MoreVertical size={17} />
          </button>
        </div>
      </div>
      {watchlistRows.map(row => <div className="watch-row" key={row.symbol}><div className={`watch-icon ${row.symbol.toLowerCase()}`}>{row.icon}</div><div className="watch-name"><b>{row.name}</b><small>{row.symbol}</small></div><Sparkline data={row.series} className={row.trend === 'down' ? 'red-line' : 'green-line'} width={110} height={30} strokeWidth={2} /><strong>{row.price}</strong><em className={row.trend}>{row.change}</em></div>)}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add to Watchlist">
        <div className="watchlist-add-modal">
          <input onChange={(event) => setQuery(event.target.value)} placeholder="Search ticker or company..." type="text" value={query} />
          <div className="watchlist-search-results">
            {searchRows.map((row) => {
              const exists = symbols.has(row.symbol);
              return (
                <button disabled={exists || pendingAction === 'addToWatchlist'} key={row.symbol} onClick={() => addSymbol(row)} type="button">
                  <span className={`watch-icon ${row.symbol.toLowerCase()}`}>{row.icon}</span>
                  <b>{row.symbol}</b>
                  <small>{row.name}</small>
                  <strong>{exists ? 'Added' : 'Add'}</strong>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </article>
  );
}
