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
- [x] Frontend download utility and CSV export
- [x] Toast auto-dismiss
- [x] Positions action behavior
- [x] Existing visible-control interaction pass across Performance, Holdings, Screener, Stock Detail, and Backtest

## Next Page Implementation Order

1. `reports-exports`
2. `settings-portfolio`

## P0 Page Backlog

### `reports-exports`
Features:
- Export history table backed by mock mutation state.
- Filters for report type, format, status, date range.
- Retry/download/delete actions for export rows.

Show:
- Report name, generated date, format, status, size, requested by.
- Scheduled exports and recent downloads.

### `settings-portfolio`
Features:
- Portfolio preferences form for base currency, benchmark, tax method, fiscal year.
- Default cash handling and performance calculation settings.
- Save/reset actions.

Show:
- Current portfolio name, currency, benchmark, tax lot method.
- Return calculation assumptions and allocation policy defaults.

## P1 Page Backlog

- `performance-benchmark`: benchmark selector, relative return chart, tracking error/correlation/information ratio.
- `performance-drawdown`: drawdown timeline, recovery table, active drawdown summary.
- `holdings-movers`: price movers vs portfolio-impact movers, mover detail panel.
- `holdings-sectors`: sector exposure dashboard, benchmark comparison, sector drilldown.
- `allocation-assets`: asset class drilldown, allocation trend chart.
- `allocation-risk`: concentration, diversification, beta, volatility, correlation/risk clusters.
- `backtest-compare`: compare saved strategies, benchmarks, and parameter variants.
- `insights-sentiment`: sentiment by market/sector/holdings with drivers.
- `insights-signals`: technical/macro/factor signal board.
- `reports-tax`: tax document center, year/type filters, realized gains/dividends summary.
- `settings-data`: broker/data/import connection manager.
- `settings-notifications`: notification channel toggles and alert rule editor.

## P2 Page Backlog

- `performance-markets`: market index, FX, commodity, rates dashboard.
- `holdings-dividends`: dividend calendar and income forecast.
- `allocation-regions`: region/country/currency exposure.
- `research-news`: raw news feed with filters and detail panel.
- `insights-themes`: theme tracker and theme exposure.
- `insights-news`: AI catalyst feed.
- `insights-alerts`: alert inbox and alert status controls.
- `settings-overview`: settings hub.
- `settings-profile`: editable profile page.
- `settings-appearance`: theme/density/format preferences.
- `settings-security`: password, 2FA, sessions, recent sign-ins.

## Remaining Interaction Backlog

P1:
- Performance Watchlist row options: view detail, remove, set alert placeholder, run backtest.
- Performance Market Snapshot options: chart/timeframe menu and local refresh state.
- Reports download/detail controls: report center and Recent Exports detail modals.
- Stock Detail `View Details` and `View More`: panel-specific modals for position and analyst/news.
- Stock Detail `Run Backtest`: navigate/open run confirmation with preselected symbol.
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
