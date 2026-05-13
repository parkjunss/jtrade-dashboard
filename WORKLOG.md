# QorTrade Dashboard Worklog

## Current State

Vite + React frontend for a stock/portfolio dashboard. The app still uses mock data, but action/API plumbing is in place so a backend can be connected later without rewriting page components.

Implemented top-level pages:
- Performance
- Holdings
- Allocation
- Research
- Backtest
- Insights
- Reports
- Settings

Implemented detailed pages/screens:
- Performance overview
- Performance > Returns
- Holdings overview
- Holdings > Positions
- Allocation overview
- Allocation > Targets
- Allocation > Rebalance
- Backtest overview
- Backtest > Universe
- Backtest > Parameters
- Insights overview
- Reports overview
- Reports > Exports
- Research overview
- Research > Stock Detail
- Research > Screener
- Settings > Portfolio
- Research > Compare

Placeholder behavior:
- Sidebar pages without a full implementation render through `src/pages/SubPageShell.jsx`.
- Placeholder metadata lives in `src/data/pageRegistry.js`.
- Detailed backlog was moved to `BACKLOG.md`.

## Key Files

Navigation:
- `src/components/TopBar.jsx`
- `src/components/Sidebar.jsx`
- `src/components/sidebar/*SidebarList.jsx`

Actions/API:
- `src/services/apiClient.js`
- `src/services/appActions.js`
- `src/services/mockBackend.js`
- `src/services/downloadUtils.js`
- `src/context/AppActionContext.jsx`
- `src/hooks/useSelection.js`

Core pages touched recently:
- `src/pages/HoldingsPage.jsx`
- `src/pages/ScreenerPage.jsx`
- `src/pages/StockDetailPage.jsx`
- `src/pages/BacktestPage.jsx`
- `src/components/Watchlist.jsx`
- `src/components/PortfolioChartCard.jsx`

## Completed Recently

- Added topbar notification dropdown and user menu dropdown.
- Removed duplicate/low-priority sidebar entries:
  - Performance Watchlist
  - Research Watchlist
  - Reports Performance/Holdings/Allocation
  - Backtest Results/Risk
  - Holdings Allocation
- Implemented mock mutations for:
  - watchlist add
  - save screen
  - save strategy
  - report download
  - screener export
- Added frontend file downloads:
  - `downloadUtils.js`
  - CSV serialization
  - browser-side downloads for mock report/screener/positions exports
- Added toast auto-dismiss:
  - success/info: about 2.5 seconds
  - error: about 5 seconds
- Implemented `Holdings > Positions`:
  - searchable/filterable positions table
  - selected-position detail panel
  - tax lots
  - columns modal
  - trade notes modal
  - import modal with sample CSV and preview
  - CSV export
- Implemented existing-control interactions:
  - Performance Watchlist add modal with search and duplicate handling
  - Performance portfolio chart range changes actual series length
  - Holdings overview filter modal
  - Holdings weight trend and sparklines respond to selected range
  - Screener Run Screen, Save Screen, search, columns, sort, advanced filter, View Details, View All
  - Screener Market Cap sort now handles T/B/M units correctly
  - Screener P/E sort split into `P/E Low` and `P/E High`
  - Screener stat/award icons fixed so they no longer clip inside circles
  - Stock Detail star toggles yellow and adds NVDA to watchlist
  - Stock Detail price range tabs change chart series
  - Backtest Date Range dropdown
  - Backtest Run, Save Strategy, Compare local mock behavior
- Implemented `Performance > Returns`:
  - range tabs for MTD, 1M, 3M, YTD, 1Y, 3Y, All
  - return KPI cards for total, annualized, YTD, best/worst month
  - attribution view by holding, sector, and asset class
  - contribution chart, rolling return chart, monthly heatmap
  - sortable monthly/quarterly returns table
  - CSV/PDF export actions through `runAction('downloadReport')`
