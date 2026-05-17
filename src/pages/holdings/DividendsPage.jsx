import { CalendarDays, CircleDollarSign, Download, Filter, PieChart, Search, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { useSelection } from '../../hooks/useSelection.js';
import { APP_ACTIONS } from '../../services/appActions';
import { getHoldingsDividendData, getTickerStrip } from '../../data/mock/selectors';

const tickerStrip = getTickerStrip();
const dividendData = getHoldingsDividendData();

const summaryIcons = [CircleDollarSign, TrendingUp, CalendarDays, PieChart];
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function DividendSummaryCard({ item, icon: Icon }) {
  return (
    <article className={`card dividend-summary-card ${item.tone ?? 'neutral'}`}>
      <div className="dividend-summary-icon"><Icon size={24} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

export default function DividendsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [query, setQuery] = useState('');
  const statusFilter = useSelection('All');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleCalendar = useMemo(() => (
    dividendData.calendar.filter((row) => {
      const matchesQuery = !normalizedQuery || `${row.symbol} ${row.name} ${row.status} ${row.taxType}`.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter.isSelected('All') || row.status === statusFilter.value;
      return matchesQuery && matchesStatus;
    })
  ), [normalizedQuery, statusFilter.value]);
  const maxMonthlyIncome = Math.max(...dividendData.incomeByMonth.map((row) => row.income));
  const exportRows = visibleCalendar.map((row) => ({
    Symbol: row.symbol,
    Name: row.name,
    'Ex Date': row.exDate,
    'Pay Date': row.payDate,
    Amount: row.amount,
    Shares: row.shares,
    Income: row.income,
    Frequency: row.frequency,
    Status: row.status,
    'Tax Type': row.taxType,
  }));

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard holdings-page dividends-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Dividends</h1>
          <div className="market-brief"><span></span><b>Holdings</b><p>Dividend calendar, forward income, yield mix, and tax character by holding.</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="dividend-summary-grid">
          {dividendData.summary.map((item, index) => (
            <DividendSummaryCard icon={summaryIcons[index]} item={item} key={item.label} />
          ))}
        </section>

        <section className="dividend-layout">
          <article className="card dividend-calendar-card">
            <div className="holdings-table-head">
              <h3>Dividend Calendar</h3>
              <div className="holdings-actions">
                <div className="holdings-search">
                  <Search size={16} />
                  <input onChange={(event) => setQuery(event.target.value)} placeholder="Search dividend events..." type="text" value={query} />
                </div>
                <button type="button"><Filter size={16} />{statusFilter.value}</button>
                <button disabled={pendingAction === APP_ACTIONS.DOWNLOAD_REPORT} onClick={() => runAction(APP_ACTIONS.DOWNLOAD_REPORT, { reportName: 'Dividend Calendar', type: 'CSV', rows: exportRows })} type="button"><Download size={16} />Export</button>
              </div>
            </div>

            <div className="holdings-filter-tabs">
              {['All', 'Declared', 'Estimated'].map((filter) => (
                <button className={statusFilter.isSelected(filter) ? 'active' : ''} key={filter} onClick={() => statusFilter.select(filter)} type="button">{filter}</button>
              ))}
            </div>

            <div className="dividend-calendar-table">
              <div className="dividend-calendar-row dividend-calendar-header">
                <span>Symbol</span><span>Ex-Date</span><span>Pay Date</span><span>Amount</span><span>Shares</span><span>Income</span><span>Status</span><span>Tax</span>
              </div>
              {visibleCalendar.map((row) => (
                <div className="dividend-calendar-row" key={row.id}>
                  <strong>{row.symbol}<small>{row.name}</small></strong>
                  <span>{row.exDate}</span>
                  <span>{row.payDate}</span>
                  <span>${row.amount.toFixed(2)}</span>
                  <span>{row.shares}</span>
                  <b>{money.format(row.income)}</b>
                  <em className={row.status === 'Declared' ? 'green' : ''}>{row.status}</em>
                  <span>{row.taxType}</span>
                </div>
              ))}
              {visibleCalendar.length === 0 ? <StatusState title="No dividend events" message="Clear search or switch event status filters." /> : null}
            </div>
          </article>

          <aside className="dividend-side-stack">
            <article className="card dividend-income-card">
              <div className="holdings-card-head">
                <h3>Income Forecast</h3>
                <span>12M</span>
              </div>
              <div className="dividend-bar-chart">
                {dividendData.incomeByMonth.map((row) => (
                  <div key={row.month}>
                    <i style={{ height: `${Math.max(12, (row.income / maxMonthlyIncome) * 100)}%` }} />
                    <span>{row.month}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="card dividend-tax-card">
              <h3>Tax Mix</h3>
              {dividendData.taxMix.map((row) => (
                <div className="dividend-tax-row" key={row.label}>
                  <span>{row.label}</span>
                  <div><i style={{ width: `${row.value}%` }} /></div>
                  <strong>{row.value}%</strong>
                  <small>{row.amount}</small>
                </div>
              ))}
            </article>
          </aside>
        </section>

        <section className="card dividend-holdings-card">
          <div className="holdings-card-head">
            <h3>Income by Holding</h3>
          </div>
          <div className="dividend-holdings-table">
            <div className="dividend-holding-row dividend-calendar-header">
              <span>Symbol</span><span>Weight</span><span>Yield</span><span>Annual Income</span><span>Income Share</span><span>Frequency</span><span>Growth</span>
            </div>
            {dividendData.holdings.map((row) => (
              <div className="dividend-holding-row" key={row.symbol}>
                <strong>{row.symbol}<small>{row.name}</small></strong>
                <span>{row.weight}</span>
                <span>{row.yield.toFixed(2)}%</span>
                <b>{money.format(row.annualIncome)}</b>
                <div className="dividend-income-share"><i style={{ width: `${row.incomeShare * 4}%` }} /></div>
                <span>{row.frequency}</span>
                <em className={row.growth.startsWith('+') ? 'green' : 'red'}>{row.growth}</em>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
