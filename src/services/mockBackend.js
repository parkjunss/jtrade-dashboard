import { serializeCsv } from './downloadUtils';
import { APP_ACTIONS } from './actionTypes';

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
    [APP_ACTIONS.ADD_TO_WATCHLIST]: 'Added to watchlist.',
    [APP_ACTIONS.APPLY_REBALANCE_PLAN]: 'Rebalance plan applied.',
    [APP_ACTIONS.COMPARE_BACKTEST]: 'Comparison workspace opened.',
    [APP_ACTIONS.DOWNLOAD_REPORT]: 'Report download queued.',
    [APP_ACTIONS.EXPORT_SCREENER]: 'Screener export prepared.',
    [APP_ACTIONS.RUN_BACKTEST]: 'Backtest completed with mock data.',
    [APP_ACTIONS.RUN_SCREEN]: 'Screen results refreshed.',
    [APP_ACTIONS.SAVE_ALLOCATION_TARGETS]: 'Allocation target model saved.',
    [APP_ACTIONS.SAVE_DATA_CONNECTIONS]: 'Data connection settings saved.',
    [APP_ACTIONS.SAVE_PORTFOLIO_SETTINGS]: 'Portfolio settings saved.',
    [APP_ACTIONS.SAVE_SCREEN]: 'Screen saved.',
    [APP_ACTIONS.SAVE_STRATEGY]: 'Strategy saved.',
    [APP_ACTIONS.SAVE_UNIVERSE_PRESET]: 'Universe preset saved.',
    [APP_ACTIONS.SYNC_DATA_CONNECTION]: 'Data connection sync started.',
    [APP_ACTIONS.TEST_DATA_CONNECTION]: 'Data connection test passed.',
    [APP_ACTIONS.VIEW_DETAILS]: 'Details panel opened.',
  };

  if (action === APP_ACTIONS.ADD_TO_WATCHLIST) {
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

  if (action === APP_ACTIONS.SAVE_SCREEN) {
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

  if (action === APP_ACTIONS.SAVE_STRATEGY) {
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

  if (action === APP_ACTIONS.SAVE_ALLOCATION_TARGETS) {
    const name = payload.modelName ?? 'Target Model';

    return {
      action,
      payload,
      message: `${name} saved with ${payload.rows?.length ?? 0} target rows.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === APP_ACTIONS.APPLY_REBALANCE_PLAN) {
    const name = payload.planName ?? 'Rebalance Plan';

    return {
      action,
      payload,
      message: `${name} applied with ${payload.trades?.length ?? 0} suggested trades.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === APP_ACTIONS.SAVE_UNIVERSE_PRESET) {
    const name = payload.name ?? 'Universe Preset';

    return {
      action,
      payload,
      message: `${name} saved with ${payload.symbols?.length ?? 0} included symbols.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === APP_ACTIONS.SAVE_PORTFOLIO_SETTINGS) {
    const name = payload.portfolioName ?? 'Portfolio';

    return {
      action,
      payload,
      message: `${name} settings saved.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === APP_ACTIONS.SAVE_DATA_CONNECTIONS) {
    return {
      action,
      payload,
      message: `Saved ${payload.sources?.length ?? 0} data connection settings.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === APP_ACTIONS.TEST_DATA_CONNECTION) {
    const name = payload.name ?? payload.id ?? 'Data source';

    return {
      action,
      payload,
      message: `${name} connection test passed.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === APP_ACTIONS.SYNC_DATA_CONNECTION) {
    const name = payload.name ?? payload.id ?? 'Data source';

    return {
      action,
      payload,
      message: `${name} sync started.`,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === APP_ACTIONS.DOWNLOAD_REPORT) {
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

  if (action === APP_ACTIONS.EXPORT_SCREENER) {
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
