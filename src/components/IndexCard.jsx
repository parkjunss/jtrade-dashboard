import Sparkline from './Sparkline.jsx';
import { useSelection } from '../hooks/useSelection.js';

export default function IndexCard({ data }) {
  const range = useSelection('1D');
  
  return (
    <article className="card index-card">
      <div className="index-head"><span>S&P 500</span><em>▲ 0.85% <b>Today</b></em></div>
      <h2>{data.value}</h2>
      <p className="positive">{data.change} ◆ <span>Today</span></p>
      <div className="index-body">
        <div>
          <Sparkline data={data.series} className="green-line" width={260} height={78} />
          <div className="range-tabs">
            {['1D', '1W', '1M', '3M', '1Y'].map(r => (
              <button 
                key={r} 
                className={range.isSelected(r) ? 'active' : ''} 
                onClick={() => range.select(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <ul className="index-stats">
          <li><span>High</span><b>{data.high}</b></li><li><span>Low</span><b>{data.low}</b></li><li><span>52W High</span><b>{data.high52}</b></li><li><span>52W Low</span><b>{data.low52}</b></li>
          <li className="benchmark"><span>Benchmark: S&P 500 Index</span></li>
        </ul>
      </div>
    </article>
  );
}
