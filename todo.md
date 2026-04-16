# Competitor Intelligence Dashboard - TODO

## Database & Schema
- [x] Companies table with peer group, category, aliasing support
- [x] Company metrics table (revenue, EBITDA, PAT, AUM, users, etc.)
- [x] File uploads table with version history and timestamps
- [x] Parsed data table with source tagging
- [x] News items table per company
- [x] Insights table for auto-generated insights

## Backend API
- [x] Company CRUD with aliasing (name editing)
- [x] File upload endpoint (PDF + Excel per company)
- [x] AI-powered structured data extraction (LLM parsing)
- [x] News fetching from credible sources
- [x] Benchmarking data aggregation
- [x] Insights generation engine
- [x] Admin-only procedures (protected)
- [x] Source tagging on every metric

## Frontend - Dashboard
- [x] Dark Bloomberg-style theme with institutional typography
- [x] Two-tab layout: Wealth Management / P2P Lending
- [x] Company cards with premium UI (logo, category, metrics, updates)
- [x] Multi-company benchmarking view
- [x] Side-by-side comparison table with toggle visibility
- [x] Peer ranking view

## Frontend - Charts (Recharts)
- [x] Revenue trend chart
- [x] Profit trend chart
- [x] Funding timeline chart
- [x] Valuation comparison chart
- [x] AUM / Users / Loan book chart
- [x] Employee count comparison chart

## Frontend - Company Detail
- [x] Company profile/drilldown page
- [x] Latest 5 business updates per company
- [x] Source tags visible on every metric

## Admin Panel
- [x] Per-company file upload interface
- [x] Company name aliasing/editing
- [x] Parsed data review with manual override
- [x] News refresh trigger
- [x] Upload history and last-updated timestamps

## File Upload & AI Parsing
- [x] PDF upload support (annual reports, decks)
- [x] Excel upload support (financial models)
- [x] LLM extraction: revenue, expenses, EBITDA/PAT, AUM, users, funds raised, valuation, reporting period
- [x] New uploads overwrite structured data
- [x] Version history maintained
- [x] Source tagging: Uploaded File, Parsed, News, Manual Entry

## News Engine
- [x] Fetch from credible sources (ET, BS, Mint, FE)
- [x] Last 5 relevant updates per company
- [x] Headline, source, date, summary, clickable link
- [x] No duplicates or low-quality sources
- [x] Source tag: News
- [x] Manual refresh option in admin

## Insights Engine
- [x] Auto-generated analytical insights
- [x] Highest revenue scale player
- [x] Most funded platform
- [x] Fastest growing player
- [x] Weakest profitability
- [x] Highest valuation vs revenue ratio
- [x] Strongest operating leverage

## Stretch Features
- [x] Export comparison view (CSV download with all benchmarking data)
- [x] PDF export of comparison view (printable HTML report with styled table)
- [x] Search across companies
- [x] Tag-based filtering (high growth, profitable)
- [x] Individual company profile pages
- [x] Latest update badge per company
- [x] Query box for natural-language questions across uploaded files

## Tests
- [x] Company listing and filtering tests
- [x] Admin operations tests (name aliasing, metric upsert)
- [x] Data integrity tests (1 Finance in both groups, source tags)
- [x] News and insights router tests
