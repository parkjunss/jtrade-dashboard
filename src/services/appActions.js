import { apiRequest, hasApiBackend } from './apiClient';
import { mockAction } from './mockBackend';

const endpoints = {
  addToWatchlist: { method: 'POST', path: '/watchlist' },
  applyRebalancePlan: { method: 'POST', path: '/allocation/rebalance/apply' },
  compareBacktest: { method: 'POST', path: '/backtests/compare' },
  downloadReport: { method: 'POST', path: '/reports/download' },
  exportScreener: { method: 'POST', path: '/screener/export' },
  runBacktest: { method: 'POST', path: '/backtests/run' },
  runScreen: { method: 'POST', path: '/screener/run' },
  saveAllocationTargets: { method: 'POST', path: '/allocation/targets' },
  saveScreen: { method: 'POST', path: '/screener/saved' },
  saveStrategy: { method: 'POST', path: '/strategies' },
  saveUniversePreset: { method: 'POST', path: '/backtests/universes' },
  savePortfolioSettings: { method: 'POST', path: '/settings/portfolio' },
  viewDetails: { method: 'GET', path: '/details' },
  refreshSnapshot: { method: 'POST', path: '/market/refresh' },
  viewOptions: { method: 'GET', path: '/options' },
};

export async function executeAppAction(action, payload = {}) {
  const endpoint = endpoints[action];

  if (!endpoint || !hasApiBackend()) {
    return mockAction(action, payload);
  }

  return apiRequest(endpoint.path, {
    method: endpoint.method,
    body: endpoint.method === 'GET' ? undefined : JSON.stringify(payload),
  });
}
