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
- Performance > Benchmark
- Performance > Drawdown
- Holdings overview
- Holdings > Positions
- Holdings > Movers
- Holdings > Sectors
- Allocation overview
- Allocation > Assets
- Allocation > Risk
- Allocation > Targets
- Allocation > Rebalance
- Backtest overview
- Backtest > Universe
- Backtest > Parameters
- Backtest > Compare
- Insights overview
- Insights > Sentiment
- Insights > Signals
- Insights > Options
- Reports overview
- Reports > Tax
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
- Cross-cutting polish pass:
  - added shared `StatusState` component for loading, empty, and error-style panel states
  - moved `page-brief` styling to shared component CSS so non-market pages can use explanatory headers consistently
  - replaced several one-off empty states in Screener, Allocation Targets, Backtest Universe/Parameters, Reports Exports, and Settings Portfolio
  - added visible loading state to Reports export generation table
- Action/API naming cleanup:
  - added centralized `APP_ACTIONS` constants in `src/services/actionTypes.js`
  - renamed endpoint map to `APP_ENDPOINTS` and keyed it by action constants
  - replaced page/component `runAction` and `pendingAction` string literals with shared constants
  - normalized mock backend action checks/messages to use the same constants
- Central mock domain store pass:
  - added `src/data/mock/mockStore.js` with portfolio, settings, benchmarks, securities, positions, and report export fixtures
  - added `src/data/mock/selectors.js` to derive existing page row shapes from shared mock data
  - migrated Reports Exports, Settings Portfolio defaults, Screener rows, and Watchlist fallback rows to shared selectors
- Central mock domain store pass 2:
  - moved Holdings overview/positions fixtures, Allocation overview/rebalance fixtures, Performance Returns fixtures, Research overview/Compare fixtures, and Stock Detail tables/charts into `src/data/mock/mockStore.js`
  - added selectors for the newly centralized Holdings, Allocation, Performance, Research, and Stock Detail data
  - updated those pages to consume shared selectors instead of page-local fixture arrays
- Central mock domain store pass 3:
  - moved Allocation Targets policy groups, Screener side-panel metadata, Insights overview fixtures, Backtest overview/universe/parameter fixtures, and Reports overview fixtures into `src/data/mock/mockStore.js`
  - added selectors for Backtest, Insights, Reports overview, Screener metadata, and Allocation target groups
  - left page-local UI configuration arrays in place where they describe control options, column definitions, or icon mapping rather than mock domain data
- Central mock domain store pass 4:
  - moved ticker strip, market snapshot, S&P 500 index fixture, Performance overview fixtures, and Watchlist add-search candidates into `src/data/mock/mockStore.js`
  - added shared selectors for ticker strip, market snapshot/index data, Performance overview data, and Watchlist search rows
  - removed direct page/component imports from the legacy `src/data/mockData.js` file and deleted the file
- Stock Detail interaction pass:
  - added panel-specific modals for Position in Portfolio and Analyst Sentiment actions
  - added Run Backtest confirmation modal for NVDA and wired it through the existing mock backtest action before navigating to Backtest
- Implemented `Performance > Benchmark`:
  - benchmark selector for S&P 500, Nasdaq 100, and MSCI ACWI
  - indexed relative performance chart and monthly relative return ledger
  - tracking error, correlation, beta, alpha, active share, and information ratio summary
  - active contributor view for position/allocation effects versus the benchmark
- Implemented `Performance > Drawdown`:
  - current, max, average drawdown, and recovery-rate KPI cards
  - underwater drawdown chart and recovery snapshot
  - drawdown event table with active/recovered status
  - current drawdown driver contribution list
- Implemented `Holdings > Movers`:
  - top gainer, top loser, net impact, and largest-impact summary cards
  - session movers table with search, gainers/losers filters, and impact/price ranking modes
  - portfolio-impact calculations derived from centralized holdings mock data
  - selected-mover detail panel with impact bars, catalyst note, detail action, and watchlist action
  - CSV export and refresh actions through existing app action plumbing
- Implemented `Holdings > Sectors`:
  - sector exposure summary cards for coverage, largest sector, overweight, and underweight
  - benchmark comparison rows with current weight, benchmark marker, active difference, value, and search
  - selected-sector drilldown with market value, benchmark, target, drift, and holding rows
  - sector export and detail actions through existing app action plumbing
- Implemented `Allocation > Assets`:
  - asset class summary cards for policy groups, largest asset, largest drift, and total drift
  - asset exposure table with current weight, target, drift, value, liquidity, and row selection
  - selected-asset drilldown with target track, concentration/risk notes, and direct holdings
  - stacked allocation trend chart with range tabs and policy review rows
  - CSV export and detail action through existing app action plumbing
