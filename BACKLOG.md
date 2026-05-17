# QorTrade Dashboard Backlog

This file holds the detailed implementation backlog that was trimmed out of `WORKLOG.md`.

## Priority Rules

- P0: Core dashboard workflow or visible controls that should work without backend support.
- P1: Deeper analysis once the core workflow feels usable.
- P2: Polish, settings, or backend-heavy work that can wait.

## Completed P0 Infrastructure

- [x] `holdings-positions`
- [x] `performance-returns`
- [x] `allocation-targets`
- [x] `allocation-rebalance`
- [x] `backtest-universe`
- [x] `backtest-parameters`
- [x] `research-overview`
- [x] `research-compare`
- [x] `reports-exports`
- [x] `settings-portfolio`
- [x] Frontend download utility and CSV export
- [x] Toast auto-dismiss
- [x] Route-level code splitting for top-level dashboard pages
- [x] Mock auth session gating for signed-in vs signed-out UI
- [x] Positions action behavior
- [x] Existing visible-control interaction pass across Performance, Holdings, Screener, Stock Detail, and Backtest

## Current Refactor

- [~] Centralize mock data into a domain store:
  - [x] portfolio and settings
  - [x] securities master data
  - [x] positions and tax lots
  - [x] report exports and scheduled exports
  - [x] selectors that preserve existing page row shapes while sharing one source of truth
  - [x] migrate Reports Exports, Settings Portfolio, Screener rows, and Watchlist fallback rows
  - [x] migrate Holdings, Allocation, Performance, Research Compare, and Stock Detail page-local fixtures
  - [x] migrate Backtest, Insights, Reports overview, Screener side metadata, and Allocation Targets fixture groups
  - [x] migrate legacy `src/data/mockData.js` shared fixtures into `src/data/mock/mockStore.js` and selectors

- [~] Extract large detail pages into dedicated files:
  - [x] `reports-tax`
  - [x] `reports-exports`
  - [x] `insights-sentiment`
  - [x] `insights-signals`
  - [x] `insights-options`
  - [x] `holdings-positions`
  - [x] `holdings-movers`
  - [x] `holdings-sectors`
  - [x] `allocation-assets`
  - [x] `allocation-risk`
  - [x] `allocation-targets`
  - [x] `allocation-rebalance`
  - [x] `backtest-universe`
  - [x] `backtest-parameters`
  - [x] `backtest-compare`
  - [x] `performance-returns`
  - [x] `performance-benchmark`
  - [x] `performance-drawdown`

## Next Page Implementation Order

P0 page backlog is complete. Continue with cross-cutting polish or P1 page backlog.

## P0 Page Backlog

## P1 Page Backlog

- [x] `performance-benchmark`: benchmark selector, relative return chart, tracking error/correlation/information ratio.
- [x] `performance-drawdown`: drawdown timeline, recovery table, active drawdown summary.
- [x] `holdings-movers`: price movers vs portfolio-impact movers, mover detail panel.
- [x] `holdings-sectors`: sector exposure dashboard, benchmark comparison, sector drilldown.
- [x] `holdings-allocation`: holding-level allocation breakdown and overview drilldown route.
- [x] `allocation-assets`: asset class drilldown, allocation trend chart.
- [x] `allocation-risk`: concentration, diversification, beta, volatility, correlation/risk clusters.
- [x] `backtest-compare`: compare saved strategies, benchmarks, and parameter variants.
- [x] `insights-options`: options flow, put/call ratio, expiry/strike open interest, volume/OI changes, implied volatility skew, gamma exposure, dealer positioning, max pain, and expected-move signals for forecasting likely price-pressure zones.
- [x] `insights-sentiment`: sentiment by market/sector/holdings with drivers.
- [x] `insights-signals`: technical/macro/factor signal board.
- [x] `reports-tax`: tax document center, year/type filters, realized gains/dividends summary.
- [x] `settings-data`: broker/data/import connection manager.
- [x] `settings-notifications`: notification channel toggles and alert rule editor.

## P2 Page Backlog

- [x] `holdings-dividends`: dividend calendar and income forecast.
- `allocation-regions`: region/country/currency exposure.
- `research-news`: raw news feed with filters and detail panel.
- `insights-themes`: theme tracker and theme exposure.
- `insights-news`: AI catalyst feed.
- `insights-alerts`: alert inbox and alert status controls.
- [x] `settings-overview`: settings hub.
- [x] `settings-profile`: editable profile page.
- `settings-appearance`: theme/density/format preferences.
- `settings-security`: password, 2FA, sessions, recent sign-ins.

## Remaining Interaction Backlog

P1:
- Performance Watchlist row options: view detail, remove, set alert placeholder, run backtest.
- Performance Market Snapshot options: chart/timeframe menu and local refresh state.
- Reports download/detail controls: report center and Recent Exports detail modals.
- [x] Stock Detail `View Details` and `View More`: panel-specific modals for position and analyst/news.
- [x] Stock Detail `Run Backtest`: navigate/open run confirmation with preselected symbol.
- Stock Detail options panel: expiry ladder, strike-level open interest, volume/OI changes, IV skew, max pain, expected move, and notable flow for the selected symbol.
- Screener selected-row action panel: View Stock Detail, Add to Watchlist, Compare, Run Backtest.
- Topbar notification item clicks: open related detail or navigate.
- User menu Account/Security/Preferences: route to settings pages once implemented.

P2/backend-heavy:
- Real ticker/company search against market data API.
- Persisted watchlist, saved screens, saved strategies, alerts, and notes.
- Real broker import/sync and CSV parsing with validation.
- Real PDF report generation.
- Real backtest engine and historical market data.
- Authentication/session/security actions.

## Acceptance Criteria For Future Work

- Visible controls should change UI, data, navigation, or browser download state.
- Toasts confirm completion/errors; they should not be the only behavior.
- Mock behavior should be deterministic enough for visual testing.
- Backend-dependent tasks should stay isolated so API integration can replace mocks later.
