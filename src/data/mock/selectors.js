import { mockStore } from './mockStore';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function positionValue(position, security) {
  return position.shares * security.price;
}

function formatMoney(value) {
  return currency.format(value);
}

function formatPct(value) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function getPortfolioSettings(store = mockStore) {
  return store.settings;
}

export function getPortfolioSummary(store = mockStore) {
  const positionsValue = store.positions.reduce((sum, position) => {
    const security = store.securities[position.symbol];
    return sum + (security ? positionValue(position, security) : 0);
  }, 0);

  return {
    ...store.portfolio,
    investedValue: positionsValue,
    totalValue: positionsValue + store.portfolio.cashBalance,
    benchmark: store.benchmarks[store.portfolio.benchmarkId],
  };
}

export function getSecurity(symbol, store = mockStore) {
  return store.securities[symbol];
}

export function getPositionRows(store = mockStore) {
  const totalValue = getPortfolioSummary(store).totalValue;

  return store.positions.map((position) => {
    const security = store.securities[position.symbol];
    const value = positionValue(position, security);
    const cost = position.shares * position.avgCost;
    const pnl = value - cost;
    const returnPct = cost ? (pnl / cost) * 100 : 0;

    return {
      ticker: position.symbol,
      name: security.name,
      assetClass: security.assetClass,
      sector: security.sector,
      shares: String(position.shares),
      price: formatMoney(security.price),
      avg: formatMoney(position.avgCost),
      value: formatMoney(value),
      weight: `${((value / totalValue) * 100).toFixed(2)}%`,
      day: formatPct(security.changePct),
      return: formatPct(returnPct),
      series: security.series,
      account: position.account,
      riskTag: position.riskTag,
      lots: position.lots,
      costBasis: formatMoney(cost),
      unrealized: `${pnl > 0 ? '+' : ''}${formatMoney(pnl)}`,
    };
  });
}

export function getWatchlistRows(store = mockStore) {
  return ['NVDA', 'MSFT', 'AVGO', 'TSM'].map((symbol) => {
    const security = store.securities[symbol];
    return {
      name: security.name,
      symbol,
      price: formatMoney(security.price),
      change: formatPct(security.changePct),
      icon: security.icon,
      trend: security.trend,
      series: security.series,
    };
  });
}

export function getScreenerRows(store = mockStore) {
  return Object.values(store.securities).map((security) => [
    security.symbol,
    security.name,
    formatMoney(security.price),
    formatPct(security.changePct),
    '+45.7%',
    security.marketCap,
    security.pe == null ? 'N/A' : String(security.pe),
    `${security.revenueGrowth}%`,
    `${security.roe}%`,
    security.avgVolume,
    String(security.score),
    security.series,
  ]);
}

export function getReportExports(store = mockStore) {
  return store.reports.exports;
}

export function getScheduledExports(store = mockStore) {
  return store.reports.scheduledExports;
}