- Implemented `Allocation > Risk`:
  - risk summary cards for diversification score, weighted beta, volatility, and top-3 concentration
  - holding-level risk contribution table with beta, volatility, contribution bars, and cluster selection
  - correlation cluster drilldown with detail action
  - diversification diagnostics, high-correlation pairs, and stress scenario panels
  - CSV export through existing app action plumbing
- Implemented `Backtest > Compare`:
  - multi-strategy selector for saved strategies and benchmark rows
  - indexed equity-curve comparison for selected strategies
  - strategy metrics table for CAGR, total return, max drawdown, Sharpe, volatility, win rate, and turnover
  - parameter variant comparison and recent monthly return ledger
  - compare/export actions through existing app action plumbing
- Implemented `Insights > Options`:
  - options-flow signal board for symbol-level bias, call/put premium, put/call ratio, IV rank, expected move, and pressure notes
  - selected-symbol pressure panel with max pain, gamma wall, expiry, and premium balance
  - expiry pressure rows with call/put share, open interest, gamma exposure, and expected move
  - strike map for support/max-pain/gamma-wall zones
  - export/detail actions through existing app action plumbing
- Implemented `Insights > Sentiment`:
  - market, sector, and portfolio-holdings sentiment scope controls
  - composite score cards, source mix, positive/neutral/negative breakdowns, and trend chart
  - primary sentiment drivers filtered by selected scope with detail actions
  - holdings sentiment table with news/social/analyst scores and CSV export through existing app action plumbing
- Implemented `Insights > Signals`:
  - technical, macro, and factor signal board with category tabs
  - selected-signal detail panel with strength, confidence, horizon, driver, and action guidance
  - technical ticker rows, macro indicator rows, factor signal rows, and portfolio-impact rows
  - signal trend chart and CSV export through existing app action plumbing
- Implemented `Reports > Tax`:
  - tax document center with year, type, status, and search filters
  - realized gains, dividend income, tax-lot action, and selected-document detail panels
  - tax summary cards for realized gains, dividends, wash sales, and estimated liability
  - document download/detail actions and realized-gains CSV export through existing app action plumbing
- Added route-level code splitting:
  - changed top-level page imports in `src/App.jsx` to `React.lazy`
  - wrapped active page rendering in `Suspense` with a lightweight loading state
  - split production JS into separate chunks for Performance, Holdings, Allocation, Research, Backtest, Insights, Reports, and Settings
  - reduced the main production JS chunk from about 520 KB to about 203 KB
- Started detail-page file extraction:
  - moved `Reports > Tax` into `src/pages/reports/ReportsTaxPage.jsx`
  - moved `Reports > Exports` into `src/pages/reports/ReportsExportsPage.jsx`
  - moved report-specific shared UI helpers into `src/pages/reports/ReportPageShared.jsx`
  - kept `src/pages/ReportsPage.jsx` focused on overview rendering and subpage routing
- Continued detail-page file extraction:
  - moved `Insights > Sentiment` into `src/pages/insights/SentimentInsightsPage.jsx`
  - moved `Insights > Signals` into `src/pages/insights/SignalsInsightsPage.jsx`
  - moved `Insights > Options` into `src/pages/insights/OptionsInsightsPage.jsx`
  - moved shared insight helpers into `src/pages/insights/InsightPageShared.jsx`
  - kept `src/pages/InsightsPage.jsx` focused on overview rendering and subpage routing
- Continued detail-page file extraction:
  - moved `Holdings > Positions` into `src/pages/holdings/PositionsPage.jsx`
  - moved `Holdings > Movers` into `src/pages/holdings/MoversPage.jsx`
  - moved `Holdings > Sectors` into `src/pages/holdings/SectorsPage.jsx`
  - moved shared holding helpers into `src/pages/holdings/HoldingPageShared.jsx`
  - kept `src/pages/HoldingsPage.jsx` focused on overview rendering and subpage routing
- Continued detail-page file extraction:
  - moved `Allocation > Assets` into `src/pages/allocation/AllocationAssetsPage.jsx`
  - moved `Allocation > Risk` into `src/pages/allocation/AllocationRiskPage.jsx`
  - moved `Allocation > Targets` into `src/pages/allocation/AllocationTargetsPage.jsx`
  - moved `Allocation > Rebalance` into `src/pages/allocation/AllocationRebalancePage.jsx`
  - moved shared allocation helpers into `src/pages/allocation/AllocationPageShared.jsx`
  - kept `src/pages/AllocationPage.jsx` focused on overview rendering and subpage routing
