import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, Save, ShieldCheck, WalletCards } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import StatusState from '../components/StatusState.jsx';
import { APP_ACTIONS } from '../services/appActions';
import { getPortfolioSettings } from '../data/mock/selectors';

const defaultPortfolioSettings = getPortfolioSettings();

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

export default function SettingsPage(props) {
  if (props.activeSidebarItem === 'settings-portfolio') {
    return <SettingsPortfolioPage {...props} />;
  }

  return <SubPageShell {...props} fallbackTitle="Settings" />;
}