- Implemented `Allocation > Targets`:
  - editable target models for asset class, region, sector, and symbol groups
  - target weight, tolerance band, and drift-threshold controls
  - current vs target drift visualization
  - policy allocation table and out-of-tolerance warnings
  - save/reset target model actions with mock mutation feedback
- Implemented `Allocation > Rebalance`:
  - cash-only, allow-sells, tax-aware, and minimum-trade-size controls
  - suggested trade table with buy/sell/hold actions, drift, amounts, and after-trade weights
  - estimated cash impact, fees, tax impact, and after-trade allocation summary
  - apply rebalance plan mock action and CSV export through `runAction`
- Implemented `Backtest > Universe`:
  - universe builder for symbols, ETFs, sectors, asset classes, and filters
  - include/exclude list controls and benchmark selector
  - preset load/save workflow with mock mutation feedback
  - universe size, data coverage, liquidity, selected assets, and missing-data warnings
- Implemented `Backtest > Parameters`:
  - parameter form for date range, dates, capital, fees, slippage, and rebalance cadence
  - strategy-specific controls for weighting, momentum window, position cap, stop loss, and volatility target
  - changed-field tracking, reset-to-default behavior, assumption summary, and validation warnings
  - save parameters through existing strategy save action
- Implemented `Research overview`:
  - research landing dashboard for screener, stock detail shortcuts, recent searches, saved screens, compare, and alerts
  - quick actions navigate into Screener, Stock Detail, and Compare shell
  - market opportunities, high-score symbols, watch candidates, top themes, and news impact summary
  - watch candidate add action uses existing watchlist mock mutation
- Implemented `Research > Compare`:
  - multi-symbol comparison builder with add/remove symbol controls
  - metric category tabs for price, valuation, growth, profitability, and risk
  - comparison table, relative performance sparklines, valuation scatter, peer ranking, and highlights
  - CSV export through existing report download action
- Implemented `Reports > Exports`:
  - export history table backed by mock export mutations and built-in export rows
  - filters for report type, format, status, date range, and search
  - retry, download, and delete row actions
  - scheduled exports and recent downloads panels
- Implemented `Settings > Portfolio`:
  - portfolio preferences form for portfolio name, base currency, benchmark, tax lot method, fiscal year, cash handling, return method, dividend treatment, and allocation policy
  - save/reset actions with mock mutation feedback
  - current portfolio settings summary, changed-field tracking, return assumptions, and allocation policy defaults

## Current Priority

Next implementation priority:
- P0 page backlog is complete. Next recommended pass: loading/empty/error states and visual QA across implemented pages.

Cross-cutting next tasks:
- Add loading/empty/error states for major cards.
- Normalize action names/endpoints in `src/services/appActions.js` as UI actions grow.
- Visually QA all implemented pages at desktop widths around 1400-1700px and responsive breakpoints.
- Reuse existing dropdown patterns/components for page filters and selectors instead of styling native `select` controls per page.

Detailed page backlog and deferred/backend-dependent work:
- See `BACKLOG.md`.

## Known Visual Cleanup

- Wide topbar with many tabs can feel tight on medium widths.
- Several dense tables need better responsive behavior.
- Some chart SVGs are decorative/static and still need more consistent padding/baselines.
- Screener results table is horizontally scrollable; confirm this is acceptable.
- Stock Detail dense layout should be checked at desktop widths around 1400-1700px.
- Backtest right-side panels should be rechecked after further content changes.

## Design References

Reference images are in `images/`:
- `performance.png`
- `allocation.png`
- `holdings.png`
- `backtest.png`
- `insights.png`
- `reports.png`
- `stockDetail.png`
- `screener.png`
- `Topbar.png`
- `sidebar.png`

## Verification

Use this command on Windows/PowerShell because `npm` can be blocked by execution policy:

```powershell
npm.cmd run build
```

Last known build status: passing (`npm.cmd run build`, 2026-05-13 after `settings-portfolio`).
