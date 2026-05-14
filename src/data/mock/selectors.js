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

function parseMoney(value) {
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

function parsePct(value) {
  return Number(String(value).replace('%', '')) || 0;
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

export function getTickerStrip(store = mockStore) {
  return store.market.tickerStrip;
}

export function getMarketSnapshot(store = mockStore) {
  return store.market.marketSnapshot;
}

export function getSp500Index(store = mockStore) {
  return store.market.sp500;
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

export function getWatchlistSearchRows(store = mockStore) {
  return store.watchlistSearchRows;
}

export function getPerformanceOverviewData(store = mockStore) {
  return {
    movers: store.performanceOverview.movers,
    portfolioSeries: store.performanceOverview.portfolioSeries,
    marketSeries: store.performanceOverview.marketSeries,
    performance: store.performanceOverview.performance,
    stats: store.performanceOverview.stats,
    sp500: store.market.sp500,
    marketSnapshot: store.market.marketSnapshot,
    watchlist: getWatchlistRows(store),
  };
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

export function getHoldingsSummaryCards(store = mockStore) {
  return store.holdings.summaryCards;
}

export function getHoldingsRows(store = mockStore) {
  return store.holdings.rows;
}

export function getHoldingsPositionDetails(store = mockStore) {
  return store.holdings.positionDetails;
}

export function getHoldingsAllocationRows(store = mockStore) {
  return store.holdings.allocationRows;
}

export function getHoldingsSectorRows(store = mockStore) {
  return store.holdings.sectorRows;
}

export function getHoldingsMoverData(store = mockStore) {
  const totalValue = parseMoney(store.holdings.summaryCards[0].value);
  const catalystBySymbol = {
    NVDA: 'AI infrastructure demand and earnings revision momentum',
    MSFT: 'Azure AI growth and cloud margin stability',
    AAPL: 'Services strength offsetting hardware caution',
    AMZN: 'Retail margin digestion after recent run-up',
    GOOGL: 'Search ad recovery and Gemini product updates',
    '005930.KS': 'Memory pricing recovery and KRW translation tailwind',
    SPY: 'Broad market beta contribution',
    QQQ: 'Mega-cap growth rebound',
    CASH: 'No market exposure',
  };

  const rows = store.holdings.rows.map((row) => {
    const details = store.holdings.positionDetails[row.ticker] ?? {};
    const marketValue = parseMoney(row.value);
    const dayPct = parsePct(row.day);
    const portfolioImpact = (marketValue * dayPct) / 100;

    return {
      ...row,
      account: details.account ?? 'Unassigned',
      catalyst: catalystBySymbol[row.ticker] ?? 'Price action from market session',
      dayPct,
      impactPct: totalValue ? (portfolioImpact / totalValue) * 100 : 0,
      marketValue,
      portfolioImpact,
      sector: details.sector ?? 'Other',
    };
  });

  const activeRows = rows.filter((row) => row.ticker !== 'CASH');
  const gainers = [...activeRows].filter((row) => row.dayPct > 0).sort((a, b) => b.dayPct - a.dayPct);
  const losers = [...activeRows].filter((row) => row.dayPct < 0).sort((a, b) => a.dayPct - b.dayPct);
  const impactLeaders = [...activeRows].sort((a, b) => Math.abs(b.portfolioImpact) - Math.abs(a.portfolioImpact));
  const netImpact = activeRows.reduce((sum, row) => sum + row.portfolioImpact, 0);

  return {
    breadth: `${gainers.length} up / ${losers.length} down`,
    gainers,
    impactLeaders,
    losers,
    netImpact,
    rows: activeRows,
  };
}

export function getHoldingsSectorExposureData(store = mockStore) {
  const totalValue = parseMoney(store.holdings.summaryCards[0].value);
  const benchmarkWeights = {
    Technology: 29.4,
    'Consumer Discretionary': 10.6,
    'Communication Services': 8.8,
    'Broad Market': 6.5,
    Cash: 3.2,
  };
  const targetWeights = {
    Technology: 30,
    'Consumer Discretionary': 12,
    'Communication Services': 9,
    'Broad Market': 8,
    Cash: 5,
  };
  const colors = {
    Technology: '#47b51e',
    'Consumer Discretionary': '#f7b500',
    'Communication Services': '#3478db',
    'Broad Market': '#8f62d9',
    Cash: '#25b6bd',
  };
  const rowsBySector = store.holdings.rows.reduce((groups, row) => {
    const details = store.holdings.positionDetails[row.ticker] ?? {};
    const sector = details.sector ?? 'Other';
    const value = parseMoney(row.value);

    if (!groups[sector]) {
      groups[sector] = { holdings: [], value: 0 };
    }

    groups[sector].value += value;
    groups[sector].holdings.push({
      symbol: row.ticker,
      name: row.name,
      day: row.day,
      return: row.return,
      value: row.value,
      weight: row.weight,
      logo: row.logo,
      color: row.color,
      series: row.series,
      danger: row.danger,
    });

    return groups;
  }, {});

  const sectors = Object.entries(rowsBySector)
    .map(([name, group]) => {
      const weight = totalValue ? (group.value / totalValue) * 100 : 0;
      const benchmark = benchmarkWeights[name] ?? Math.max(0, weight - 1.5);
      const target = targetWeights[name] ?? weight;

      return {
        name,
        benchmark,
        color: colors[name] ?? '#6f7782',
        drift: weight - target,
        holdings: group.holdings.sort((a, b) => parseMoney(b.value) - parseMoney(a.value)),
        target,
        value: group.value,
        weight,
      };
    })
    .sort((a, b) => b.weight - a.weight);

  const largest = sectors[0];
  const largestOverweight = sectors.reduce((max, row) => (
    row.weight - row.benchmark > max.weight - max.benchmark ? row : max
  ), sectors[0]);
  const largestUnderweight = sectors.reduce((min, row) => (
    row.weight - row.benchmark < min.weight - min.benchmark ? row : min
  ), sectors[0]);

  return {
    largest,
    largestOverweight,
    largestUnderweight,
    sectors,
    totalSectors: sectors.length,
  };
}

export function getAllocationRows(store = mockStore) {
  return store.allocation.rows;
}

export function getAllocationRebalanceRows(store = mockStore) {
  return store.allocation.rebalanceRows;
}

export function getAllocationRebalanceTradeRows(store = mockStore) {
  return store.allocation.rebalanceTradeRows;
}

export function getAllocationSectorRows(store = mockStore) {
  return store.allocation.sectorRows;
}

export function getAllocationRegionRows(store = mockStore) {
  return store.allocation.regionRows;
}

export function getAllocationTrendMonths(store = mockStore) {
  return store.allocation.trendMonths;
}

export function getAllocationTargetGroups(store = mockStore) {
  return store.allocation.targetGroups;
}

export function getPerformanceReturnsData(store = mockStore) {
  return store.performanceReturns;
}

export function getPerformanceBenchmarkData(store = mockStore) {
  return store.performanceBenchmark;
}

export function getPerformanceDrawdownData(store = mockStore) {
  return store.performanceDrawdown;
}

export function getResearchOverviewData(store = mockStore) {
  return {
    opportunityRows: store.research.opportunityRows,
    catalystRows: store.research.catalystRows,
    recentSearches: store.research.recentSearches,
    savedScreensFallback: store.research.savedScreensFallback,
  };
}

export function getResearchCompareUniverse(store = mockStore) {
  return store.research.compareUniverse;
}

export function getStockDetailData(store = mockStore) {
  return store.stockDetail;
}

export function getScreenerMetadata(store = mockStore) {
  return store.screener;
}

export function getInsightsData(store = mockStore) {
  return store.insights;
}

export function getBacktestData(store = mockStore) {
  return store.backtest;
}

export function getReportsOverviewData(store = mockStore) {
  return store.reportsOverview;
}
