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

export function getSettingsDataSources(store = mockStore) {
  return store.settingsData;
}

export function getSettingsNotifications(store = mockStore) {
  return store.settingsNotifications;
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

export function getTaxReportsData(store = mockStore) {
  return store.reports.tax;
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

export function getAllocationAssetData(store = mockStore) {
  const holdingsByAsset = {
    'US Stocks': ['NVDA', 'MSFT', 'AAPL', 'AMZN', 'GOOGL'],
    'Korean Stocks': ['005930.KS'],
    ETFs: ['SPY', 'QQQ'],
    Bonds: [],
    Cash: ['CASH'],
  };
  const trendByAsset = {
    'US Stocks': [39, 40, 41, 42, 43, 42],
    'Korean Stocks': [19, 18, 18, 17, 18, 18],
    ETFs: [14, 15, 16, 16, 15, 16],
    Bonds: [16, 15, 14, 14, 14, 14],
    Cash: [12, 12, 11, 11, 10, 10],
  };
  const qualityByAsset = {
    'US Stocks': { liquidity: 96, concentration: 'High', risk: 'Growth tilt' },
    'Korean Stocks': { liquidity: 74, concentration: 'Single-name', risk: 'FX exposed' },
    ETFs: { liquidity: 94, concentration: 'Diversified', risk: 'Benchmark beta' },
    Bonds: { liquidity: 88, concentration: 'Defensive', risk: 'Rate sensitive' },
    Cash: { liquidity: 100, concentration: 'Cash', risk: 'Dry powder' },
  };

  const assets = store.allocation.rows.map((asset) => {
    const symbols = holdingsByAsset[asset.name] ?? [];
    const holdings = symbols.map((symbol) => {
      const row = store.holdings.rows.find((item) => item.ticker === symbol);
      if (!row) return null;
      const details = store.holdings.positionDetails[symbol] ?? {};

      return {
        symbol,
        name: row.name,
        account: details.account ?? 'Unassigned',
        day: row.day,
        return: row.return,
        value: row.value,
        weight: row.weight,
      };
    }).filter(Boolean);
    const quality = qualityByAsset[asset.name] ?? { liquidity: 80, concentration: 'Mixed', risk: 'Moderate' };

    return {
      ...asset,
      driftValue: Number(asset.current) - Number(asset.target),
      holdings,
      liquidity: quality.liquidity,
      concentration: quality.concentration,
      risk: quality.risk,
      trend: trendByAsset[asset.name] ?? store.allocation.trendMonths.map(() => Number(asset.current)),
    };
  });
  const totalDrift = assets.reduce((sum, row) => sum + Math.abs(row.driftValue), 0);
  const largestAsset = assets.reduce((max, row) => (row.current > max.current ? row : max), assets[0]);
  const largestDrift = assets.reduce((max, row) => (Math.abs(row.driftValue) > Math.abs(max.driftValue) ? row : max), assets[0]);

  return {
    assets,
    largestAsset,
    largestDrift,
    trendMonths: store.allocation.trendMonths,
    totalDrift,
  };
}

export function getAllocationRiskData(store = mockStore) {
  const assetData = getAllocationAssetData(store);
  const holdingRows = store.holdings.rows.filter((row) => row.ticker !== 'CASH');
  const riskBySymbol = {
    NVDA: { beta: 1.58, volatility: 31.4, contribution: 2.8, cluster: 'AI / Semis', correlation: 0.86 },
    MSFT: { beta: 0.92, volatility: 18.7, contribution: 1.2, cluster: 'Mega-cap Quality', correlation: 0.74 },
    AAPL: { beta: 1.15, volatility: 21.1, contribution: 0.7, cluster: 'Mega-cap Quality', correlation: 0.78 },
    AMZN: { beta: 1.28, volatility: 26.2, contribution: 0.5, cluster: 'Consumer Growth', correlation: 0.72 },
    GOOGL: { beta: 1.12, volatility: 22.8, contribution: 0.4, cluster: 'Ad / Cloud', correlation: 0.76 },
    '005930.KS': { beta: 1.05, volatility: 24.4, contribution: 0.3, cluster: 'AI / Semis', correlation: 0.69 },
    SPY: { beta: 1.0, volatility: 16.2, contribution: 0.6, cluster: 'Broad Market', correlation: 0.94 },
    QQQ: { beta: 1.18, volatility: 20.5, contribution: 0.6, cluster: 'Growth Beta', correlation: 0.88 },
  };
  const positionRisks = holdingRows.map((row) => {
    const risk = riskBySymbol[row.ticker] ?? { beta: 1, volatility: 18, contribution: 0.2, cluster: 'Other', correlation: 0.65 };
    const weight = parsePct(row.weight);

    return {
      ...risk,
      symbol: row.ticker,
      name: row.name,
      weight,
      value: row.value,
    };
  });
  const weightedBeta = positionRisks.reduce((sum, row) => sum + row.beta * row.weight, 0) / positionRisks.reduce((sum, row) => sum + row.weight, 0);
  const topConcentration = holdingRows.slice(0, 3).reduce((sum, row) => sum + parsePct(row.weight), 0);
  const clusterMap = positionRisks.reduce((groups, row) => {
    if (!groups[row.cluster]) {
      groups[row.cluster] = { name: row.cluster, contribution: 0, members: [], weight: 0 };
    }
    groups[row.cluster].contribution += row.contribution;
    groups[row.cluster].weight += row.weight;
    groups[row.cluster].members.push(row.symbol);
    return groups;
  }, {});
  const clusters = Object.values(clusterMap).sort((a, b) => b.contribution - a.contribution);

  return {
    clusters,
    correlationPairs: [
      { pair: 'NVDA / 005930.KS', value: 0.86, note: 'Semiconductor cycle overlap' },
      { pair: 'SPY / QQQ', value: 0.88, note: 'US equity beta' },
      { pair: 'MSFT / AAPL', value: 0.74, note: 'Mega-cap quality' },
      { pair: 'AMZN / GOOGL', value: 0.71, note: 'Growth and ad cycle' },
    ],
    diversification: [
      { label: 'Effective holdings', value: 18, target: 24 },
      { label: 'Top 3 concentration', value: topConcentration, target: 30 },
      { label: 'Single-name max', value: parsePct(holdingRows[0].weight), target: 10 },
      { label: 'Asset drift', value: assetData.totalDrift, target: 6 },
    ],
    metrics: {
      beta: weightedBeta,
      concentration: topConcentration,
      diversificationScore: 72,
      volatility: 13.8,
    },
    positionRisks: positionRisks.sort((a, b) => b.contribution - a.contribution),
    stressTests: [
      { scenario: 'Rates +100 bps', impact: -3.4, driver: 'Bonds and growth duration' },
      { scenario: 'Semis -10%', impact: -2.6, driver: 'NVDA and Samsung exposure' },
      { scenario: 'USD/KRW +5%', impact: 0.7, driver: 'KRW asset translation' },
      { scenario: 'S&P 500 -5%', impact: -4.1, driver: 'Broad equity beta' },
    ],
  };
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

export function getSentimentInsightsData(store = mockStore) {
  return store.insights.sentiment;
}

export function getSignalsInsightsData(store = mockStore) {
  return store.insights.signals;
}

export function getOptionsInsightsData(store = mockStore) {
  return store.insights.options;
}

export function getBacktestData(store = mockStore) {
  return store.backtest;
}

export function getBacktestCompareData(store = mockStore) {
  return {
    strategies: [
      {
        id: 'momentum-core',
        name: 'Momentum Rotation',
        benchmark: 'S&P 500',
        dateRange: 'Jan 2020 - May 2025',
        cagr: 19.6,
        totalReturn: 148.3,
        maxDrawdown: -12.4,
        sharpe: 1.46,
        volatility: 14.2,
        winRate: 63,
        finalValue: 248300,
        turnover: 42,
        series: [100, 116, 142, 133, 166, 205, 248],
        params: { rebalance: 'Monthly', weighting: 'Risk parity', momentum: '12M', maxPosition: '28%' },
      },
      {
        id: 'equal-weight',
        name: 'Equal Weight Core',
        benchmark: 'S&P 500',
        dateRange: 'Jan 2020 - May 2025',
        cagr: 15.2,
        totalReturn: 112.4,
        maxDrawdown: -16.8,
        sharpe: 1.08,
        volatility: 16.1,
        winRate: 58,
        finalValue: 212400,
        turnover: 29,
        series: [100, 111, 128, 120, 146, 178, 212],
        params: { rebalance: 'Quarterly', weighting: 'Equal weight', momentum: 'None', maxPosition: '20%' },
      },
      {
        id: 'defensive-tilt',
        name: 'Defensive Tilt',
        benchmark: '60/40 Portfolio',
        dateRange: 'Jan 2020 - May 2025',
        cagr: 11.8,
        totalReturn: 82.7,
        maxDrawdown: -7.9,
        sharpe: 1.32,
        volatility: 9.4,
        winRate: 66,
        finalValue: 182700,
        turnover: 18,
        series: [100, 106, 118, 116, 132, 156, 183],
        params: { rebalance: 'Monthly', weighting: 'Volatility target', momentum: '6M', maxPosition: '18%' },
      },
      {
        id: 'benchmark-sp500',
        name: 'S&P 500',
        benchmark: 'Benchmark',
        dateRange: 'Jan 2020 - May 2025',
        cagr: 9.4,
        totalReturn: 63.2,
        maxDrawdown: -18.6,
        sharpe: 0.82,
        volatility: 17.3,
        winRate: 55,
        finalValue: 163200,
        turnover: 0,
        series: [100, 109, 121, 112, 132, 149, 163],
        params: { rebalance: 'None', weighting: 'Market cap', momentum: 'N/A', maxPosition: 'Index' },
      },
    ],
    monthlyRows: [
      { period: 'Jan 2026', momentum: 3.4, equalWeight: 2.6, defensive: 1.8, benchmark: 2.1 },
      { period: 'Feb 2026', momentum: 4.9, equalWeight: 3.7, defensive: 2.2, benchmark: 3.0 },
      { period: 'Mar 2026', momentum: 5.1, equalWeight: 3.8, defensive: 2.7, benchmark: 4.2 },
      { period: 'Apr 2026', momentum: -1.2, equalWeight: -2.4, defensive: -0.6, benchmark: -0.6 },
      { period: 'May 2026', momentum: 4.2, equalWeight: 2.9, defensive: 1.9, benchmark: 2.7 },
    ],
    parameterVariants: [
      { name: 'Base', rebalance: 'Monthly', weighting: 'Risk parity', cagr: 19.6, drawdown: -12.4, sharpe: 1.46 },
      { name: 'Lower turnover', rebalance: 'Quarterly', weighting: 'Risk parity', cagr: 17.8, drawdown: -13.2, sharpe: 1.31 },
      { name: 'Equal weight', rebalance: 'Monthly', weighting: 'Equal weight', cagr: 15.9, drawdown: -15.6, sharpe: 1.12 },
      { name: 'Defensive cap', rebalance: 'Monthly', weighting: 'Vol target', cagr: 16.4, drawdown: -9.8, sharpe: 1.41 },
    ],
  };
}

export function getReportsOverviewData(store = mockStore) {
  return store.reportsOverview;
}