- Continued detail-page file extraction:
  - moved `Backtest > Universe` into `src/pages/backtest/BacktestUniversePage.jsx`
  - moved `Backtest > Parameters` into `src/pages/backtest/BacktestParametersPage.jsx`
  - moved `Backtest > Compare` into `src/pages/backtest/BacktestComparePage.jsx`
  - moved shared backtest helpers into `src/pages/backtest/BacktestPageShared.jsx`
  - kept `src/pages/BacktestPage.jsx` focused on overview rendering and subpage routing
- Continued detail-page file extraction:
  - moved `Performance > Returns` into `src/pages/performance/PerformanceReturnsPage.jsx`
  - moved `Performance > Benchmark` into `src/pages/performance/PerformanceBenchmarkPage.jsx`
  - moved `Performance > Drawdown` into `src/pages/performance/PerformanceDrawdownPage.jsx`
  - moved shared performance chart/format helpers into `src/pages/performance/PerformancePageShared.jsx`
  - kept `src/pages/PerformancePage.jsx` focused on overview rendering and subpage routing
- Added signed-in vs signed-out UI separation:
  - added `src/context/AuthContext.jsx` for a mock persisted auth session
  - replaced the incorrect public `Performance > Overview` default with a public `Market` route
  - added `src/pages/MarketPage.jsx` for market overview, indices, macro pulse, breadth, movers, headlines, and calendar
  - added `src/components/ProtectedRoutePreview.jsx` and `src/components/AuthPrompt.jsx` for blur-overlay login prompts
  - gated protected dashboard routes in `src/App.jsx` while preserving the dashboard shell
  - removed the empty locked-page replacement flow
  - wired `TopBar` profile identity, sign-in, and sign-out to auth state
  - added market page and protected-preview styling in `src/styles/page-market.css` and `src/styles/page-auth.css`
- Implemented revised auth/public-route policy:
  - no longer exposes `Performance > Overview` publicly because it depends on personal portfolio composition and returns
  - uses the public `Market` page for non-logged-in users with market overview, index/rates/FX/commodity context, market brief, sector breadth, volatility, and public news
  - allow public previews for market-level insights, basic screener/search, and public stock detail data only where no personal portfolio data is shown
  - require login for all Performance, Holdings, Allocation, Backtest, Reports, Settings, personal Watchlist, saved strategies/screens, exports, tax lots, account data, and portfolio-based signals
  - prefer showing the underlying protected page with a blur/overlay prompt instead of replacing it with an empty locked page
  - use card-level protection for mixed public/private pages, for example public stock price/news plus blurred `Position in Portfolio`
- Replaced route loading text with a centered spinning loader so lazy page transitions do not show explanatory copy.
- Fixed corrupted visible glyphs in dashboard market/mover cards, including `Market Snapshot` percent/status labels.
- Updated signed-out protected-route preview so top navigation/sidebar remain clickable while private page content is blurred, and added a sign-in/sign-up toggle to the auth prompt.
- Implemented `Settings > Data Sources`:
  - broker, market data, CSV import, and exchange-calendar connection manager backed by centralized mock store data
  - connection health summary, source selection, enabled/paused toggle, sync cadence control, and scope chips
  - mock actions for saving data connection settings, testing a connection, and starting a source sync
  - import rules controls, CSV template download, import queue table, and data quality check panel
- Visual contrast pass:
  - darkened the app background and strengthened card borders/shadows so page surfaces separate more clearly
  - added stronger white card surfaces for shared cards, briefs, topbar controls, and sidebar
  - tightened nested box contrast in dashboard metric panels and Settings Data Sources rows/detail panels

## Current Priority

Next implementation priority:
- P0 page backlog is complete. Continue the P1 page backlog; next page candidate is `settings-notifications`.
- Continue extracting any remaining large in-file detail pages into section folders as they grow.
- Options analysis now lives under `Insights > Options` for cross-market options-flow signals, with a symbol-specific options panel still deferred under `Research > Stock Detail`.
- Future options work should deepen options flow, put/call ratio, expiry/strike open interest, volume/OI changes, IV skew, gamma exposure, dealer positioning, max pain, and expected-move zones that can help estimate likely price-pressure ranges.

Cross-cutting next tasks:
- Continue migrating any remaining low-priority local data only when it is domain fixture data; keep pure UI config such as columns, option lists, and icon maps near the component unless reused.
- Continue adding loading/empty/error states for remaining major cards as needed.
- Continue normalizing action payload shapes as UI actions grow.
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

## Working Rules

- After completing an implementation task, run `npm.cmd run build`, update `WORKLOG.md`/`BACKLOG.md`, and create a git commit for the finished work unless the user explicitly asks not to commit.

## Verification

Use this command on Windows/PowerShell because `npm` can be blocked by execution policy:

```powershell
npm.cmd run build
```

Last known build status: passing (`npm.cmd run build`, 2026-05-17 after visual contrast pass).
