import { ArrowUpRight, Download, Layers3, PieChart, Search, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import Sparkline from '../../components/Sparkline.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getHoldingsSectorExposureData, getTickerStrip } from '../../data/mock/selectors';
import { formatCompactMoney, HoldingLogo } from './HoldingPageShared.jsx';

const tickerStrip = getTickerStrip();
const sectorExposureData = getHoldingsSectorExposureData();

function SectorSummaryCard({ icon: Icon, label, value, sub, tone = 'neutral' }) {
  return (
    <article className={`card sector-summary-card ${tone}`}>
      <div className="sector-summary-icon"><Icon size={24} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </article>
  );
}

export default function SectorsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [selectedSectorName, setSelectedSectorName] = useState(sectorExposureData.largest?.name ?? 'Technology');
  const [query, setQuery] = useState('');
  const selectedSector = sectorExposureData.sectors.find((row) => row.name === selectedSectorName) ?? sectorExposureData.sectors[0];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSectors = useMemo(() => {
    return sectorExposureData.sectors.filter((row) => {
      if (!normalizedQuery) return true;
      return row.name.toLowerCase().includes(normalizedQuery)
        || row.holdings.some((holding) => `${holding.symbol} ${holding.name}`.toLowerCase().includes(normalizedQuery));
    });
  }, [normalizedQuery]);
  const exportRows = sectorExposureData.sectors.map((row) => ({
    Sector: row.name,
    Weight: `${row.weight.toFixed(2)}%`,
    Benchmark: `${row.benchmark.toFixed(2)}%`,
    Difference: `${row.weight - row.benchmark >= 0 ? '+' : ''}${(row.weight - row.benchmark).toFixed(2)} pts`,
    Target: `${row.target.toFixed(2)}%`,
    Drift: `${row.drift >= 0 ? '+' : ''}${row.drift.toFixed(2)} pts`,
    Value: formatCompactMoney(row.value),
    Holdings: row.holdings.map((holding) => holding.symbol).join(', '),
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard holdings-page sectors-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Sectors</h1>
          <div className="market-brief"><span></span><b>Holdings</b><p>Sector exposure, benchmark comparison, and holding-level drilldown.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="sector-summary-grid">
          <SectorSummaryCard icon={Layers3} label="Covered Sectors" value={sectorExposureData.totalSectors} sub="Across active holdings and cash" />
          <SectorSummaryCard icon={PieChart} label="Largest Sector" value={`${sectorExposureData.largest.name} ${sectorExposureData.largest.weight.toFixed(1)}%`} sub={formatCompactMoney(sectorExposureData.largest.value)} />
          <SectorSummaryCard icon={ArrowUpRight} label="Largest Overweight" value={sectorExposureData.largestOverweight.name} sub={`${(sectorExposureData.largestOverweight.weight - sectorExposureData.largestOverweight.benchmark).toFixed(1)} pts vs benchmark`} tone="gain" />
          <SectorSummaryCard icon={Target} label="Largest Underweight" value={sectorExposureData.largestUnderweight.name} sub={`${(sectorExposureData.largestUnderweight.weight - sectorExposureData.largestUnderweight.benchmark).toFixed(1)} pts vs benchmark`} tone="loss" />
        </section>

        <section className="sectors-layout">
          <article className="card sector-exposure-card">
            <div className="holdings-table-head">
              <h3>Sector Exposure</h3>
              <div className="holdings-actions">
                <div className="holdings-search">
                  <Search size={16} />
                  <input onChange={(event) => setQuery(event.target.value)} placeholder="Search sector or holding..." type="text" value={query} />
                </div>
                <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Sector Exposure', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
              </div>
            </div>

            <div className="sector-exposure-list">
              {visibleSectors.map((row) => {
                const activeShare = row.weight - row.benchmark;
                return (
                  <button className={`sector-exposure-row ${selectedSector.name === row.name ? 'selected' : ''}`} key={row.name} onClick={() => setSelectedSectorName(row.name)} type="button">
                    <div className="sector-row-title">
                      <i style={{ background: row.color }} />
                      <div><b>{row.name}</b><span>{row.holdings.length} holdings</span></div>
                    </div>
                    <div className="sector-compare-track">
                      <i style={{ width: `${Math.min(100, row.weight * 2.4)}%`, background: row.color }} />
                      <b style={{ left: `${Math.min(100, row.benchmark * 2.4)}%` }} />
                    </div>
                    <strong>{row.weight.toFixed(1)}%</strong>
                    <em className={activeShare >= 0 ? 'green' : 'red'}>{activeShare >= 0 ? '+' : ''}{activeShare.toFixed(1)} pts</em>
                    <span>{formatCompactMoney(row.value)}</span>
                  </button>
                );
              })}
              {visibleSectors.length === 0 ? <StatusState title="No sectors found" message="Clear the search to show all sector exposure rows." /> : null}
            </div>
          </article>

          <aside className="sector-detail-stack">
            <article className="card sector-detail-card">
              <div className="sector-detail-head">
                <div><i style={{ background: selectedSector.color }} /><h3>{selectedSector.name}</h3></div>
                <strong>{selectedSector.weight.toFixed(1)}%</strong>
              </div>
              <div className="sector-detail-grid">
                <div><span>Market Value</span><b>{formatCompactMoney(selectedSector.value)}</b></div>
                <div><span>Benchmark</span><b>{selectedSector.benchmark.toFixed(1)}%</b></div>
                <div><span>Target</span><b>{selectedSector.target.toFixed(1)}%</b></div>
                <div><span>Target Drift</span><b className={selectedSector.drift >= 0 ? 'red' : 'green'}>{selectedSector.drift >= 0 ? '+' : ''}{selectedSector.drift.toFixed(1)} pts</b></div>
              </div>
              <div className="sector-benchmark-card">
                <span>Portfolio vs benchmark</span>
                <div>
                  <i style={{ width: `${Math.min(100, selectedSector.weight * 2.4)}%`, background: selectedSector.color }} />
                  <b style={{ left: `${Math.min(100, selectedSector.benchmark * 2.4)}%` }} />
                </div>
                <small>Marker shows benchmark sector weight.</small>
              </div>
              <button onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'SectorExposure', sector: selectedSector.name })} type="button"><Eye size={16} />View Sector Detail</button>
            </article>

            <article className="card sector-holdings-card">
              <h3>Sector Holdings</h3>
              {selectedSector.holdings.map((holding) => (
                <button className="sector-holding-row" key={holding.symbol} onClick={() => runAction(APP_ACTIONS.VIEW_DETAILS, { target: 'Holding', symbol: holding.symbol })} type="button">
                  <span className="holding-ticker"><HoldingLogo row={holding} /><b>{holding.symbol}</b></span>
                  <div><strong>{holding.weight}</strong><small>{holding.value}</small></div>
                  <Sparkline data={holding.series} danger={holding.danger} />
                </button>
              ))}
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}


