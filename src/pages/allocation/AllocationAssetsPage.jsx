import { Boxes, Download, Eye, PieChart, ShieldCheck, Target } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getAllocationAssetData, getTickerStrip } from '../../data/mock/selectors';

const tickerStrip = getTickerStrip();
const assetData = getAllocationAssetData();

function AssetSummaryCard({ icon: Icon, label, value, sub, tone = 'neutral' }) {
  return (
    <article className={`card asset-summary-card ${tone}`}>
      <div className="asset-summary-icon"><Icon size={24} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </article>
  );
}

export default function AllocationAssetsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [selectedAssetName, setSelectedAssetName] = useState(assetData.largestAsset?.name ?? 'US Stocks');
  const trendRange = useSelection('6M');
  const selectedAsset = assetData.assets.find((row) => row.name === selectedAssetName) ?? assetData.assets[0];
  const trendSliceLength = { '3M': 3, '6M': 6, '1Y': 6, All: 6 }[trendRange.value] ?? 6;
  const visibleMonths = assetData.trendMonths.slice(-trendSliceLength);
  const exportRows = assetData.assets.map((row) => ({
    Asset: row.name,
    Current: `${row.current}%`,
    Target: `${row.target}%`,
    Drift: `${row.driftValue >= 0 ? '+' : ''}${row.driftValue.toFixed(1)} pts`,
    Value: row.value,
    Liquidity: `${row.liquidity}/100`,
    Concentration: row.concentration,
    Risk: row.risk,
    Holdings: row.holdings.map((holding) => holding.symbol).join(', '),
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard allocation-page allocation-assets-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Assets</h1>
          <div className="market-brief"><span></span><b>Allocation</b><p>Asset class drilldown, allocation trend, and drift diagnostics.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="asset-summary-grid">
          <AssetSummaryCard icon={Boxes} label="Asset Classes" value={assetData.assets.length} sub="Policy allocation groups" />
          <AssetSummaryCard icon={PieChart} label="Largest Asset" value={`${assetData.largestAsset.name} ${assetData.largestAsset.current}%`} sub={assetData.largestAsset.value} />
          <AssetSummaryCard icon={Target} label="Largest Drift" value={assetData.largestDrift.name} sub={`${assetData.largestDrift.driftValue >= 0 ? '+' : ''}${assetData.largestDrift.driftValue.toFixed(1)} pts from target`} tone={assetData.largestDrift.driftValue >= 0 ? 'loss' : 'gain'} />
          <AssetSummaryCard icon={ShieldCheck} label="Total Absolute Drift" value={`${assetData.totalDrift.toFixed(1)} pts`} sub="Across current policy groups" />
        </section>

        <section className="asset-layout">
          <article className="card asset-table-card">
            <div className="allocation-card-head">
              <h3>Asset Class Exposure</h3>
              <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Asset Allocation', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
            </div>
            <div className="asset-table">
              <div className="asset-table-head"><span>Asset</span><span>Current</span><span>Target</span><span>Drift</span><span>Value</span><span>Liquidity</span></div>
              {assetData.assets.map((row) => (
                <button className={`asset-table-row ${selectedAsset.name === row.name ? 'selected' : ''}`} key={row.name} onClick={() => setSelectedAssetName(row.name)} type="button">
                  <span><i style={{ background: row.color }} />{row.name}</span>
                  <strong>{row.current}%</strong>
                  <span>{row.target}%</span>
                  <em className={row.driftValue > 0 ? 'red' : row.driftValue < 0 ? 'green' : ''}>{row.driftValue >= 0 ? '+' : ''}{row.driftValue.toFixed(1)} pts</em>
                  <strong>{row.value}</strong>
                  <span>{row.liquidity}/100</span>
                </button>
              ))}
            </div>
          </article>

          <aside className="asset-detail-stack">
            <article className="card asset-detail-card">
              <div className="asset-detail-head">
                <div><i style={{ background: selectedAsset.color }} /><h3>{selectedAsset.name}</h3></div>
                <strong>{selectedAsset.current}%</strong>
              </div>
              <div className="asset-detail-grid">
                <div><span>Market Value</span><b>{selectedAsset.value}</b></div>
                <div><span>Target</span><b>{selectedAsset.target}%</b></div>
                <div><span>Concentration</span><b>{selectedAsset.concentration}</b></div>
                <div><span>Risk Note</span><b>{selectedAsset.risk}</b></div>
              </div>
              <div className="asset-drift-track">
                <span>Current vs target</span>
                <div><i style={{ width: `${selectedAsset.current}%`, background: selectedAsset.color }} /><b style={{ left: `${selectedAsset.target}%` }} /></div>
                <small>Marker shows target policy weight.</small>
              </div>
              <button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'AllocationAsset', asset: selectedAsset.name })} type="button"><Eye size={16} />View Detail</button>
            </article>

            <article className="card asset-holdings-card">
              <h3>Holdings</h3>
              {selectedAsset.holdings.length > 0 ? selectedAsset.holdings.map((holding) => (
                <div className="asset-holding-row" key={holding.symbol}>
                  <strong>{holding.symbol}</strong>
                  <span>{holding.name}</span>
                  <b>{holding.weight}</b>
                  <small>{holding.value}</small>
                </div>
              )) : <StatusState title="No direct positions" message="This asset bucket is represented by policy allocation and future broker data." />}
            </article>
          </aside>
        </section>

        <section className="asset-trend-grid">
          <article className="card asset-trend-card">
            <div className="allocation-card-head">
              <h3>Asset Allocation Trend</h3>
              <div className="time-tabs">
                {['3M', '6M', '1Y', 'All'].map((range) => (
                  <button className={trendRange.isSelected(range) ? 'active' : ''} key={range} onClick={() => trendRange.select(range)} type="button">{range}</button>
                ))}
              </div>
            </div>
            <div className="asset-trend-chart">
              {visibleMonths.map((month, index) => (
                <div className="asset-trend-column" key={month}>
                  {assetData.assets.map((row) => (
                    <i key={`${month}-${row.name}`} style={{ height: `${row.trend.slice(-trendSliceLength)[index]}%`, background: row.color }} />
                  ))}
                  <span>{month}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card asset-policy-card">
            <h3>Policy Review</h3>
            {assetData.assets.map((row) => (
              <div className="asset-policy-row" key={row.name}>
                <span>{row.name}</span>
                <div><i style={{ width: `${Math.min(100, Math.abs(row.driftValue) * 24)}%`, background: row.driftValue > 0 ? 'var(--red)' : 'var(--green)' }} /></div>
                <strong className={Math.abs(row.driftValue) >= 2 ? 'red' : ''}>{Math.abs(row.driftValue) >= 2 ? 'Review' : 'In range'}</strong>
              </div>
            ))}
          </article>
        </section>
      </main>
    </div>
  );
}

