import Sparkline from './Sparkline.jsx';
import { useSelection } from '../hooks/useSelection.js';

function Chart({ portfolio, market }) {
  const all = [...portfolio, ...market];
  const min = Math.min(...all), max = Math.max(...all), range = max - min || 1;
  const w = 900, h = 260;
  const toPoints = (arr) => arr.map((v, i) => `${(i / (arr.length - 1)) * w},${h - ((v - min) / range) * (h - 18) - 8}`).join(' ');
  return (
    <div className="chart-wrap">
      <div className="y-axis"><span>$450K</span><span>$400K</span><span>$350K</span><span>$300K</span><span>$250K</span></div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="main-chart">
        {[0, 1, 2, 3, 4].map(i => <line key={i} x1="0" x2={w} y1={(i + 0.4) * 48} y2={(i + 0.4) * 48} />)}
        <polyline points={toPoints(portfolio)} className="portfolio-line" />
        <polyline points={toPoints(market)} className="market-line" />
        <circle cx={w} cy={toPoints(portfolio).split(' ').at(-1).split(',')[1]} r="5" className="last-dot" />
      </svg>
      <div className="x-axis"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span></div>
    </div>
  );
}

export default function PortfolioChartCard({ performance, portfolioSeries, marketSeries }) {
  const range = useSelection('1M');
  const rangeLengths = { '1M': 8, '3M': 14, '1Y': 22, All: portfolioSeries.length };
  const selectedLength = rangeLengths[range.value] ?? portfolioSeries.length;
  const rangedPortfolio = portfolioSeries.slice(-selectedLength);
  const rangedMarket = marketSeries.slice(-selectedLength);

  return (
    <article className="card portfolio-card">
      <div className="portfolio-top">
        <div><h3>Portfolio Value</h3><h2>{performance.value}</h2><div className="return-row"><p>Your Return <b>{performance.returnAbs}</b></p><p>Today <b>{performance.day}</b></p></div></div>
        <div className="metric-box">{performance.metrics.map(m => <div key={m.label}><small>{m.label}</small><b className={m.trend}>{m.value}</b></div>)}</div>
        <div className="time-tabs">
          {['1M', '3M', '1Y', 'All'].map(r => (
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
      <div className="chart-area">
        <Chart portfolio={rangedPortfolio} market={rangedMarket} />
        <aside className="compare-box">
          <h4>Portfolio vs Market Index</h4>
          {performance.compare.map(item => 
          <div className={item.highlight ? 'highlight' : ''} key={item.label}>
            <span>{item.label}</span>
            <b>{item.value}</b>
          </div>)}
          </aside>
        </div>
      <div className="legend"><span className="green-dot">Portfolio</span><span className="black-dot">S&P 500</span><small>As of May 21, 2024 ⓘ</small></div>
    </article>
  );
}
