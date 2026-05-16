import { useState } from 'react';
import { Download, Eye, GitCompareArrows } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getBacktestCompareData, getTickerStrip } from '../../data/mock/selectors';

const tickerStrip = getTickerStrip();
const compareData = getBacktestCompareData();

export default function BacktestComparePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [selectedIds, setSelectedIds] = useState(['momentum-core', 'equal-weight', 'defensive-tilt']);
  const selectedStrategies = compareData.strategies.filter((strategy) => selectedIds.includes(strategy.id));
  const leader = selectedStrategies.reduce((best, row) => (row.sharpe > best.sharpe ? row : best), selectedStrategies[0]);
  const benchmark = compareData.strategies.find((strategy) => strategy.id === 'benchmark-sp500');
  const primary = selectedStrategies[0] ?? compareData.strategies[0];
  const exportRows = selectedStrategies.map((row) => ({
    Strategy: row.name,
    Benchmark: row.benchmark,
    CAGR: `${row.cagr.toFixed(1)}%`,
    'Total Return': `${row.totalReturn.toFixed(1)}%`,
    'Max Drawdown': `${row.maxDrawdown.toFixed(1)}%`,
    Sharpe: row.sharpe.toFixed(2),
    Volatility: `${row.volatility.toFixed(1)}%`,
    'Win Rate': `${row.winRate}%`,
    'Final Value': `$${row.finalValue.toLocaleString('en-US')}`,
    Turnover: `${row.turnover}%`,
  }));

  const toggleStrategy = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.length > 1 ? current.filter((item) => item !== id) : current;
      }
      return [...current, id].slice(-4);
    });
  };

  const compareStrategies = () => runAction(APP_ACTIONS.COMPARE_BACKTEST, {
    strategies: selectedStrategies.map((strategy) => strategy.name),
    benchmark: benchmark.name,
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard backtest-page backtest-compare-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Compare</h1>
          <div className="market-brief"><span></span><b>Backtest</b><p>Compare saved strategies, benchmarks, and parameter variants.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="compare-toolbar card">
          <div>
            <GitCompareArrows size={22} />
            <strong>{selectedStrategies.length} strategies selected</strong>
            <span>Leader by Sharpe: {leader.name}</span>
          </div>
          <div className="compare-actions">
            <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Backtest Compare', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
            <button disabled={pendingAction === APP_ACTIONS.COMPARE_BACKTEST} onClick={compareStrategies} type="button"><Eye size={16} />Run Compare</button>
          </div>
        </section>

        <section className="compare-selector-grid">
          {compareData.strategies.map((strategy) => (
            <button className={`card compare-strategy-card ${selectedIds.includes(strategy.id) ? 'selected' : ''}`} key={strategy.id} onClick={() => toggleStrategy(strategy.id)} type="button">
              <span>{strategy.benchmark}</span>
              <strong>{strategy.name}</strong>
              <small>{strategy.dateRange}</small>
              <b>{strategy.totalReturn.toFixed(1)}%</b>
            </button>
          ))}
        </section>

        <section className="compare-main-grid">
          <article className="card compare-equity-card">
            <div className="backtest-card-head">
              <h3>Indexed Equity Curves</h3>
              <span>{primary.name} vs selected set</span>
            </div>
            <svg className="compare-equity-chart" viewBox="0 0 900 260" role="img" aria-label="Backtest comparison equity curves">
              {[45, 90, 135, 180, 225].map((y) => <line key={y} x1="0" x2="900" y1={y} y2={y} />)}
              {selectedStrategies.map((strategy, strategyIndex) => {
                const max = Math.max(...strategy.series);
                const min = Math.min(...strategy.series);
                const points = strategy.series.map((value, index) => {
                  const x = (index / (strategy.series.length - 1)) * 900;
                  const y = 230 - ((value - min) / (max - min || 1)) * 190;
                  return `${x.toFixed(0)},${y.toFixed(0)}`;
                }).join(' ');
                return <polyline className={`compare-line line-${strategyIndex}`} key={strategy.id} points={points} />;
              })}
            </svg>
            <div className="compare-legend">
              {selectedStrategies.map((strategy, index) => <span className={`line-${index}`} key={strategy.id}>{strategy.name}</span>)}
            </div>
          </article>

          <aside className="compare-summary-stack">
            <article className="card compare-leader-card">
              <h3>Best Risk-Adjusted</h3>
              <strong>{leader.name}</strong>
              <span>Sharpe {leader.sharpe.toFixed(2)} / Max DD {leader.maxDrawdown.toFixed(1)}%</span>
              <p>{leader.name} leads on risk-adjusted return while ending at ${leader.finalValue.toLocaleString('en-US')} from the same starting capital.</p>
            </article>
            <article className="card compare-delta-card">
              <h3>Primary vs Benchmark</h3>
              <div><span>Total return delta</span><strong>+{(primary.totalReturn - benchmark.totalReturn).toFixed(1)} pts</strong></div>
              <div><span>Drawdown improvement</span><strong>{(primary.maxDrawdown - benchmark.maxDrawdown).toFixed(1)} pts</strong></div>
              <div><span>Sharpe delta</span><strong>+{(primary.sharpe - benchmark.sharpe).toFixed(2)}</strong></div>
            </article>
          </aside>
        </section>

        <section className="compare-table-grid">
          <article className="card compare-metrics-card">
            <h3>Strategy Metrics</h3>
            <div className="compare-metrics-table">
              <div className="compare-metrics-head"><span>Strategy</span><span>CAGR</span><span>Total</span><span>Max DD</span><span>Sharpe</span><span>Volatility</span><span>Win</span><span>Turnover</span></div>
              {selectedStrategies.map((row) => (
                <div className="compare-metrics-row" key={row.id}>
                  <strong>{row.name}</strong>
                  <span>{row.cagr.toFixed(1)}%</span>
                  <span>{row.totalReturn.toFixed(1)}%</span>
                  <span className="red">{row.maxDrawdown.toFixed(1)}%</span>
                  <b>{row.sharpe.toFixed(2)}</b>
                  <span>{row.volatility.toFixed(1)}%</span>
                  <span>{row.winRate}%</span>
                  <span>{row.turnover}%</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card compare-variants-card">
            <h3>Parameter Variants</h3>
            {compareData.parameterVariants.map((variant) => (
              <div className="variant-row" key={variant.name}>
                <strong>{variant.name}</strong>
                <span>{variant.rebalance}</span>
                <span>{variant.weighting}</span>
                <b>{variant.cagr.toFixed(1)}%</b>
                <em className="red">{variant.drawdown.toFixed(1)}%</em>
                <small>Sharpe {variant.sharpe.toFixed(2)}</small>
              </div>
            ))}
          </article>
        </section>

        <section className="card compare-monthly-card">
          <h3>Recent Monthly Return Comparison</h3>
          <div className="compare-monthly-table">
            <div><span>Period</span><span>Momentum</span><span>Equal Weight</span><span>Defensive</span><span>Benchmark</span></div>
            {compareData.monthlyRows.map((row) => (
              <div key={row.period}>
                <strong>{row.period}</strong>
                <span className={row.momentum < 0 ? 'red' : 'green'}>{row.momentum > 0 ? '+' : ''}{row.momentum.toFixed(1)}%</span>
                <span className={row.equalWeight < 0 ? 'red' : 'green'}>{row.equalWeight > 0 ? '+' : ''}{row.equalWeight.toFixed(1)}%</span>
                <span className={row.defensive < 0 ? 'red' : 'green'}>{row.defensive > 0 ? '+' : ''}{row.defensive.toFixed(1)}%</span>
                <span className={row.benchmark < 0 ? 'red' : 'green'}>{row.benchmark > 0 ? '+' : ''}{row.benchmark.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
