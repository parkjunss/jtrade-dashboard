import Sparkline from '../../components/Sparkline.jsx';
import { getHoldingsPositionDetails } from '../../data/mock/selectors';

export const positionDetails = getHoldingsPositionDetails();

export const positionColumns = [
  { key: 'ticker', label: 'Ticker', width: '118px', required: true },
  { key: 'name', label: 'Company', width: '1.35fr', required: true },
  { key: 'account', label: 'Account', width: '94px' },
  { key: 'assetClass', label: 'Type', width: '76px' },
  { key: 'sector', label: 'Sector', width: '140px' },
  { key: 'shares', label: 'Shares', width: '76px' },
  { key: 'avg', label: 'Avg Cost', width: '96px' },
  { key: 'price', label: 'Price', width: '96px' },
  { key: 'value', label: 'Market Value', width: '126px', required: true },
  { key: 'weight', label: 'Weight', width: '76px' },
  { key: 'unrealized', label: 'Unrealized P/L', width: '112px' },
  { key: 'day', label: 'Day', width: '72px' },
  { key: 'trend', label: 'Trend', width: '92px' },
];

export const defaultPositionColumns = positionColumns.map((column) => column.key);


export function HoldingLogo({ row }) {
  return <span className="holding-logo" style={{ background: row.color }}>{row.logo}</span>;
}

function HoldingsStat({ item }) {
  const Icon = item.icon;
  return (
    <article className="card holdings-bottom-stat">
      <div className="holdings-stat-icon"><Icon size={27} /></div>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        <small>{item.sub}</small>
      </div>
    </article>
  );
}

export function getPositionType(row) {
  return positionDetails[row.ticker]?.assetClass ?? 'Stock';
}

export function getPositionDetails(row) {
  return positionDetails[row.ticker] ?? positionDetails.NVDA;
}

export function getPositionCellValue(row, key) {
  const details = getPositionDetails(row);
  const values = {
    account: details.account,
    assetClass: details.assetClass,
    avg: row.avg,
    day: row.day,
    name: row.name,
    price: row.price,
    sector: details.sector,
    shares: row.shares,
    ticker: row.ticker,
    trend: row.series,
    unrealized: details.unrealized,
    value: row.value,
    weight: row.weight,
  };

  return values[key];
}

export function PositionCell({ columnKey, row }) {
  const value = getPositionCellValue(row, columnKey);
  const details = getPositionDetails(row);

  if (columnKey === 'ticker') {
    return <span className="holding-ticker"><HoldingLogo row={row} /><b>{row.ticker}</b></span>;
  }

  if (columnKey === 'value') {
    return <strong>{row.value}</strong>;
  }

  if (columnKey === 'unrealized') {
    return <span className={details.unrealized.startsWith('+') ? 'green' : ''}>{details.unrealized}</span>;
  }

  if (columnKey === 'day') {
    return <span className={row.day.startsWith('-') ? 'red' : 'green'}>{row.day}</span>;
  }

  if (columnKey === 'trend') {
    return <Sparkline data={row.series} danger={row.danger} />;
  }

  return <span>{value}</span>;
}

export function formatSignedMoney(value) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(value));
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}


export function formatCompactMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

