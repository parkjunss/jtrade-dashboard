import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  AtSign,
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  Building2,
  Cable,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Download,
  Hash,
  MapPin,
  Mail,
  MessageSquare,
  Palette,
  Phone,
  PlugZap,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Timer,
  UploadCloud,
  UserRound,
  WalletCards,
} from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import SubPageShell from './SubPageShell.jsx';
import { useAppAction } from '../context/AppActionContext.jsx';
import StatusState from '../components/StatusState.jsx';
import { APP_ACTIONS } from '../services/appActions';
import { getPortfolioSettings, getSettingsDataSources, getSettingsNotifications, getSettingsProfile } from '../data/mock/selectors';

const defaultPortfolioSettings = getPortfolioSettings();
const defaultProfileSettings = getSettingsProfile();
const defaultDataSettings = getSettingsDataSources();
const defaultNotificationSettings = getSettingsNotifications();

const settingsOverviewCards = [
  {
    id: 'settings-profile',
    title: 'Profile',
    description: 'Account identity, locale, and owner information.',
    metric: defaultProfileSettings.displayName,
    status: 'Ready',
    Icon: UserRound,
  },
  {
    id: 'settings-portfolio',
    title: 'Portfolio',
    description: 'Currency, benchmark, tax method, fiscal year, and return assumptions.',
    metric: defaultPortfolioSettings.baseCurrency,
    status: defaultPortfolioSettings.benchmark,
    Icon: WalletCards,
  },
  {
    id: 'settings-data',
    title: 'Data Sources',
    description: 'Broker, market data, import inbox, and exchange calendar sync.',
    metric: `${defaultDataSettings.sources.filter((source) => source.enabled).length}/${defaultDataSettings.sources.length}`,
    status: 'Sources enabled',
    Icon: Database,
  },
  {
    id: 'settings-notifications',
    title: 'Notifications',
    description: 'Delivery channels, alert rules, quiet hours, and escalation policy.',
    metric: `${defaultNotificationSettings.channels.filter((channel) => channel.enabled).length}/${defaultNotificationSettings.channels.length}`,
    status: 'Channels enabled',
    Icon: BellRing,
  },
  {
    id: 'settings-appearance',
    title: 'Appearance',
    description: 'Theme, density, number format, and dashboard display defaults.',
    metric: 'Light',
    status: 'Theme pinned',
    Icon: Palette,
  },
  {
    id: 'settings-security',
    title: 'Security',
    description: 'Password, sessions, authentication, and account protection.',
    metric: '2FA',
    status: 'Recommended',
    Icon: ShieldCheck,
  },
];

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

function SettingsOverviewPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const dataConnected = defaultDataSettings.sources.filter((source) => source.status === 'Connected').length;
  const activeRules = defaultNotificationSettings.rules.filter((rule) => rule.enabled).length;
  const securityTasks = [
    'Review trusted sessions every month',
    'Enable two-factor authentication before brokerage sync',
    'Confirm export permissions for report downloads',
  ];

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard settings-page settings-overview-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Settings</h1>
          <div className="page-brief settings-brief">
            <strong>Workspace configuration</strong>
            <p>Review account setup, portfolio assumptions, data connections, notification routing, visual preferences, and security readiness from one place.</p>
          </div>
        </section>

        <section className="settings-summary-grid">
          <article className="card settings-summary-card"><span>Portfolio</span><strong>{defaultPortfolioSettings.portfolioName}</strong><small>{defaultPortfolioSettings.allocationPolicy}</small></article>
          <article className="card settings-summary-card"><span>Data Health</span><strong>{dataConnected}/{defaultDataSettings.sources.length}</strong><small>Connected sources</small></article>
          <article className="card settings-summary-card"><span>Alerts</span><strong>{activeRules}</strong><small>Active rules</small></article>
          <article className="card settings-summary-card"><span>Security</span><strong>Review</strong><small>2FA not yet configured</small></article>
        </section>

        <section className="settings-overview-layout">
          <div className="settings-overview-grid">
            {settingsOverviewCards.map(({ id, title, description, metric, status, Icon }) => (
              <button
                className="card settings-overview-card"
                key={id}
                onClick={() => onSidebarSelect(id)}
                type="button"
              >
                <span className="settings-overview-icon"><Icon size={21} /></span>
                <span className="settings-overview-main">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <span className="settings-overview-meta">
                  <b>{metric}</b>
                  <small>{status}</small>
                </span>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>

          <aside className="settings-side-stack">
            <article className="card settings-side-card settings-readiness-card">
              <h3>Readiness</h3>
              <div className="settings-readiness-list">
                <div><CheckCircle2 size={17} /><span>Portfolio settings are configured for {defaultPortfolioSettings.baseCurrency} reporting.</span></div>
                <div><CheckCircle2 size={17} /><span>{dataConnected} data sources are connected and ready for sync.</span></div>
                <div><BellRing size={17} /><span>{activeRules} alert rules are active across {defaultNotificationSettings.channels.length} channels.</span></div>
              </div>
            </article>

            <article className="card settings-side-card settings-readiness-card">
              <h3>Security Checklist</h3>
              <div className="settings-readiness-list">
                {securityTasks.map((task) => (
                  <div key={task}><ShieldCheck size={17} /><span>{task}</span></div>
                ))}
              </div>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}

function SettingsProfilePage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [profile, setProfile] = useState(defaultProfileSettings);
  const changedFields = useMemo(() => (
    Object.keys(profile).filter((key) => profile[key] !== defaultProfileSettings[key])
  ), [profile]);
  const initials = profile.displayName
    .split(' ')
    .map((part) => part.slice(0, 1))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const updateProfile = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const resetProfile = () => setProfile(defaultProfileSettings);
  const saveProfile = () => runAction(APP_ACTIONS.SAVE_PROFILE_SETTINGS, profile);

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard settings-page settings-profile-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Profile</h1>
          <div className="page-brief settings-brief">
            <strong>Account identity</strong>
            <p>Manage account owner details, contact routing, organization context, locale defaults, and workspace identity used across reports and notifications.</p>
          </div>
        </section>

        <section className="settings-summary-grid">
          <article className="card settings-summary-card"><span>Owner</span><strong>{profile.displayName}</strong><small>{profile.role}</small></article>
          <article className="card settings-summary-card"><span>Account</span><strong>{profile.accountId}</strong><small>{profile.plan} plan</small></article>
          <article className="card settings-summary-card"><span>Locale</span><strong>{profile.timezone}</strong><small>{profile.language}</small></article>
          <article className="card settings-summary-card"><span>Workspace</span><strong>{profile.defaultWorkspace}</strong><small>Default landing context</small></article>
        </section>

        <section className="settings-layout settings-profile-layout">
          <article className="card settings-form-card">
            <div className="settings-card-head">
              <div><UserRound size={24} /><h3>Profile Details</h3></div>
              <div className="settings-actions">
                <button onClick={resetProfile} type="button"><RotateCcw size={16} />Reset</button>
                <button disabled={pendingAction === APP_ACTIONS.SAVE_PROFILE_SETTINGS} onClick={saveProfile} type="button"><Save size={16} />Save</button>
              </div>
            </div>

            <div className="settings-profile-hero">
              <span className="settings-avatar">{initials}</span>
              <div>
                <strong>{profile.displayName}</strong>
                <small>{profile.email} / {profile.organization}</small>
              </div>
            </div>

            <div className="settings-form-grid">
              <label className="settings-text-field"><span>Display Name</span><input onChange={(event) => updateProfile('displayName', event.target.value)} value={profile.displayName} /></label>
              <label className="settings-text-field"><span>Username</span><input onChange={(event) => updateProfile('username', event.target.value)} value={profile.username} /></label>
              <label className="settings-text-field"><span>Email</span><input onChange={(event) => updateProfile('email', event.target.value)} value={profile.email} /></label>
              <label className="settings-text-field"><span>Phone</span><input onChange={(event) => updateProfile('phone', event.target.value)} value={profile.phone} /></label>
              <label className="settings-text-field"><span>Role</span><input onChange={(event) => updateProfile('role', event.target.value)} value={profile.role} /></label>
              <label className="settings-text-field"><span>Organization</span><input onChange={(event) => updateProfile('organization', event.target.value)} value={profile.organization} /></label>
              <label className="settings-text-field"><span>Location</span><input onChange={(event) => updateProfile('location', event.target.value)} value={profile.location} /></label>
              <SettingsDropdown label="Timezone" onChange={(value) => updateProfile('timezone', value)} options={['Asia/Seoul', 'America/New_York', 'UTC', 'Europe/London']} value={profile.timezone} />
              <SettingsDropdown label="Language" onChange={(value) => updateProfile('language', value)} options={['English', 'Korean', 'Japanese', 'German']} value={profile.language} />
              <SettingsDropdown label="Date Format" onChange={(value) => updateProfile('dateFormat', value)} options={['MMM DD, YYYY', 'YYYY-MM-DD', 'DD MMM YYYY', 'MM/DD/YYYY']} value={profile.dateFormat} />
              <SettingsDropdown label="Contact Preference" onChange={(value) => updateProfile('contactPreference', value)} options={['Email first', 'Push first', 'SMS for critical', 'Team channel first']} value={profile.contactPreference} />
              <SettingsDropdown label="Default Workspace" onChange={(value) => updateProfile('defaultWorkspace', value)} options={['QorTrade Core Portfolio', 'Income Sleeve', 'Growth Watchlist', 'Research Workspace']} value={profile.defaultWorkspace} />
              <label className="settings-text-field settings-bio-field"><span>Bio</span><input onChange={(event) => updateProfile('bio', event.target.value)} value={profile.bio} /></label>
            </div>
          </article>

          <aside className="settings-side-stack">
            <article className="card settings-side-card">
              <h3>Contact Card</h3>
              <div className="settings-contact-list">
                <div><AtSign size={17} /><span>{profile.email}</span></div>
                <div><Phone size={17} /><span>{profile.phone}</span></div>
                <div><MapPin size={17} /><span>{profile.location}</span></div>
                <div><Building2 size={17} /><span>{profile.organization}</span></div>
              </div>
            </article>

            <article className="card settings-side-card">
              <h3>Account Status</h3>
              <div className="settings-contact-list">
                <div><BadgeCheck size={17} /><span>{profile.plan} plan / joined {profile.joined}</span></div>
                <div><BriefcaseBusiness size={17} /><span>{profile.role}</span></div>
                <div><ShieldCheck size={17} /><span>Profile data is available to reports and alerts.</span></div>
              </div>
            </article>

            <article className="card settings-side-card">
              <h3>Unsaved Changes</h3>
              {changedFields.length ? (
                <div className="settings-chip-list">{changedFields.map((field) => <span key={field}>{field}</span>)}</div>
              ) : <StatusState title="No changes" message="Profile settings match the default configuration." />}
            </article>
          </aside>
        </section>
      </main>
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

function channelIcon(channelId) {
  if (channelId === 'email') return Mail;
  if (channelId === 'push') return Smartphone;
  if (channelId === 'sms') return MessageSquare;
  if (channelId === 'slack') return Hash;
  return BellRing;
}

function severityTone(severity) {
  if (severity === 'Critical') return 'red';
  if (severity === 'High') return 'orange';
  if (severity === 'Low') return 'neutral';
  return 'green';
}

function cloneNotificationSettings() {
  return {
    channels: defaultNotificationSettings.channels.map((channel) => ({ ...channel })),
    rules: defaultNotificationSettings.rules.map((rule) => ({ ...rule, channels: [...rule.channels] })),
    delivery: { ...defaultNotificationSettings.delivery },
    recent: defaultNotificationSettings.recent,
  };
}

function SettingsNotificationsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [settings, setSettings] = useState(cloneNotificationSettings);
  const [selectedRuleId, setSelectedRuleId] = useState(defaultNotificationSettings.rules[0]?.id);
  const selectedRule = settings.rules.find((rule) => rule.id === selectedRuleId) ?? settings.rules[0];
  const enabledChannels = settings.channels.filter((channel) => channel.enabled).length;
  const activeRules = settings.rules.filter((rule) => rule.enabled).length;
  const criticalRules = settings.rules.filter((rule) => rule.severity === 'Critical').length;
  const changedItems = useMemo(() => {
    const channelChanges = settings.channels.filter((channel) => {
      const original = defaultNotificationSettings.channels.find((item) => item.id === channel.id);
      return original && (
        original.enabled !== channel.enabled ||
        original.severity !== channel.severity ||
        original.quietHours !== channel.quietHours
      );
    }).map((channel) => channel.name);
    const ruleChanges = settings.rules.filter((rule) => {
      const original = defaultNotificationSettings.rules.find((item) => item.id === rule.id);
      return original && (
        original.enabled !== rule.enabled ||
        original.category !== rule.category ||
        original.severity !== rule.severity ||
        original.trigger !== rule.trigger ||
        original.channels.join('|') !== rule.channels.join('|')
      );
    }).map((rule) => rule.name);
    const deliveryChanges = Object.keys(settings.delivery).filter((key) => (
      settings.delivery[key] !== defaultNotificationSettings.delivery[key]
    ));

    return [...channelChanges, ...ruleChanges, ...deliveryChanges];
  }, [settings]);

  const updateChannel = (id, patch) => {
    setSettings((current) => ({
      ...current,
      channels: current.channels.map((channel) => (
        channel.id === id ? { ...channel, ...patch } : channel
      )),
    }));
  };

  const updateRule = (id, patch) => {
    setSettings((current) => ({
      ...current,
      rules: current.rules.map((rule) => (
        rule.id === id ? { ...rule, ...patch } : rule
      )),
    }));
  };

  const toggleRuleChannel = (channelName) => {
    const nextChannels = selectedRule.channels.includes(channelName)
      ? selectedRule.channels.filter((item) => item !== channelName)
      : [...selectedRule.channels, channelName];
    updateRule(selectedRule.id, { channels: nextChannels });
  };

  const updateDelivery = (key, value) => {
    setSettings((current) => ({ ...current, delivery: { ...current.delivery, [key]: value } }));
  };

  const resetNotificationSettings = () => {
    setSettings(cloneNotificationSettings());
    setSelectedRuleId(defaultNotificationSettings.rules[0]?.id);
  };
  const saveNotificationSettings = () => runAction(APP_ACTIONS.SAVE_NOTIFICATION_SETTINGS, {
    channels: settings.channels,
    rules: settings.rules,
    delivery: settings.delivery,
  });
  const testNotificationChannel = (channel) => runAction(APP_ACTIONS.TEST_NOTIFICATION_CHANNEL, channel);

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard settings-page settings-notifications-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Notifications</h1>
          <div className="page-brief settings-brief">
            <strong>Alert delivery controls</strong>
            <p>Configure portfolio alerts, channel routing, severity thresholds, quiet hours, and escalation behavior for market, risk, research, and reporting events.</p>
          </div>
        </section>

        <section className="settings-summary-grid">
          <article className="card settings-summary-card"><span>Channels</span><strong>{enabledChannels}/{settings.channels.length}</strong><small>Enabled delivery routes</small></article>
          <article className="card settings-summary-card"><span>Alert Rules</span><strong>{activeRules}</strong><small>Active notification rules</small></article>
          <article className="card settings-summary-card"><span>Critical Rules</span><strong>{criticalRules}</strong><small>Escalation monitored</small></article>
          <article className="card settings-summary-card"><span>Digest</span><strong>{settings.delivery.digestCadence}</strong><small>{settings.delivery.timezone}</small></article>
        </section>

        <section className="settings-layout settings-notification-layout">
          <article className="card settings-form-card notification-channel-card">
            <div className="settings-card-head">
              <div><BellRing size={24} /><h3>Notification Channels</h3></div>
              <div className="settings-actions">
                <button onClick={resetNotificationSettings} type="button"><RotateCcw size={16} />Reset</button>
                <button disabled={pendingAction === APP_ACTIONS.SAVE_NOTIFICATION_SETTINGS} onClick={saveNotificationSettings} type="button"><Save size={16} />Save</button>
              </div>
            </div>

            <div className="notification-channel-list">
              {settings.channels.map((channel) => {
                const Icon = channelIcon(channel.id);

                return (
                  <div className="notification-channel-row" key={channel.id}>
                    <span className="data-source-icon"><Icon size={18} /></span>
                    <span className="data-source-main">
                      <strong>{channel.name}</strong>
                      <small>{channel.destination}</small>
                    </span>
                    <span className={`data-status ${channel.enabled ? 'green' : 'neutral'}`}>{channel.health}</span>
                    <label className="settings-toggle">
                      <input
                        checked={channel.enabled}
                        onChange={(event) => updateChannel(channel.id, { enabled: event.target.checked })}
                        type="checkbox"
                      />
                      <span>{channel.enabled ? 'Enabled' : 'Paused'}</span>
                    </label>
                    <SettingsDropdown
                      label="Severity"
                      onChange={(value) => updateChannel(channel.id, { severity: value })}
                      options={['All alerts', 'Medium and above', 'High and critical', 'Critical only']}
                      value={channel.severity}
                    />
                    <button
                      className="notification-test-button"
                      disabled={pendingAction === APP_ACTIONS.TEST_NOTIFICATION_CHANNEL}
                      onClick={() => testNotificationChannel(channel)}
                      type="button"
                    >
                      <Send size={15} />Test
                    </button>
                  </div>
                );
              })}
            </div>
          </article>

          <aside className="settings-side-stack">
            <article className="card settings-side-card notification-rule-card">
              <div className="data-detail-head">
                <h3>{selectedRule.name}</h3>
                <label className="settings-toggle">
                  <input
                    checked={selectedRule.enabled}
                    onChange={(event) => updateRule(selectedRule.id, { enabled: event.target.checked })}
                    type="checkbox"
                  />
                  <span>{selectedRule.enabled ? 'Active' : 'Paused'}</span>
                </label>
              </div>

              <div className="settings-form-grid notification-rule-editor">
                <SettingsDropdown label="Category" onChange={(value) => updateRule(selectedRule.id, { category: value })} options={['Market', 'Portfolio', 'Research', 'Risk', 'Reports']} value={selectedRule.category} />
                <SettingsDropdown label="Severity" onChange={(value) => updateRule(selectedRule.id, { severity: value })} options={['Low', 'Medium', 'High', 'Critical']} value={selectedRule.severity} />
                <label className="settings-text-field notification-trigger-field"><span>Trigger</span><input onChange={(event) => updateRule(selectedRule.id, { trigger: event.target.value })} value={selectedRule.trigger} /></label>
              </div>

              <div className="notification-channel-picks">
                {settings.channels.map((channel) => (
                  <button
                    className={selectedRule.channels.includes(channel.name) ? 'active' : ''}
                    key={channel.id}
                    onClick={() => toggleRuleChannel(channel.name)}
                    type="button"
                  >
                    {channel.name}
                  </button>
                ))}
              </div>
            </article>

            <article className="card settings-side-card">
              <h3>Unsaved Changes</h3>
              {changedItems.length ? (
                <div className="settings-chip-list">{changedItems.map((item) => <span key={item}>{item}</span>)}</div>
              ) : <StatusState title="No changes" message="Notification settings match the default configuration." />}
            </article>
          </aside>
        </section>

        <section className="settings-data-lower notification-lower">
          <article className="card settings-form-card">
            <div className="settings-card-head">
              <div><Timer size={24} /><h3>Delivery Preferences</h3></div>
            </div>
            <div className="settings-form-grid">
              <SettingsDropdown label="Digest Cadence" onChange={(value) => updateDelivery('digestCadence', value)} options={['Real-time only', 'Hourly digest', 'Daily market close', 'Weekly summary']} value={settings.delivery.digestCadence} />
              <SettingsDropdown label="Quiet Hours" onChange={(value) => updateDelivery('quietHours', value)} options={['Disabled', '22:00 - 07:00', '21:00 - 08:00', 'Weekends only']} value={settings.delivery.quietHours} />
              <SettingsDropdown label="Timezone" onChange={(value) => updateDelivery('timezone', value)} options={['Asia/Seoul', 'America/New_York', 'UTC', 'Europe/London']} value={settings.delivery.timezone} />
              <SettingsDropdown label="Escalation" onChange={(value) => updateDelivery('escalation', value)} options={['Disabled', 'Critical after 10 minutes', 'Critical after 30 minutes', 'High and critical after 30 minutes']} value={settings.delivery.escalation} />
            </div>
          </article>

          <article className="card settings-form-card notification-rules-table-card">
            <div className="settings-card-head">
              <div><SlidersHorizontal size={24} /><h3>Alert Rules</h3></div>
            </div>
            <div className="settings-table-wrap">
              <table className="settings-data-table">
                <thead>
                  <tr><th>Rule</th><th>Category</th><th>Severity</th><th>Channels</th><th>Last Triggered</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {settings.rules.map((rule) => (
                    <tr className={selectedRule.id === rule.id ? 'active-row' : ''} key={rule.id} onClick={() => setSelectedRuleId(rule.id)}>
                      <td>{rule.name}</td>
                      <td>{rule.category}</td>
                      <td><span className={`data-status ${severityTone(rule.severity)}`}>{rule.severity}</span></td>
                      <td>{rule.channels.join(', ')}</td>
                      <td>{rule.lastTriggered}</td>
                      <td>{rule.enabled ? 'Active' : 'Paused'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card settings-form-card data-quality-card notification-recent-card">
            <div className="settings-card-head">
              <div><AlertTriangle size={24} /><h3>Recent Notifications</h3></div>
            </div>
            <div className="notification-recent-list">
              {settings.recent.map((item) => (
                <div key={item.id}>
                  <span className={`data-status ${severityTone(item.severity)}`}>{item.severity}</span>
                  <strong>{item.title}</strong>
                  <small>{item.category} / {item.channel} / {item.time} / {item.status}</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default function SettingsPage(props) {
  if (props.activeSidebarItem === 'settings-overview') {
    return <SettingsOverviewPage {...props} />;
  }

  if (props.activeSidebarItem === 'settings-profile') {
    return <SettingsProfilePage {...props} />;
  }

  if (props.activeSidebarItem === 'settings-portfolio') {
    return <SettingsPortfolioPage {...props} />;
  }

  if (props.activeSidebarItem === 'settings-data') {
    return <SettingsDataPage {...props} />;
  }

  if (props.activeSidebarItem === 'settings-notifications') {
    return <SettingsNotificationsPage {...props} />;
  }

  return <SubPageShell {...props} fallbackTitle="Settings" />;
}
