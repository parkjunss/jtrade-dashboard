export const tickerStrip = [
  { label: 'S&P 500', value: '5,021.16', change: '+0.85%', trend: 'up' },
  { label: 'NASDAQ', value: '16,742.39', change: '+1.23%', trend: 'up' },
  { label: 'USD/KRW', value: '1,377.40', change: '-0.19%', trend: 'down' },
  { label: 'EUR/USD', value: '1.0842', change: '+0.22%', trend: 'up' },
  { label: 'WTI Oil', value: '$75.18', change: '-0.68%', trend: 'down' },
  { label: 'Gold', value: '$2,363.24', change: '+0.71%', trend: 'up' },
];

export const movers = {
  gainers: {
    badge: 'Top Gainer', name: 'Amazon', symbol: 'AMZN', value: '$585,235.2', volume: '2340 Volume', change: '+2.15%', logo: 'a'
  },
  losers: {
    badge: 'Top Loser', name: 'Microsoft', symbol: 'MSFT', value: '$1,235,525.22', volume: '2340 Volume', change: '-3.10%', logo: 'ms'
  }
};

export const portfolioSeries = [275, 282, 294, 301, 315, 342, 337, 351, 346, 365, 373, 382, 377, 389, 386, 410, 421, 414, 405, 417, 413, 432];
export const marketSeries = [256, 262, 268, 273, 285, 280, 286, 295, 303, 312, 318, 304, 316, 311, 326, 332, 348, 339, 331, 345, 351, 364];

export const performance = {
  value: '$422,525.82',
  returnAbs: '+$96,432.18 (29.20%)',
  day: '+$1,585.79 (0.38%)',
  metrics: [
    { label: 'Max Drawdown', value: '-8.42%', trend: 'down' },
    { label: 'Annualized Return', value: '18.35%', trend: 'up' },
    { label: 'Sharpe Ratio', value: '1.42', trend: 'neutral' },
  ],
  compare: [
    { label: 'Portfolio', value: '+29.20%', highlight: true },
    { label: 'S&P 500', value: '+18.40%' },
    { label: 'Outperform', value: '+10.80%', highlight: true },
  ]
};

export const sp500 = {
  value: '5,021.6', change: '+42.38 (0.85%)', high: '5,032.49', low: '4,978.11', high52: '5,246.85', low52: '4,103.78', series: [30, 32, 31, 33, 37, 40, 42, 46, 43, 40, 38, 35, 37, 41, 45, 47]
};

export const marketSnapshot = [
  { name: 'S&P 500', value: '5,021.16', change: '+0.85%', series: [18, 20, 19, 22, 21, 24, 25] },
  { name: 'NASDAQ', value: '16,742.39', change: '+1.23%', series: [22, 19, 21, 18, 24, 21, 25], danger: true },
  { name: 'Dow Jones', value: '38,886.24', change: '+0.45%', series: [16, 17, 16, 20, 19, 22, 24] },
];

export const watchlist = [
  { name: 'OpenSea Inc.', symbol: 'OPNS', price: '$1,285.57', change: '-0.24%', icon: '🌊', trend: 'down', series: [20,18,19,17,18,16,19] },
  { name: 'Spotify Inc.', symbol: 'SPOT', price: '$4,125.22', change: '+1.15%', icon: '●', trend: 'up', series: [17,19,18,21,20,23,22] },
  { name: 'Alphabet Inc.', symbol: 'GOOG', price: '$2,386.99', change: '+0.65%', icon: 'G', trend: 'up', series: [15,16,14,18,17,20,19] },
  { name: 'Nvidia Corp.', symbol: 'NVDA', price: '$1,024.32', change: '+2.41%', icon: '▰', trend: 'up', series: [19,21,20,23,21,24,26] },
];

export const stats = [
  { label: 'Holdings', value: '42', sub: 'Total securities', icon: 'rotate' },
  { label: 'Cash Balance', value: '$4,850.45', sub: 'Available to invest', icon: 'cash' },
  { label: 'Buying Power', value: '$49,700.90', sub: 'Day trade avg', icon: 'bolt' },
  { label: 'Dividend Yield', value: '2.43%', sub: 'Trailing 12 months', icon: 'shield' },
  { label: 'P/E Ratio (Portfolio)', value: '21.34', sub: 'Weighted average', icon: 'chart' },
];
