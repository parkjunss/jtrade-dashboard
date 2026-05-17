import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Cable,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Download,
  PlugZap,
  RefreshCw,
  RotateCcw,
  Save,
  ServerCog,
  ShieldCheck,
  UploadCloud,
  WalletCards,
} from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import StatusState from '../components/StatusState.jsx';
import { APP_ACTIONS } from '../services/appActions';
import { getPortfolioSettings, getSettingsDataSources } from '../data/mock/selectors';

const defaultPortfolioSettings = getPortfolioSettings();
const defaultDataSettings = getSettingsDataSources();

function SettingsDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`dropdown-wrap settings-field ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <label>{label}</label>
      <button onClick={() => setIsOpen((current) => !current)} type="button">{value} <ChevronDown size={15} /></button>
      {isOpen ? (
        <div className="dropdown-menu">
          {options.map((option) => (
            <button
              className={`dropdown-item ${value === option ? 'active' : ''}`}
              key={option}
              onClick={(event) => {
                event.stopPropagation();
                onChange(option);
                setIsOpen(false);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SettingsPortfolioPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [settings, setSettings] = useState(defaultPortfolioSettings);
  const changedFields = useMemo(() => (
    Object.keys(settings).filter((key) => settings[key] !== defaultPortfolioSettings[key])
  ), [settings]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const resetSettings = () => setSettings(defaultPortfolioSettings);
  const saveSettings = () => runAction(APP_ACTIONS.SAVE_PORTFOLIO_SETTINGS, settings);

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard settings-page settings-portfolio-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Portfolio</h1>
          <div className="page-brief settings-brief">
            <strong>Portfolio preferences</strong>
            <p>Set the reporting currency, benchmark, tax method, fiscal calendar, cash handling, and performance assumptions used across the dashboard.</p>
          </div>
        </section>

        <section className="settings-summary-grid">
          <article className="card settings-summary-card"><span>Portfolio</span><strong>{settings.portfolioName}</strong><small>Primary workspace</small></article>
          <article className="card settings-summary-card"><span>Currency</span><strong>{settings.baseCurrency}</strong><small>Reporting base</small></article>
          <article className="card settings-summary-card"><span>Benchmark</span><strong>{settings.benchmark}</strong><small>Default comparison</small></article>
          <article className="card settings-summary-card"><span>Tax method</span><strong>{settings.taxMethod}</strong><small>Lot selection</small></article>
        </section>

        <section className="settings-layout">
          <article className="card settings-form-card">
            <div className="settings-card-head">
              <div><WalletCards size={24} /><h3>Portfolio Preferences</h3></div>
              <div className="settings-actions">
                <button onClick={resetSettings} type="button"><RotateCcw size={16} />Reset</button>
                <button disabled={pendingAction === APP_ACTIONS.SAVE_PORTFOLIO_SETTINGS} onClick={saveSettings} type="button"><Save size={16} />Save</button>
              </div>
            </div>

            <div className="settings-form-grid">
              <label className="settings-text-field"><span>Portfolio Name</span><input onChange={(event) => updateSetting('portfolioName', event.target.value)} value={settings.portfolioName} /></label>
              <SettingsDropdown label="Base Currency" onChange={(value) => updateSetting('baseCurrency', value)} options={['USD', 'KRW', 'EUR', 'JPY']} value={settings.baseCurrency} />
              <SettingsDropdown label="Benchmark" onChange={(value) => updateSetting('benchmark', value)} options={['S&P 500', 'Nasdaq 100', 'MSCI ACWI', 'KOSPI 200', 'Custom Blend']} value={settings.benchmark} />
              <SettingsDropdown label="Tax Lot Method" onChange={(value) => updateSetting('taxMethod', value)} options={['FIFO', 'LIFO', 'HIFO', 'Specific ID']} value={settings.taxMethod} />
              <SettingsDropdown label="Fiscal Year" onChange={(value) => updateSetting('fiscalYear', value)} options={['Calendar Year', 'Korean Tax Year', 'US Fiscal Year', 'Custom Fiscal Year']} value={settings.fiscalYear} />
              <SettingsDropdown label="Cash Handling" onChange={(value) => updateSetting('cashHandling', value)} options={['Treat cash as allocation', 'Exclude cash from returns', 'Use cash drag adjustment']} value={settings.cashHandling} />
              <SettingsDropdown label="Return Method" onChange={(value) => updateSetting('returnMethod', value)} options={['Time-weighted return', 'Money-weighted return', 'Simple return']} value={settings.returnMethod} />
              <SettingsDropdown label="Dividend Treatment" onChange={(value) => updateSetting('dividendTreatment', value)} options={['Reinvest dividends', 'Track as income', 'Exclude from return']} value={settings.dividendTreatment} />
              <SettingsDropdown label="Allocation Policy" onChange={(value) => updateSetting('allocationPolicy', value)} options={['Conservative', 'Moderate Growth', 'Aggressive Growth', 'Income Focus']} value={settings.allocationPolicy} />
            </div>
          </article>

          <aside className="settings-side-stack">
            <article className="card settings-side-card">
              <h3>Changed Fields</h3>
              {changedFields.length > 0 ? (
                <div className="settings-chip-list">{changedFields.map((field) => <span key={field}>{field}</span>)}</div>
              ) : <StatusState title="No changes" message="Portfolio settings match the default configuration." />}
            </article>

            <article className="card settings-side-card">
              <h3>Return Assumptions</h3>
              <div className="settings-assumption-row"><ShieldCheck size={16} /><span>{settings.returnMethod}</span></div>
              <div className="settings-assumption-row"><ShieldCheck size={16} /><span>{settings.dividendTreatment}</span></div>
              <div className="settings-assumption-row"><ShieldCheck size={16} /><span>{settings.cashHandling}</span></div>
            </article>

            <article className="card settings-side-card">
              <h3>Allocation Defaults</h3>
              <div className="settings-policy-row"><span>US Equity</span><b>45%</b></div>
              <div className="settings-policy-row"><span>International Equity</span><b>25%</b></div>
              <div className="settings-policy-row"><span>Fixed Income</span><b>20%</b></div>
              <div className="settings-policy-row"><span>Cash</span><b>10%</b></div>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}

function sourceTone(status) {
  if (status === 'Connected') return 'green';
  if (status === 'Needs Review') return 'orange';
  return 'red';
}

function SettingsDataPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [sources, setSources] = useState(defaultDataSettings.sources);
  const [rules, setRules] = useState(defaultDataSettings.rules);
  const [selectedSourceId, setSelectedSourceId] = useState(defaultDataSettings.sources[0]?.id);
  const selectedSource = sources.find((source) => source.id === selectedSourceId) ?? sources[0];
  const connectedCount = sources.filter((source) => source.enabled && source.status === 'Connected').length;
  const reviewCount = defaultDataSettings.importQueue.filter((row) => row.status === 'Review').length;
  const averageHealth = Math.round(sources.reduce((sum, source) => sum + source.health, 0) / sources.length);
  const changedSources = useMemo(() => (
    sources.filter((source) => {
      const original = defaultDataSettings.sources.find((item) => item.id === source.id);
      return original && (
        original.enabled !== source.enabled ||
        original.cadence !== source.cadence ||
        original.provider !== source.provider
      );
    })
  ), [sources]);
  const changedRules = useMemo(() => (
    Object.keys(rules).filter((key) => rules[key] !== defaultDataSettings.rules[key])
  ), [rules]);

  const updateSource = (id, patch) => {
    setSources((current) => current.map((source) => (
      source.id === id ? { ...source, ...patch } : source
    )));
  };

  const updateRule = (key, value) => setRules((current) => ({ ...current, [key]: value }));

  const resetDataSettings = () => {
    setSources(defaultDataSettings.sources);
    setRules(defaultDataSettings.rules);
    setSelectedSourceId(defaultDataSettings.sources[0]?.id);
  };

  const saveDataSettings = () => runAction(APP_ACTIONS.SAVE_DATA_CONNECTIONS, { sources, rules });
  const testConnection = (source) => runAction(APP_ACTIONS.TEST_DATA_CONNECTION, source);
  const syncConnection = (source) => runAction(APP_ACTIONS.SYNC_DATA_CONNECTION, source);
  const downloadTemplate = () => runAction(APP_ACTIONS.DOWNLOAD_REPORT, {
    reportName: 'Data Import Template',
    type: 'CSV',
    rows: [
      { Date: '2026-05-17', Symbol: 'NVDA', Type: 'Buy', Quantity: 10, Price: 1024.32, Account: 'Growth' },
      { Date: '2026-05-17', Symbol: 'MSFT', Type: 'Dividend', Quantity: 120, Price: 0.83, Account: 'Core' },
    ],
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard settings-page settings-data-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Data Sources</h1>
          <div className="page-brief settings-brief">
            <strong>Broker and import connections</strong>
            <p>Manage broker sync, market data, reference feeds, CSV staging, duplicate rules, and connection health before data reaches portfolio analytics.</p>
          </div>
        </section>

        <section className="settings-summary-grid">
          <article className="card settings-summary-card"><span>Connected</span><strong>{connectedCount}/{sources.length}</strong><small>Enabled sources online</small></article>
          <article className="card settings-summary-card"><span>Health</span><strong>{averageHealth}%</strong><small>Average feed score</small></article>
          <article className="card settings-summary-card"><span>Latest Sync</span><strong>{sources[1]?.lastSync}</strong><small>{sources[1]?.name}</small></article>
          <article className="card settings-summary-card"><span>Review Queue</span><strong>{reviewCount}</strong><small>Imports need attention</small></article>
        </section>

        <section className="settings-layout settings-data-layout">
          <article className="card settings-form-card data-source-card">
            <div className="settings-card-head">
              <div><Database size={24} /><h3>Connection Manager</h3></div>
              <div className="settings-actions">
                <button onClick={resetDataSettings} type="button"><RotateCcw size={16} />Reset</button>
                <button disabled={pendingAction === APP_ACTIONS.SAVE_DATA_CONNECTIONS} onClick={saveDataSettings} type="button"><Save size={16} />Save</button>
              </div>
            </div>

            <div className="data-source-list">
              {sources.map((source) => (
                <button
                  className={`data-source-row ${selectedSource?.id === source.id ? 'active' : ''}`}
                  key={source.id}
                  onClick={() => setSelectedSourceId(source.id)}
                  type="button"
                >
                  <span className="data-source-icon"><ServerCog size={18} /></span>
                  <span className="data-source-main">
                    <strong>{source.name}</strong>
                    <small>{source.provider} / {source.account}</small>
                  </span>
                  <span className={`data-status ${sourceTone(source.status)}`}>{source.status}</span>
                  <span className="data-health">{source.health}%</span>
                </button>
              ))}
            </div>
          </article>

          <aside className="settings-side-stack">
            <article className="card settings-side-card data-detail-card">
              <div className="data-detail-head">
                <h3>{selectedSource.name}</h3>
                <label className="settings-toggle">
                  <input
                    checked={selectedSource.enabled}
                    onChange={(event) => updateSource(selectedSource.id, { enabled: event.target.checked })}
                    type="checkbox"
                  />
                  <span>{selectedSource.enabled ? 'Enabled' : 'Paused'}</span>
                </label>
              </div>
              <div className="data-detail-grid">
                <div><span>Type</span><strong>{selectedSource.type}</strong></div>
                <div><span>Owner</span><strong>{selectedSource.owner}</strong></div>
                <div><span>Last sync</span><strong>{selectedSource.lastSync}</strong></div>
                <div><span>Health</span><strong>{selectedSource.health}%</strong></div>
              </div>
              <SettingsDropdown
                label="Sync Cadence"
                onChange={(value) => updateSource(selectedSource.id, { cadence: value })}
                options={['Real-time', 'Every 15 minutes', 'Hourly', 'Daily', 'Manual']}
                value={selectedSource.cadence}
              />
              <div className="settings-chip-list data-scope-list">
                {selectedSource.scope.map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="settings-actions data-detail-actions">
                <button disabled={pendingAction === APP_ACTIONS.TEST_DATA_CONNECTION} onClick={() => testConnection(selectedSource)} type="button"><PlugZap size={16} />Test</button>
                <button disabled={pendingAction === APP_ACTIONS.SYNC_DATA_CONNECTION} onClick={() => syncConnection(selectedSource)} type="button"><RefreshCw size={16} />Sync</button>
              </div>
            </article>

            <article className="card settings-side-card">
              <h3>Unsaved Changes</h3>
              {changedSources.length || changedRules.length ? (
                <div className="settings-chip-list">
                  {changedSources.map((source) => <span key={source.id}>{source.name}</span>)}
                  {changedRules.map((rule) => <span key={rule}>{rule}</span>)}
                </div>
              ) : <StatusState title="No changes" message="Data source settings match the default configuration." />}
            </article>
          </aside>
        </section>

        <section className="settings-data-lower">
          <article className="card settings-form-card">
            <div className="settings-card-head">
              <div><UploadCloud size={24} /><h3>Import Rules</h3></div>
              <div className="settings-actions">
                <button onClick={downloadTemplate} type="button"><Download size={16} />Template</button>
              </div>
            </div>
            <div className="settings-form-grid">
              <SettingsDropdown label="Import Mode" onChange={(value) => updateRule('importMode', value)} options={['Stage before posting', 'Post automatically', 'Review broker-only']} value={rules.importMode} />
              <SettingsDropdown label="Duplicate Handling" onChange={(value) => updateRule('duplicateHandling', value)} options={['Flag for review', 'Skip exact matches', 'Overwrite staged rows']} value={rules.duplicateHandling} />
              <SettingsDropdown label="Price Source" onChange={(value) => updateRule('priceSource', value)} options={['Market Data Feed', 'Broker close', 'Exchange official close']} value={rules.priceSource} />
              <SettingsDropdown label="Timezone" onChange={(value) => updateRule('timezone', value)} options={['Asia/Seoul', 'America/New_York', 'UTC', 'Europe/London']} value={rules.timezone} />
            </div>
          </article>

          <article className="card settings-form-card import-queue-card">
            <div className="settings-card-head">
              <div><Cable size={24} /><h3>Import Queue</h3></div>
            </div>
            <div className="settings-table-wrap">
              <table className="settings-data-table">
                <thead>
                  <tr><th>File</th><th>Type</th><th>Rows</th><th>Status</th><th>Received</th><th>Issues</th></tr>
                </thead>
                <tbody>
                  {defaultDataSettings.importQueue.map((row) => (
                    <tr key={row.id}>
                      <td>{row.file}</td>
                      <td>{row.type}</td>
                      <td>{row.rows}</td>
                      <td><span className={`data-status ${row.status === 'Review' ? 'orange' : 'green'}`}>{row.status}</span></td>
                      <td>{row.received}</td>
                      <td>{row.issues ? `${row.issues} issues` : 'Clean'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card settings-form-card data-quality-card">
            <div className="settings-card-head">
              <div><CheckCircle2 size={24} /><h3>Data Quality Checks</h3></div>
            </div>
            <div className="data-quality-list">
              <div><CheckCircle2 size={17} /><span>Position totals reconcile with broker balances.</span></div>
              <div><Clock3 size={17} /><span>Dividend file has 3 rows waiting for classification.</span></div>
              <div><ShieldCheck size={17} /><span>Market data feed covers all portfolio symbols.</span></div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default function SettingsPage(props) {
  if (props.activeSidebarItem === 'settings-portfolio') {
    return <SettingsPortfolioPage {...props} />;
  }

  if (props.activeSidebarItem === 'settings-data') {
    return <SettingsDataPage {...props} />;
  }

  return <SubPageShell {...props} fallbackTitle="Settings" />;
}
