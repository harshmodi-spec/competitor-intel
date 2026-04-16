// Mock data for standalone frontend — no server required

export const MOCK_USER = {
  id: 1,
  name: "Admin User",
  email: "admin@competitorintel.in",
  role: "admin" as const,
};

type MetricEntry = {
  value: string;
  unit: string;
  source: string;
  period?: string;
};

type NewsItem = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
};

type CompanyWithData = {
  id: number;
  name: string;
  displayName: string;
  peerGroup: "wealth_management" | "p2p_lending";
  category: string;
  tags: string[];
  productOfferings: string[];
  lastUpdated: string;
  fileCount: number;
  metrics: Record<string, MetricEntry>;
  news: NewsItem[];
};

// ─── Wealth Management Companies ─────────────────────────────────────────────

export const MOCK_COMPANIES_WM: CompanyWithData[] = [
  {
    id: 1,
    name: "zerodha",
    displayName: "Zerodha",
    peerGroup: "wealth_management",
    category: "Discount Broker",
    tags: ["Profitable", "Bootstrapped", "Market Leader"],
    productOfferings: ["Equity Trading", "Mutual Funds", "F&O", "IPO", "ETF"],
    lastUpdated: "2024-11-01T00:00:00.000Z",
    fileCount: 3,
    metrics: {
      revenue:         { value: "4964",   unit: "INR Cr", source: "parsed_pdf",   period: "FY2024" },
      ebitda:          { value: "2907",   unit: "INR Cr", source: "parsed_pdf",   period: "FY2024" },
      pat:             { value: "2907",   unit: "INR Cr", source: "parsed_pdf",   period: "FY2024" },
      total_expenses:  { value: "2057",   unit: "INR Cr", source: "parsed_pdf",   period: "FY2024" },
      aum:             { value: "500000", unit: "INR Cr", source: "manual",       period: "FY2024" },
      users:           { value: "15000000", unit: "count", source: "news",        period: "FY2024" },
      employee_count:  { value: "1100",   unit: "count",  source: "manual",       period: "FY2024" },
      funds_raised:    { value: "0",      unit: "INR Cr", source: "manual",       period: "All Time" },
      valuation:       { value: "25000",  unit: "INR Cr", source: "news",         period: "2023" },
    },
    news: [
      { id: 101, headline: "Zerodha posts ₹4,964 Cr revenue in FY2024, remains India's most profitable broker", summary: "Bootstrapped broker Zerodha maintains dominant position with 23% revenue growth.", source: "Economic Times", sourceUrl: "https://economictimes.indiatimes.com", publishedAt: "2024-08-15T10:00:00.000Z" },
      { id: 102, headline: "Zerodha Kite 4.0 launched with enhanced charting and options analytics", summary: "New platform refresh adds TradingView charts and improved F&O analytics.", source: "Mint", sourceUrl: "https://livemint.com", publishedAt: "2024-09-20T09:00:00.000Z" },
    ],
  },
  {
    id: 2,
    name: "groww",
    displayName: "Groww",
    peerGroup: "wealth_management",
    category: "Investment Platform",
    tags: ["VC Backed", "Unicorn", "Growing"],
    productOfferings: ["Mutual Funds", "Equity Trading", "US Stocks", "Fixed Deposits", "IPO"],
    lastUpdated: "2024-10-15T00:00:00.000Z",
    fileCount: 2,
    metrics: {
      revenue:         { value: "3145",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      ebitda:          { value: "446",    unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      pat:             { value: "261",    unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      total_expenses:  { value: "2699",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      aum:             { value: "120000", unit: "INR Cr", source: "news",        period: "FY2024" },
      users:           { value: "11000000", unit: "count", source: "news",       period: "FY2024" },
      employee_count:  { value: "3800",   unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "7100",   unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "22000",  unit: "INR Cr", source: "news",        period: "2021" },
    },
    news: [
      { id: 201, headline: "Groww turns profitable in FY2024, reports ₹3,145 Cr revenue", summary: "Growth platform achieves profitability milestone with 63% YoY revenue growth.", source: "Bloomberg Quint", sourceUrl: "https://bqprime.com", publishedAt: "2024-09-10T08:00:00.000Z" },
      { id: 202, headline: "Groww introduces US stocks and ETF investing for Indian retail investors", summary: "Platform adds international exposure with seamless LRS-based US stock purchases.", source: "Financial Express", sourceUrl: "https://financialexpress.com", publishedAt: "2024-07-22T11:00:00.000Z" },
    ],
  },
  {
    id: 3,
    name: "angel_one",
    displayName: "Angel One",
    peerGroup: "wealth_management",
    category: "Full-Service Broker",
    tags: ["Listed", "Profitable", "AI-First"],
    productOfferings: ["Equity Trading", "Mutual Funds", "F&O", "Commodities", "Currency", "IPO"],
    lastUpdated: "2024-10-01T00:00:00.000Z",
    fileCount: 4,
    metrics: {
      revenue:         { value: "4273",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      ebitda:          { value: "1450",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      pat:             { value: "1134",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      total_expenses:  { value: "2823",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      aum:             { value: "80000",  unit: "INR Cr", source: "manual",      period: "FY2024" },
      users:           { value: "22000000", unit: "count", source: "news",       period: "FY2024" },
      employee_count:  { value: "7100",   unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "0",      unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "18500",  unit: "INR Cr", source: "manual",      period: "2024" },
    },
    news: [
      { id: 301, headline: "Angel One reaches 2.2 Cr active clients, highest ever quarterly addition", summary: "Full-service broker turned platform achieves record client addition in Q2 FY2025.", source: "Economic Times", sourceUrl: "https://economictimes.indiatimes.com", publishedAt: "2024-10-05T09:30:00.000Z" },
    ],
  },
  {
    id: 4,
    name: "upstox",
    displayName: "Upstox",
    peerGroup: "wealth_management",
    category: "Discount Broker",
    tags: ["VC Backed", "Tiger Global", "Growing"],
    productOfferings: ["Equity Trading", "Mutual Funds", "F&O", "IPO", "Commodities"],
    lastUpdated: "2024-09-15T00:00:00.000Z",
    fileCount: 1,
    metrics: {
      revenue:         { value: "1350",   unit: "INR Cr", source: "news",        period: "FY2024" },
      ebitda:          { value: "210",    unit: "INR Cr", source: "news",        period: "FY2024" },
      pat:             { value: "120",    unit: "INR Cr", source: "news",        period: "FY2024" },
      total_expenses:  { value: "1140",   unit: "INR Cr", source: "news",        period: "FY2024" },
      aum:             { value: "50000",  unit: "INR Cr", source: "manual",      period: "FY2024" },
      users:           { value: "13000000", unit: "count", source: "news",       period: "FY2024" },
      employee_count:  { value: "2500",   unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "2200",   unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "14000",  unit: "INR Cr", source: "news",        period: "2022" },
    },
    news: [
      { id: 401, headline: "Upstox crosses 1.3 Cr active users, eyes profitability in FY2025", summary: "Tiger Global-backed broker accelerates growth with focus on Gen Z investors.", source: "Mint", sourceUrl: "https://livemint.com", publishedAt: "2024-08-30T10:00:00.000Z" },
    ],
  },
  {
    id: 5,
    name: "cred",
    displayName: "CRED",
    peerGroup: "wealth_management",
    category: "Premium Fintech",
    tags: ["Unicorn", "Loss Making", "VC Backed"],
    productOfferings: ["Credit Card Management", "Mutual Funds", "Personal Loans", "P2P Lending", "Travel"],
    lastUpdated: "2024-09-01T00:00:00.000Z",
    fileCount: 2,
    metrics: {
      revenue:         { value: "2400",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      ebitda:          { value: "-550",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      pat:             { value: "-609",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      total_expenses:  { value: "3009",   unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      aum:             { value: "8000",   unit: "INR Cr", source: "manual",      period: "FY2024" },
      users:           { value: "12000000", unit: "count", source: "news",       period: "FY2024" },
      employee_count:  { value: "1900",   unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "11400",  unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "70000",  unit: "INR Cr", source: "news",        period: "2022" },
    },
    news: [
      { id: 501, headline: "CRED narrows losses to ₹609 Cr in FY2024 as revenue nearly doubles", summary: "Kunal Shah's premium fintech cuts burn rate significantly with diversified revenue streams.", source: "Inc42", sourceUrl: "https://inc42.com", publishedAt: "2024-09-18T11:00:00.000Z" },
      { id: 502, headline: "CRED launches CRED Garage and CRED Store to diversify beyond credit cards", summary: "Platform expands to auto services and curated shopping as it builds lifestyle ecosystem.", source: "YourStory", sourceUrl: "https://yourstory.com", publishedAt: "2024-07-14T09:00:00.000Z" },
    ],
  },
  {
    id: 6,
    name: "paytm_money",
    displayName: "Paytm Money",
    peerGroup: "wealth_management",
    category: "Investment Platform",
    tags: ["Paytm Group", "Direct MF", "Growing"],
    productOfferings: ["Mutual Funds", "NPS", "Stock Broking", "US Stocks", "ETF"],
    lastUpdated: "2024-08-15T00:00:00.000Z",
    fileCount: 1,
    metrics: {
      revenue:         { value: "800",    unit: "INR Cr", source: "news",        period: "FY2024" },
      ebitda:          { value: "-120",   unit: "INR Cr", source: "news",        period: "FY2024" },
      pat:             { value: "-145",   unit: "INR Cr", source: "news",        period: "FY2024" },
      total_expenses:  { value: "945",    unit: "INR Cr", source: "news",        period: "FY2024" },
      aum:             { value: "30000",  unit: "INR Cr", source: "manual",      period: "FY2024" },
      users:           { value: "5000000", unit: "count", source: "news",        period: "FY2024" },
      employee_count:  { value: "900",    unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "400",    unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "3500",   unit: "INR Cr", source: "news",        period: "2022" },
    },
    news: [
      { id: 601, headline: "Paytm Money sees 42% growth in stock broker clients in H1 FY2025", summary: "Paytm Money accelerates retail brokerage with flat-fee pricing model.", source: "Business Standard", sourceUrl: "https://business-standard.com", publishedAt: "2024-10-08T08:00:00.000Z" },
    ],
  },
  {
    id: 7,
    name: "indmoney",
    displayName: "INDmoney",
    peerGroup: "wealth_management",
    category: "Wealth Super App",
    tags: ["VC Backed", "US Stocks", "Growing"],
    productOfferings: ["US Stocks", "Mutual Funds", "Indian Stocks", "Fixed Deposits", "ETF", "NPS"],
    lastUpdated: "2024-09-20T00:00:00.000Z",
    fileCount: 1,
    metrics: {
      revenue:         { value: "450",    unit: "INR Cr", source: "news",        period: "FY2024" },
      ebitda:          { value: "-280",   unit: "INR Cr", source: "news",        period: "FY2024" },
      pat:             { value: "-310",   unit: "INR Cr", source: "news",        period: "FY2024" },
      total_expenses:  { value: "760",    unit: "INR Cr", source: "news",        period: "FY2024" },
      aum:             { value: "20000",  unit: "INR Cr", source: "news",        period: "FY2024" },
      users:           { value: "12000000", unit: "count", source: "news",       period: "FY2024" },
      employee_count:  { value: "750",    unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "3800",   unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "12000",  unit: "INR Cr", source: "news",        period: "2022" },
    },
    news: [
      { id: 701, headline: "INDmoney crosses 1.2 Cr users, announces Series D funding of $75M", summary: "Wealth super app accelerates international investing infrastructure.", source: "TechCrunch India", sourceUrl: "https://techcrunch.com", publishedAt: "2024-08-05T12:00:00.000Z" },
    ],
  },
  {
    id: 8,
    name: "kuvera",
    displayName: "Kuvera",
    peerGroup: "wealth_management",
    category: "Free MF Platform",
    tags: ["IDFC First", "Direct MF", "B2B"],
    productOfferings: ["Direct Mutual Funds", "Fixed Deposits", "US Stocks", "Goal Planning"],
    lastUpdated: "2024-08-01T00:00:00.000Z",
    fileCount: 0,
    metrics: {
      revenue:         { value: "180",    unit: "INR Cr", source: "news",        period: "FY2024" },
      ebitda:          { value: "22",     unit: "INR Cr", source: "news",        period: "FY2024" },
      pat:             { value: "18",     unit: "INR Cr", source: "news",        period: "FY2024" },
      total_expenses:  { value: "162",    unit: "INR Cr", source: "news",        period: "FY2024" },
      aum:             { value: "15000",  unit: "INR Cr", source: "manual",      period: "FY2024" },
      users:           { value: "2500000", unit: "count", source: "news",        period: "FY2024" },
      employee_count:  { value: "300",    unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "1050",   unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "4200",   unit: "INR Cr", source: "news",        period: "2021" },
    },
    news: [],
  },
  {
    id: 9,
    name: "smallcase",
    displayName: "Smallcase",
    peerGroup: "wealth_management",
    category: "Theme-Based Investing",
    tags: ["B2B2C", "Profitable", "Innovative"],
    productOfferings: ["Smallcases", "Model Portfolios", "Research", "SIP", "Broker API"],
    lastUpdated: "2024-08-20T00:00:00.000Z",
    fileCount: 1,
    metrics: {
      revenue:         { value: "350",    unit: "INR Cr", source: "news",        period: "FY2024" },
      ebitda:          { value: "45",     unit: "INR Cr", source: "news",        period: "FY2024" },
      pat:             { value: "38",     unit: "INR Cr", source: "news",        period: "FY2024" },
      total_expenses:  { value: "312",    unit: "INR Cr", source: "news",        period: "FY2024" },
      aum:             { value: "25000",  unit: "INR Cr", source: "news",        period: "FY2024" },
      users:           { value: "2000000", unit: "count", source: "news",        period: "FY2024" },
      employee_count:  { value: "400",    unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "1500",   unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "4500",   unit: "INR Cr", source: "news",        period: "2022" },
    },
    news: [
      { id: 901, headline: "Smallcase AUM crosses ₹25,000 Cr as thematic investing gains mainstream traction", summary: "B2B2C platform benefits from growing retail interest in factor-based and thematic portfolios.", source: "Mint", sourceUrl: "https://livemint.com", publishedAt: "2024-09-25T09:00:00.000Z" },
    ],
  },
  {
    id: 10,
    name: "5paisa",
    displayName: "5paisa",
    peerGroup: "wealth_management",
    category: "Budget Broker",
    tags: ["Listed", "Value Broker", "IIFL Group"],
    productOfferings: ["Equity Trading", "Mutual Funds", "F&O", "Robo Advisory", "Insurance"],
    lastUpdated: "2024-09-05T00:00:00.000Z",
    fileCount: 2,
    metrics: {
      revenue:         { value: "620",    unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      ebitda:          { value: "85",     unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      pat:             { value: "55",     unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      total_expenses:  { value: "565",    unit: "INR Cr", source: "parsed_pdf",  period: "FY2024" },
      aum:             { value: "18000",  unit: "INR Cr", source: "manual",      period: "FY2024" },
      users:           { value: "5000000", unit: "count", source: "news",        period: "FY2024" },
      employee_count:  { value: "1100",   unit: "count",  source: "manual",      period: "FY2024" },
      funds_raised:    { value: "0",      unit: "INR Cr", source: "manual",      period: "All Time" },
      valuation:       { value: "2800",   unit: "INR Cr", source: "manual",      period: "2024" },
    },
    news: [],
  },
];

// ─── P2P Lending Companies ────────────────────────────────────────────────────

export const MOCK_COMPANIES_P2P: CompanyWithData[] = [
  {
    id: 11,
    name: "faircent",
    displayName: "Faircent",
    peerGroup: "p2p_lending",
    category: "P2P Lender",
    tags: ["RBI Licensed", "Profitable", "Pioneer"],
    productOfferings: ["Personal Loans", "Business Loans", "Consumer Finance"],
    lastUpdated: "2024-09-30T00:00:00.000Z",
    fileCount: 2,
    metrics: {
      revenue:         { value: "180",   unit: "INR Cr", source: "parsed_pdf",   period: "FY2024" },
      ebitda:          { value: "28",    unit: "INR Cr", source: "parsed_pdf",   period: "FY2024" },
      pat:             { value: "18",    unit: "INR Cr", source: "parsed_pdf",   period: "FY2024" },
      total_expenses:  { value: "162",   unit: "INR Cr", source: "parsed_pdf",   period: "FY2024" },
      loan_book:       { value: "2500",  unit: "INR Cr", source: "manual",       period: "FY2024" },
      users:           { value: "600000", unit: "count", source: "news",         period: "FY2024" },
      employee_count:  { value: "320",   unit: "count",  source: "manual",       period: "FY2024" },
      funds_raised:    { value: "450",   unit: "INR Cr", source: "manual",       period: "All Time" },
      valuation:       { value: "1200",  unit: "INR Cr", source: "news",         period: "2022" },
    },
    news: [
      { id: 1101, headline: "Faircent reports record loan disbursals of ₹2,500 Cr in FY2024", summary: "India's first RBI-licensed P2P platform achieves consistent profitability for second year.", source: "Business Standard", sourceUrl: "https://business-standard.com", publishedAt: "2024-08-20T10:00:00.000Z" },
    ],
  },
  {
    id: 12,
    name: "lendenclub",
    displayName: "LenDenClub",
    peerGroup: "p2p_lending",
    category: "P2P Lender",
    tags: ["RBI Licensed", "Growing", "Short Term"],
    productOfferings: ["Short-term Loans", "Personal Loans", "Flexi Loans"],
    lastUpdated: "2024-10-01T00:00:00.000Z",
    fileCount: 1,
    metrics: {
      revenue:         { value: "220",   unit: "INR Cr", source: "news",         period: "FY2024" },
      ebitda:          { value: "35",    unit: "INR Cr", source: "news",         period: "FY2024" },
      pat:             { value: "24",    unit: "INR Cr", source: "news",         period: "FY2024" },
      total_expenses:  { value: "196",   unit: "INR Cr", source: "news",         period: "FY2024" },
      loan_book:       { value: "3200",  unit: "INR Cr", source: "manual",       period: "FY2024" },
      users:           { value: "500000", unit: "count", source: "news",         period: "FY2024" },
      employee_count:  { value: "280",   unit: "count",  source: "manual",       period: "FY2024" },
      funds_raised:    { value: "320",   unit: "INR Cr", source: "manual",       period: "All Time" },
      valuation:       { value: "1500",  unit: "INR Cr", source: "news",         period: "2023" },
    },
    news: [
      { id: 1201, headline: "LenDenClub grows loan book 45% to ₹3,200 Cr, targets ₹5,000 Cr by FY2026", summary: "Short-term P2P lender expands with new ML-based credit scoring models.", source: "Entrackr", sourceUrl: "https://entrackr.com", publishedAt: "2024-09-12T09:00:00.000Z" },
    ],
  },
  {
    id: 13,
    name: "lendbox",
    displayName: "Lendbox",
    peerGroup: "p2p_lending",
    category: "P2P Lender",
    tags: ["RBI Licensed", "B2B Focus", "Institutional"],
    productOfferings: ["Personal Loans", "Business Loans", "Co-lending", "Invoice Finance"],
    lastUpdated: "2024-08-01T00:00:00.000Z",
    fileCount: 1,
    metrics: {
      revenue:         { value: "120",   unit: "INR Cr", source: "news",         period: "FY2024" },
      ebitda:          { value: "14",    unit: "INR Cr", source: "news",         period: "FY2024" },
      pat:             { value: "9",     unit: "INR Cr", source: "news",         period: "FY2024" },
      total_expenses:  { value: "111",   unit: "INR Cr", source: "news",         period: "FY2024" },
      loan_book:       { value: "1800",  unit: "INR Cr", source: "manual",       period: "FY2024" },
      users:           { value: "300000", unit: "count", source: "news",         period: "FY2024" },
      employee_count:  { value: "180",   unit: "count",  source: "manual",       period: "FY2024" },
      funds_raised:    { value: "280",   unit: "INR Cr", source: "manual",       period: "All Time" },
      valuation:       { value: "800",   unit: "INR Cr", source: "news",         period: "2022" },
    },
    news: [],
  },
  {
    id: 14,
    name: "rupeecircle",
    displayName: "RupeeCircle",
    peerGroup: "p2p_lending",
    category: "P2P Lender",
    tags: ["RBI Licensed", "MSME Focus", "Niche"],
    productOfferings: ["MSME Loans", "Personal Loans", "Agricultural Finance"],
    lastUpdated: "2024-07-15T00:00:00.000Z",
    fileCount: 0,
    metrics: {
      revenue:         { value: "80",    unit: "INR Cr", source: "news",         period: "FY2024" },
      ebitda:          { value: "8",     unit: "INR Cr", source: "news",         period: "FY2024" },
      pat:             { value: "4",     unit: "INR Cr", source: "news",         period: "FY2024" },
      total_expenses:  { value: "76",    unit: "INR Cr", source: "news",         period: "FY2024" },
      loan_book:       { value: "1200",  unit: "INR Cr", source: "manual",       period: "FY2024" },
      users:           { value: "200000", unit: "count", source: "news",         period: "FY2024" },
      employee_count:  { value: "120",   unit: "count",  source: "manual",       period: "FY2024" },
      funds_raised:    { value: "120",   unit: "INR Cr", source: "manual",       period: "All Time" },
      valuation:       { value: "500",   unit: "INR Cr", source: "news",         period: "2021" },
    },
    news: [],
  },
];

export const ALL_COMPANIES: CompanyWithData[] = [...MOCK_COMPANIES_WM, ...MOCK_COMPANIES_P2P];

// ─── Insights ─────────────────────────────────────────────────────────────────

export const MOCK_INSIGHTS_WM = [
  { id: 1, peerGroup: "wealth_management", insightType: "highest_revenue", title: "Zerodha leads in revenue", description: "Zerodha dominates the wealth management peer group with ₹4,964 Cr revenue in FY2024, reflecting strong unit economics from its flat-fee brokerage model." },
  { id: 2, peerGroup: "wealth_management", insightType: "most_funded", title: "CRED is the most-funded company", description: "CRED has raised ₹11,400 Cr in total funding, making it the most capitalized player, though it continues to be loss-making at -₹609 Cr PAT." },
  { id: 3, peerGroup: "wealth_management", insightType: "weakest_profitability", title: "CRED and INDmoney burn the most", description: "CRED (-₹609 Cr) and INDmoney (-₹310 Cr) report the largest net losses, indicating aggressive growth investment against a backdrop of high CAC." },
  { id: 4, peerGroup: "wealth_management", insightType: "highest_valuation_revenue_ratio", title: "CRED has the highest valuation-to-revenue ratio", description: "CRED's valuation of ₹70,000 Cr against revenue of ₹2,400 Cr gives a 29x multiple — the highest in the peer group, reflecting speculation on future monetization potential." },
  { id: 5, peerGroup: "wealth_management", insightType: "market_leader", title: "Angel One has the largest user base", description: "Angel One leads with 2.2 Cr registered clients, ahead of Zerodha (1.5 Cr) and Groww (1.1 Cr), indicating strong distribution reach across Tier 2/3 cities." },
  { id: 6, peerGroup: "wealth_management", insightType: "strongest_operating_leverage", title: "Zerodha has the best EBITDA margin", description: "Zerodha's 58.6% EBITDA margin is the highest in the peer group — more than double Groww's 14.2% — demonstrating the advantage of a lean, bootstrapped operating model." },
];

export const MOCK_INSIGHTS_P2P = [
  { id: 7, peerGroup: "p2p_lending", insightType: "highest_revenue", title: "LenDenClub leads P2P revenue", description: "LenDenClub edges Faircent with ₹220 Cr revenue in FY2024, driven by its focus on short-term, high-velocity loans." },
  { id: 8, peerGroup: "p2p_lending", insightType: "market_leader", title: "LenDenClub has the largest loan book", description: "LenDenClub's ₹3,200 Cr loan book is the largest in the P2P peer group, representing a 45% YoY growth trajectory." },
  { id: 9, peerGroup: "p2p_lending", insightType: "emerging_threat", title: "Faircent most profitable on PAT margin basis", description: "Faircent's 10% PAT margin is the highest in P2P lending, benefiting from its established borrower-lender matching infrastructure." },
];

// ─── Files ────────────────────────────────────────────────────────────────────

export const MOCK_FILES = [
  { id: 1, companyId: 1, fileName: "zerodha_annual_report_fy2024.pdf", fileType: "pdf", status: "parsed", createdAt: "2024-08-10T10:00:00.000Z" },
  { id: 2, companyId: 1, fileName: "zerodha_q2_fy25_results.xlsx",    fileType: "excel", status: "parsed", createdAt: "2024-10-15T11:00:00.000Z" },
  { id: 3, companyId: 2, fileName: "groww_fy2024_financials.pdf",      fileType: "pdf",   status: "parsed", createdAt: "2024-09-05T09:00:00.000Z" },
  { id: 4, companyId: 3, fileName: "angel_one_fy2024_annual.pdf",      fileType: "pdf",   status: "parsed", createdAt: "2024-08-22T08:00:00.000Z" },
  { id: 5, companyId: 5, fileName: "cred_fy2024_financials.pdf",       fileType: "pdf",   status: "parsed", createdAt: "2024-09-12T14:00:00.000Z" },
  { id: 6, companyId: 11, fileName: "faircent_fy2024_report.pdf",      fileType: "pdf",   status: "parsed", createdAt: "2024-08-28T09:00:00.000Z" },
];
