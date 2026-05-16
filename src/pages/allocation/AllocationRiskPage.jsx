import { Activity, AlertTriangle, BarChart3, Download, Eye, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getAllocationRiskData, getTickerStrip } from '../../data/mock/selectors';

const tickerStrip = getTickerStrip();
const riskData = getAllocationRiskData();

function RiskSummaryCard({ icon: Icon, label, value, sub, tone = 'neutral' }) {
  return (
    <article className={`card risk-summary-card ${tone}`}>
      <div className="risk-summary-icon"><Icon size={24} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </article>
  );
}

export default function AllocationRiskPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [selectedCluster, setSelectedCluster] = useState(riskData.clusters[0]?.name ?? 'AI / Semis');
  const cluster = riskData.clusters.find((row) => row.name === selectedCluster) ?? riskData.clusters[0];
  const exportRows = riskData.positionRisks.map((row) => ({
    Symbol: row.symbol,
    Name: row.name,
    Weight: `${row.weight.toFixed(2)}%`,
    Beta: row.beta.toFixed(2),
    Volatility: `${row.volatility.toFixed(1)}%`,
    'Risk Contribution': `${row.contribution.toFixed(1)} pts`,
    Cluster: row.cluster,
    Correlation: row.correlation.toFixed(2),
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard allocation-page allocation-risk-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Allocation Risk</h1>
          <div className="market-brief"><span></span><b>Allocation</b><p>Concentration, beta, volatility, and correlation clusters.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="risk-summary-grid">
          <RiskSummaryCard icon={ShieldCheck} label="Diversification Score" value={`${riskData.metrics.diversificationScore}/100`} sub="Moderate, improving with cash buffer" />
          <RiskSummaryCard icon={BarChart3} label="Weighted Beta" value={riskData.metrics.beta.toFixed(2)} sub="vs benchmark 1.00" />
          <RiskSummaryCard icon={Activity} label="Portfolio Volatility" value={`${riskData.metrics.volatility.toFixed(1)}%`} sub="30-day annualized estimate" />
          <RiskSummaryCard icon={AlertTriangle} label="Top 3 Concentration" value={`${riskData.metrics.concentration.toFixed(1)}%`} sub="Policy review above 30%" tone="loss" />
        </section>

        <section className="risk-main-grid">
          <article className="card risk-position-card">
            <div className="allocation-card-head">
              <h3>Risk Contribution by Holding</h3>
              <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Allocation Risk', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
            </div>
            <div className="risk-position-table">
              <div className="risk-position-head"><span>Symbol</span><span>Weight</span><span>Beta</span><span>Volatility</span><span>Contribution</span><span>Cluster</span></div>
              {riskData.positionRisks.map((row) => (
                <div className="risk-position-row" key={row.symbol}>
                  <strong>{row.symbol}</strong>
                  <span>{row.weight.toFixed(1)}%</span>
                  <span>{row.beta.toFixed(2)}</span>
                  <span>{row.volatility.toFixed(1)}%</span>
                  <div><i style={{ width: `${Math.min(100, row.contribution * 28)}%` }} /></div>
                  <button onClick={() => setSelectedCluster(row.cluster)} type="button">{row.cluster}</button>
                </div>
              ))}
            </div>
          </article>

          <aside className="risk-side-stack">
            <article className="card risk-cluster-card">
              <h3>Correlation Clusters</h3>
              {riskData.clusters.map((row) => (
                <button className={cluster.name === row.name ? 'active' : ''} key={row.name} onClick={() => setSelectedCluster(row.name)} type="button">
                  <span>{row.name}</span>
                  <b>{row.members.join(', ')}</b>
                  <strong>{row.contribution.toFixed(1)} pts</strong>
                </button>
              ))}
            </article>

            <article className="card risk-cluster-detail">
              <div className="risk-cluster-head">
                <h3>{cluster.name}</h3>
                <strong>{cluster.weight.toFixed(1)}%</strong>
              </div>
              <p>{cluster.members.join(', ')} drive {cluster.contribution.toFixed(1)} points of modeled portfolio risk contribution.</p>
              <button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'RiskCluster', cluster: cluster.name })} type="button"><Eye size={16} />View Cluster Detail</button>
            </article>
          </aside>
        </section>

        <section className="risk-lower-grid">
          <article className="card diversification-card">
            <h3>Diversification Diagnostics</h3>
            {riskData.diversification.map((row) => {
              const width = Math.min(100, (row.value / row.target) * 100);
              const overLimit = row.value > row.target && row.label !== 'Effective holdings';
              return (
                <div className="diversification-row" key={row.label}>
                  <span>{row.label}</span>
                  <div><i style={{ width: `${width}%` }} /><b /></div>
                  <strong className={overLimit ? 'red' : ''}>{typeof row.value === 'number' ? row.value.toFixed(row.value % 1 ? 1 : 0) : row.value}</strong>
                  <small>Target {row.target}</small>
                </div>
              );
            })}
          </article>

          <article className="card correlation-card">
            <h3>High Correlation Pairs</h3>
            {riskData.correlationPairs.map((row) => (
              <div className="correlation-row" key={row.pair}>
                <span>{row.pair}</span>
                <div><i style={{ width: `${row.value * 100}%` }} /></div>
                <strong>{row.value.toFixed(2)}</strong>
                <small>{row.note}</small>
              </div>
            ))}
          </article>

          <article className="card stress-card">
            <h3>Stress Scenarios</h3>
            {riskData.stressTests.map((row) => (
              <div className="stress-row" key={row.scenario}>
                <span>{row.scenario}</span>
                <strong className={row.impact < 0 ? 'red' : 'green'}>{row.impact > 0 ? '+' : ''}{row.impact.toFixed(1)}%</strong>
                <small>{row.driver}</small>
              </div>
            ))}
          </article>
        </section>
      </main>
    </div>
  );
}


