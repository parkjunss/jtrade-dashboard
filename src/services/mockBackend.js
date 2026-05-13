import { serializeCsv } from './downloadUtils';

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

const existingWatchlistSymbols = new Set(['OPNS', 'SPOT', 'GOOG', 'NVDA']);
let mockId = 1;

const watchlistCandidates = [
  { name: 'Microsoft Corp.', symbol: 'MSFT', price: '$415.60', change: '+0.72%', icon: 'M', trend: 'up', series: [13, 14, 16, 15, 18, 20, 23] },
  { name: 'Broadcom Inc.', symbol: 'AVGO', price: '$1,621.10', change: '+1.29%', icon: 'B', trend: 'up', series: [10, 12, 13, 15, 18, 17, 20] },
  { name: 'Taiwan Semiconductor', symbol: 'TSM', price: '$156.74', change: '+0.81%', icon: 'T', trend: 'up', series: [11, 13, 15, 14, 16, 19, 21] },
];

const stockLookup = {
  AVGO: watchlistCandidates[1],
  MSFT: watchlistCandidates[0],
  NVDA: { name: 'Nvidia Corp.', symbol: 'NVDA', price: '$1,024.32', change: '+2.41%', icon: 'N', trend: 'up', series: [19, 21, 20, 23, 21, 24, 26] },
  TSM: watchlistCandidates[2],
};

function makeId(prefix) {
  const next = String(mockId).padStart(3, '0');
  mockId += 1;
  return `${prefix}-${next}`;
}

function formatMockDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'export';
}

function reportContent(name, format) {
  return [
    name,
    `Generated: ${new Date().toISOString()}`,
    `Format: ${format}`,
    '',
    'Portfolio Value: $422,525.82',
    'YTD Return: +18.35%',
    'Max Drawdown: -8.42%',
    '',
    'This is a mock report generated locally by the frontend.',
  ].join('\n');
}

function pickWatchlistRow(symbol) {
  if (symbol) {
    return stockLookup[symbol] ?? {
      name: `${symbol} Holdings`,
      symbol,
      price: '$100.00',
      change: '+0.00%',
      icon: symbol.slice(0, 1),
      trend: 'up',
      series: [10, 11, 12, 11, 13, 14, 15],
    };
  }

  return watchlistCandidates.find((row) => !existingWatchlistSymbols.has(row.symbol)) ?? watchlistCandidates[0];
}

export async function mockAction(action, payload = {}) {
  await delay();

  const messages = {
    addToWatchlist: 'Added to watchlist.',
    applyRebalancePlan: 'Rebalance plan applied.',
    compareBacktest: 'Comparison workspace opened.',
    downloadReport: 'Report download queued.',
    exportScreener: 'Screener export prepared.',
    runBacktest: 'Backtest completed with mock data.',
    runScreen: 'Screen results refreshed.',
    saveAllocationTargets: 'Allocation target model saved.',
    saveScreen: 'Screen saved.',
    saveStrategy: 'Strategy saved.',
    saveUniversePreset: 'Universe preset saved.',
    savePortfolioSettings: 'Portfolio settings saved.',
    viewDetails: 'Details panel opened.',
  };

  if (action === 'addToWatchlist') {
    const row = pickWatchlistRow(payload.symbol);

    if (existingWatchlistSymbols.has(row.symbol)) {
      return {
        action,
        payload,
        message: `${row.symbol} is already in your watchlist.`,
        ok: true,
        timestamp: new Date().toISOString(),
      };
    }

    existingWatchlistSymbols.add(row.symbol);

    return {
      action,
      payload,
      message: `${row.symbol} added to watchlist.`,
      mutation: { type: 'watchlist:add', row },
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'saveScreen') {
    const name = payload.name ?? 'Untitled Screen';

    return {
      action,
      payload,
      message: `${name} saved to quick screens.`,
      mutation: {
        type: 'screen:save',
        row: {
          id: makeId('screen'),
          name,
          count: payload.resultCount ?? '128 results',
          updated: 'Saved just now',
        },
      },
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'saveStrategy') {
    const strategy = payload.strategy ?? 'Untitled Strategy';

    return {
      action,
      payload,
      message: `${strategy} saved to strategies.`,
      mutation: {
        type: 'strategy:save',
        row: {
          id: makeId('strategy'),
          name: strategy,
          benchmark: payload.benchmark ?? 'S&P 500',
          updated: 'Saved just now',
        },
      },
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'saveAllocationTargets') {
    const name = payload.modelName ?? 'Target Model';

    return {
      action,
      payload,
      message: `${name} saved with ${payload.rows?.length ?? 0} target rows.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'applyRebalancePlan') {
    const name = payload.planName ?? 'Rebalance Plan';

    return {
      action,
      payload,
      message: `${name} applied with ${payload.trades?.length ?? 0} suggested trades.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'saveUniversePreset') {
    const name = payload.name ?? 'Universe Preset';

    return {
      action,
      payload,
      message: `${name} saved with ${payload.symbols?.length ?? 0} included symbols.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'savePortfolioSettings') {
    const name = payload.portfolioName ?? 'Portfolio';

    return {
      action,
      payload,
      message: `${name} settings saved.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'downloadReport') {
    const name = payload.reportName ?? 'Portfolio Report';
    const format = payload.type ?? 'PDF';
    const normalizedFormat = format.toLowerCase();
    const hasRows = Array.isArray(payload.rows) && payload.rows.length > 0;
    const csvHeaders = hasRows ? Object.keys(payload.rows[0]) : [];
    const filename = hasRows
      ? `${slugify(name)}.csv`
      : `${slugify(name)}.${normalizedFormat === 'csv' ? 'csv' : 'txt'}`;
    const content = hasRows
      ? serializeCsv(csvHeaders, payload.rows)
      : reportContent(name, format);

    return {
      action,
      payload,
      download: {
        content,
        filename,
        mimeType: filename.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8',
      },
      message: `Downloaded ${filename}.`,
      mutation: {
        type: 'export:add',
        row: {
          id: makeId('export'),
          name,
          date: formatMockDate(),
          format: filename.endsWith('.csv') ? 'CSV' : format,
          status: 'Downloaded',
        },
      },
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'exportScreener') {
    const format = (payload.format ?? 'csv').toUpperCase();
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Ticker', 'Company', 'Price', 'Score'];
    const fallbackRows = [{ Ticker: 'NVDA', Company: 'NVIDIA Corporation', Price: '$1,024.32', Score: '96' }];
    const filename = `${slugify(payload.name ?? 'screener-export')}.${format.toLowerCase()}`;

    return {
      action,
      payload,
      download: {
        content: serializeCsv(headers, rows.length > 0 ? rows : fallbackRows),
        filename,
        mimeType: 'text/csv;charset=utf-8',
      },
      message: `Downloaded ${filename}.`,
      mutation: {
        type: 'export:add',
        row: {
          id: makeId('export'),
          name: payload.name ?? 'AI Leaders Screener Export',
          date: formatMockDate(),
          format,
          status: 'Ready',
        },
      },
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    action,
    payload,
    message: messages[action] ?? 'Action completed.',
    ok: true,
    timestamp: new Date().toISOString(),
  };
}
