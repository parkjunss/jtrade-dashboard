import { Activity, ArrowDown, ArrowUp, Brain, Cpu, HeartPulse, Newspaper, Radar, ShieldCheck, Sparkles, TrendingUp, UsersRound, Zap } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TickerStrip from '../components/TickerStrip.jsx';
import { tickerStrip } from '../data/mockData';
import SubPageShell from './SubPageShell.jsx';
import { useSelection } from '../hooks/useSelection.js';

const themeRows = [
  { label: 'AI Infrastructure', icon: Cpu, value: 86, tone: 'Strong' },
  { label: 'Semiconductors', icon: Zap, value: 85, tone: 'Strong' },
  { label: 'Quality Tech', icon: ShieldCheck, value: 63, tone: 'Moderate' },
  { label: 'Defensive Healthcare', icon: HeartPulse, value: 46, tone: 'Moderate' },
];

const sectorRows = [
  ['Technology', 77, 'Overweight', 'green'],
  ['Financials', 54, 'Overweight', 'green'],
  ['Healthcare', 45, 'Neutral', 'neutral'],
  ['Energy', 22, 'Underweight', 'red'],
  ['Industrials', 43, 'Neutral', 'neutral'],
  ['Consumer Discretionary', 19, 'Underweight', 'red'],
  ['Utilities', 8, 'Underweight', 'red'],
];

const newsRows = [
  ['1', 'Fed signals cautious stance', 'Positive', 'green'],
  ['2', 'Nvidia supplier demand strong', 'Positive', 'green'],
  ['3', 'Oil retreats on inventory build', 'Negative', 'red'],
  ['4', 'Korean exports improve', 'Positive', 'green'],
];

const opportunities = [
  ['NVDA', 'NVIDIA Corp.', 'AI chip demand & Blackwell ramp', '+8.56%', 'green'],
  ['MSFT', 'Microsoft Corp.', 'Cloud growth & AI adoption', '+5.21%', 'green'],
  ['TSM', 'Taiwan Semiconductor', 'Foundry strength & AI cycle', '+3.18%', 'green'],
  ['LLY', 'Eli Lilly & Co.', 'Obesity pipeline & GLP-1 strength', '-2.45%', 'red'],
];

const metricTiles = [
  { icon: ShieldCheck, label: 'Risk Regime', value: 'Moderate', sub: 'vs last month  Unchanged' },
  { icon: TrendingUp, label: 'Earnings Momentum', value: 'Positive', sub: 'vs last month  Improving' },
  { icon: UsersRound, label: 'Analyst Revisions', value: '+6.2%', sub: 'vs last month  Improving' },
  { icon: Radar, label: 'Breadth Score', value: '63 /100', sub: 'vs last month  Improving' },
  { icon: Activity, label: 'Volatility Regime', value: 'Mild', sub: 'vs last month  Unchanged' },
];

function InsightMeter() {
  return (
    <div className="sentiment-meter">
      <svg className="sentiment-gauge" viewBox="0 0 220 130" aria-hidden="true">
        <path className="gauge-bg" d="M 32 106 A 78 78 0 0 1 188 106" />
        <path className="gauge-value" d="M 32 106 A 78 78 0 0 1 166 51" />
      </svg>
      <div className="sentiment-score">
        <strong>72 <span>/100</span></strong>
        <b>Positive</b>
      </div>
      <small>Sentiment Score</small>
    </div>
  );
}

function ThemeRow({ item }) {
  const Icon = item.icon;
  return (
    <div className="theme-row">
      <div className="theme-icon"><Icon size={20} /></div>
      <b>{item.label}</b>
      <div className="insight-track"><i style={{ width: `${item.value}%` }} /></div>
      <strong>{item.tone}</strong>
    </div>
  );
}

