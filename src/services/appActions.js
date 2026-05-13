import { apiRequest, hasApiBackend } from './apiClient';
import { APP_ACTIONS } from './actionTypes';
import { mockAction } from './mockBackend';

export { APP_ACTIONS };

const APP_ENDPOINTS = {
  [APP_ACTIONS.ADD_TO_WATCHLIST]: { method: 'POST', path: '/watchlist' },
  [APP_ACTIONS.APPLY_REBALANCE_PLAN]: { method: 'POST', path: '/allocation/rebalance/apply' },
  [APP_ACTIONS.COMPARE_BACKTEST]: { method: 'POST', path: '/backtests/compare' },
  [APP_ACTIONS.DOWNLOAD_REPORT]: { method: 'POST', path: '/reports/download' },
  [APP_ACTIONS.EXPORT_SCREENER]: { method: 'POST', path: '/screener/export' },
  [APP_ACTIONS.REFRESH_SNAPSHOT]: { method: 'POST', path: '/market/refresh' },
  [APP_ACTIONS.RUN_BACKTEST]: { method: 'POST', path: '/backtests/run' },
  [APP_ACTIONS.RUN_SCREEN]: { method: 'POST', path: '/screener/run' },
  [APP_ACTIONS.SAVE_ALLOCATION_TARGETS]: { method: 'POST', path: '/allocation/targets' },
  [APP_ACTIONS.SAVE_PORTFOLIO_SETTINGS]: { method: 'POST', path: '/settings/portfolio' },
  [APP_ACTIONS.SAVE_SCREEN]: { method: 'POST', path: '/screener/saved' },
  [APP_ACTIONS.SAVE_STRATEGY]: { method: 'POST', path: '/strategies' },
  [APP_ACTIONS.SAVE_UNIVERSE_PRESET]: { method: 'POST', path: '/backtests/universes' },
  [APP_ACTIONS.VIEW_DETAILS]: { method: 'GET', path: '/details' },
  [APP_ACTIONS.VIEW_OPTIONS]: { method: 'GET', path: '/options' },
};

export async function executeAppAction(action, payload = {}) {
  const endpoint = APP_ENDPOINTS[action];

  if (!endpoint || !hasApiBackend()) {
    return mockAction(action, payload);
  }

  return apiRequest(endpoint.path, {
    method: endpoint.method,
    body: endpoint.method === 'GET' ? undefined : JSON.stringify(payload),
  });
}