function InsightMetric({ item }) {
  const Icon = item.icon;
  return (
    <article className="card insight-metric">
      <div className="insight-metric-icon"><Icon size={28} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

export default function InsightsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const trendRange = useSelection('6M');

  if (activeSidebarItem !== 'insights-overview') {
    return <SubPageShell activePage={activePage} activeSidebarItem={activeSidebarItem} onNavigate={onNavigate} onSidebarSelect={onSidebarSelect} fallbackTitle="Insights" />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard insights-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Insights</h1>
          <div className="market-brief"><span></span><b>Market Brief</b><p>Fed signals cautious stance</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="insights-top-grid">
          <article className="card ai-insight-card">
            <h3><Sparkles size={22} />AI Market Insight</h3>
            <p>Markets maintain a balanced risk-on tone with strength in AI infrastructure and semiconductors leading gains. Economic data remains resilient, while the Fed's cautious stance keeps policy uncertainty in check.</p>
            <div className="insight-pills">
              <span><ArrowUp size={17} />Bullish Bias</span>
              <span><Activity size={17} />78% Confidence</span>
            </div>
          </article>

          <article className="card sentiment-card">
            <h3>Market Sentiment</h3>
            <div className="sentiment-content">
              <InsightMeter />
              <div className="sentiment-list">
                <div><Newspaper size={18} /><b>News</b><span className="green"><ArrowUp size={14} />Positive</span></div>
                <div><TrendingUp size={18} /><b>Technical</b><span className="green"><ArrowUp size={14} />Positive</span></div>
                <div><Activity size={18} /><b>Macro</b><span>Neutral</span></div>
                <div><Zap size={18} /><b>Volatility</b><span><ArrowDown size={14} />Mild</span></div>
              </div>
            </div>
          </article>

          <article className="card top-themes-card">
            <h3>Top Themes</h3>
            {themeRows.map((item) => <ThemeRow item={item} key={item.label} />)}
          </article>
        </section>

        <section className="insights-middle-grid">
          <article className="card sector-rotation-card">
            <h3>Sector Rotation</h3>
            {sectorRows.map(([label, value, stance, tone]) => (
              <div className="sector-row" key={label}>
                <span>{label}</span>
                <div className="insight-track"><i style={{ width: `${value}%` }} /></div>
                <strong className={tone}>{stance}</strong>
              </div>
            ))}
          </article>

          <article className="card factor-card">
            <h3>Portfolio Factor Exposure</h3>
            <div className="factor-content">
              <div className="radar-plot">
                <svg className="radar-svg" viewBox="0 0 260 230" aria-hidden="true">
                  <polygon className="radar-ring" points="130,16 235,86 196,206 64,206 25,86" />
                  <polygon className="radar-ring radar-ring-mid" points="130,54 196,98 172,174 88,174 64,98" />
                  <line x1="130" y1="115" x2="130" y2="16" />
                  <line x1="130" y1="115" x2="235" y2="86" />
                  <line x1="130" y1="115" x2="196" y2="206" />
                  <line x1="130" y1="115" x2="64" y2="206" />
                  <line x1="130" y1="115" x2="25" y2="86" />
                  <polygon className="radar-area" points="130,50 181,100 170,178 90,176 76,101" />
                </svg>
                <span className="factor-growth">Growth<br /><b>1.34</b></span>
                <span className="factor-value">Value<br /><b>0.72</b></span>
                <span className="factor-quality">Quality<br /><b>1.21</b></span>
                <span className="factor-momentum">Momentum<br /><b>1.15</b></span>
                <span className="factor-vol">Low Volatility<br /><b>0.88</b></span>
              </div>
              <div className="factor-benchmark">
                <b>Exposure vs Benchmark</b>
                <p>Growth <span className="green">+0.32</span></p>
                <p>Value <span className="red">-0.18</span></p>
                <p>Quality <span className="green">+0.28</span></p>
                <p>Momentum <span className="green">+0.21</span></p>
                <p>Low Vol. <span className="green">+0.09</span></p>
              </div>
            </div>
          </article>

          <article className="card news-impact-card">
            <div className="insight-card-head"><h3>News Impact</h3><button type="button">View All</button></div>
            {newsRows.map(([rank, catalyst, impact, tone]) => (
              <div className="news-row" key={rank}>
                <span>{rank}</span>
                <b>{catalyst}</b>
                <strong className={tone}>{impact}</strong>
              </div>
            ))}
          </article>
        </section>

        <section className="insights-lower-grid">
          <article className="card insight-trend-card">
            <div className="insight-card-head">
              <h3>Insight Trend</h3>
              <div className="time-tabs">
                {['1M', '3M', '6M', '1Y'].map(r => (
                  <button 
                    key={r} 
                    className={trendRange.isSelected(r) ? 'active' : ''} 
                    onClick={() => trendRange.select(r)}
                    type="button"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <svg className="insight-line-chart" viewBox="0 0 760 220" role="img" aria-label="Insight trend chart">
              {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" x2="760" y1={y} y2={y} />)}
              <polyline className="portfolio-line" points="0,78 70,68 140,83 210,66 280,74 350,62 420,70 490,65 560,74 630,60 700,67 760,62" />
              <polyline className="market-line" points="0,96 70,88 140,112 210,92 280,107 350,135 420,160 490,128 560,144 630,121 700,86 760,98" />
            </svg>
          </article>

          <article className="card watch-opportunities-card">
            <div className="insight-card-head"><h3>Watch Opportunities</h3><button type="button">View All</button></div>
            <div className="opportunity-table">
              {opportunities.map(([ticker, name, rationale, change, tone]) => (
                <div className="opportunity-row" key={ticker}>
                  <b>{ticker}</b>
                  <span>{name}</span>
                  <p>{rationale}</p>
                  <strong className={tone}>{change}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="insight-metric-grid">
          {metricTiles.map((item) => <InsightMetric item={item} key={item.label} />)}
        </section>
      </main>
    </div>
  );
}
