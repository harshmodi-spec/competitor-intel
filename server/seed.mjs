import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { companies, companyMetrics, newsItems } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const wealthCompanies = [
  {
    name: "1_finance", displayName: "1 Finance", peerGroup: "wealth_management",
    category: "Wealth Management", productOfferings: ["Wealth Planning", "Tax Advisory", "Insurance", "Mutual Funds", "P2P Lending"],
    tags: ["hybrid", "multi-product"],
    metrics: {
      revenue: { value: "45", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "62", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "-12", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-17", unit: "INR Cr", period: "FY2024" },
      aum: { value: "2800", unit: "INR Cr", period: "FY2024" },
      users: { value: "85000", unit: "count", period: "FY2024" },
      employee_count: { value: "320", unit: "count", period: "FY2024" },
      funds_raised: { value: "185", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "850", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "1 Finance raises Series B funding to expand wealth management platform", source: "Economic Times", sourceUrl: "https://economictimes.indiatimes.com/tech/funding/1-finance-series-b", summary: "1 Finance secured fresh funding to scale its multi-product wealth platform targeting HNI and mass affluent segments.", publishedAt: "2024-06-15" },
      { headline: "1 Finance crosses Rs 2,800 crore AUM milestone", source: "Mint", sourceUrl: "https://www.livemint.com/companies/1-finance-aum-milestone", summary: "The Pune-based wealth management startup has seen 3x growth in assets under management over the past year.", publishedAt: "2024-05-20" },
      { headline: "1 Finance launches AI-powered tax advisory for salaried professionals", source: "Business Standard", sourceUrl: "https://www.business-standard.com/companies/1-finance-tax-advisory", summary: "New feature uses AI to optimize tax savings across multiple investment instruments.", publishedAt: "2024-04-10" },
    ],
  },
  {
    name: "cred", displayName: "CRED", peerGroup: "wealth_management",
    category: "Fintech Platform", productOfferings: ["Credit Card Payments", "CRED Cash", "CRED Mint", "Personal Finance", "Wealth Management"],
    tags: ["consumer", "high-growth", "unicorn"],
    metrics: {
      revenue: { value: "2473", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "3120", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "-320", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-647", unit: "INR Cr", period: "FY2024" },
      aum: { value: "5200", unit: "INR Cr", period: "FY2024" },
      users: { value: "35000000", unit: "count", period: "FY2024" },
      employee_count: { value: "900", unit: "count", period: "FY2024" },
      funds_raised: { value: "5462", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "46000", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "CRED narrows losses by 41% in FY24, revenue surges to Rs 2,473 crore", source: "Inc42", sourceUrl: "https://inc42.com/buzz/cred-fy24-financials", summary: "CRED reported significant improvement in unit economics with revenue growing 66% YoY.", publishedAt: "2024-09-15" },
      { headline: "CRED launches wealth management vertical targeting premium users", source: "Moneycontrol", sourceUrl: "https://www.moneycontrol.com/news/business/cred-wealth-management", summary: "The fintech unicorn is expanding into wealth management for its high-credit-score user base.", publishedAt: "2024-08-20" },
      { headline: "CRED valued at $6.4 billion in secondary share sale", source: "Economic Times", sourceUrl: "https://economictimes.indiatimes.com/tech/startups/cred-valuation", summary: "Secondary transactions value CRED at $6.4 billion, making it one of India's most valuable fintech startups.", publishedAt: "2024-07-10" },
    ],
  },
  {
    name: "ionic_wealth", displayName: "Ionic Wealth", peerGroup: "wealth_management",
    category: "Wealth Advisory", productOfferings: ["Portfolio Management", "Financial Planning", "Estate Planning"],
    tags: ["HNI-focused"],
    metrics: {
      revenue: { value: "12", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "15", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "-2", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-3", unit: "INR Cr", period: "FY2024" },
      aum: { value: "450", unit: "INR Cr", period: "FY2024" },
      users: { value: "2500", unit: "count", period: "FY2024" },
      employee_count: { value: "45", unit: "count", period: "FY2024" },
      funds_raised: { value: "25", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "120", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "Ionic Wealth expands HNI advisory services to Tier-2 cities", source: "VCCircle", sourceUrl: "https://www.vccircle.com/ionic-wealth-expansion", summary: "The wealth advisory firm is targeting affluent families in emerging cities.", publishedAt: "2024-05-10" },
    ],
  },
  {
    name: "dezerv", displayName: "Dezerv", peerGroup: "wealth_management",
    category: "Wealth Management", productOfferings: ["Equity Portfolios", "Fixed Income", "Alternative Investments", "Tax Planning"],
    tags: ["high-growth", "tech-driven"],
    metrics: {
      revenue: { value: "85", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "110", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "-15", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-25", unit: "INR Cr", period: "FY2024" },
      aum: { value: "5500", unit: "INR Cr", period: "FY2024" },
      users: { value: "45000", unit: "count", period: "FY2024" },
      employee_count: { value: "280", unit: "count", period: "FY2024" },
      funds_raised: { value: "465", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "2200", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "Dezerv raises $32 million in Series B led by Accel", source: "Economic Times", sourceUrl: "https://economictimes.indiatimes.com/tech/funding/dezerv-series-b", summary: "Dezerv plans to use the funds to expand its wealth management platform and grow AUM.", publishedAt: "2024-07-22" },
      { headline: "Dezerv AUM crosses Rs 5,500 crore, eyes profitability by FY26", source: "Mint", sourceUrl: "https://www.livemint.com/companies/dezerv-aum-growth", summary: "The wealth-tech startup has seen rapid AUM growth driven by its tech-first approach.", publishedAt: "2024-06-15" },
      { headline: "Dezerv launches alternative investment products for HNIs", source: "Business Standard", sourceUrl: "https://www.business-standard.com/companies/dezerv-alternatives", summary: "New AIF products target investors seeking diversification beyond traditional equity and debt.", publishedAt: "2024-05-08" },
    ],
  },
  {
    name: "ind_money", displayName: "IND Money", peerGroup: "wealth_management",
    category: "Investment Platform", productOfferings: ["US Stocks", "Mutual Funds", "Fixed Deposits", "Loans", "Insurance"],
    tags: ["high-growth", "multi-product"],
    metrics: {
      revenue: { value: "350", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "480", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "-85", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-130", unit: "INR Cr", period: "FY2024" },
      aum: { value: "12000", unit: "INR Cr", period: "FY2024" },
      users: { value: "8000000", unit: "count", period: "FY2024" },
      employee_count: { value: "650", unit: "count", period: "FY2024" },
      funds_raised: { value: "860", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "5800", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "INDmoney crosses $1.5 billion AUM, eyes profitability", source: "Entrackr", sourceUrl: "https://entrackr.com/2024/indmoney-aum-milestone", summary: "The super-app for personal finance has grown its AUM significantly through US stocks and MF distribution.", publishedAt: "2024-08-10" },
      { headline: "INDmoney launches salary account with 9% returns on idle cash", source: "Moneycontrol", sourceUrl: "https://www.moneycontrol.com/news/business/indmoney-salary-account", summary: "New feature auto-invests idle salary into liquid funds for higher returns.", publishedAt: "2024-07-05" },
    ],
  },
  {
    name: "waterfield", displayName: "Waterfield", peerGroup: "wealth_management",
    category: "Wealth Advisory", productOfferings: ["Family Office", "Portfolio Management", "Estate Planning", "Tax Advisory"],
    tags: ["HNI-focused", "family-office"],
    metrics: {
      revenue: { value: "28", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "22", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "8", unit: "INR Cr", period: "FY2024" },
      pat: { value: "6", unit: "INR Cr", period: "FY2024" },
      aum: { value: "3200", unit: "INR Cr", period: "FY2024" },
      users: { value: "1200", unit: "count", period: "FY2024" },
      employee_count: { value: "85", unit: "count", period: "FY2024" },
      funds_raised: { value: "45", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "280", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "Waterfield Advisors strengthens family office practice with senior hires", source: "VCCircle", sourceUrl: "https://www.vccircle.com/waterfield-advisors-hires", summary: "The multi-family office is expanding its team to serve growing UHNI client base.", publishedAt: "2024-06-20" },
    ],
  },
  {
    name: "asset_plus", displayName: "Asset Plus", peerGroup: "wealth_management",
    category: "MFD Platform", productOfferings: ["Mutual Fund Distribution", "SIP Platform", "Goal-based Investing"],
    tags: ["B2B", "distribution"],
    metrics: {
      revenue: { value: "8", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "11", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "-2", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-3", unit: "INR Cr", period: "FY2024" },
      aum: { value: "680", unit: "INR Cr", period: "FY2024" },
      users: { value: "15000", unit: "count", period: "FY2024" },
      employee_count: { value: "35", unit: "count", period: "FY2024" },
      funds_raised: { value: "12", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "55", unit: "INR Cr", period: "2024" },
    },
    news: [],
  },
  {
    name: "scripbox", displayName: "Scripbox", peerGroup: "wealth_management",
    category: "Digital Wealth", productOfferings: ["Mutual Funds", "Equity", "Tax Filing", "Insurance", "Gold"],
    tags: ["profitable", "established"],
    metrics: {
      revenue: { value: "120", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "105", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "22", unit: "INR Cr", period: "FY2024" },
      pat: { value: "15", unit: "INR Cr", period: "FY2024" },
      aum: { value: "8500", unit: "INR Cr", period: "FY2024" },
      users: { value: "1200000", unit: "count", period: "FY2024" },
      employee_count: { value: "350", unit: "count", period: "FY2024" },
      funds_raised: { value: "280", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "1800", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "Scripbox turns profitable in FY24 with Rs 15 crore PAT", source: "Inc42", sourceUrl: "https://inc42.com/buzz/scripbox-profitable-fy24", summary: "The Accel-backed wealth management platform achieved profitability after years of investment.", publishedAt: "2024-08-25" },
      { headline: "Scripbox launches equity direct plans for DIY investors", source: "Financial Express", sourceUrl: "https://www.financialexpress.com/market/scripbox-equity-plans", summary: "New offering targets self-directed investors looking for curated equity portfolios.", publishedAt: "2024-07-12" },
    ],
  },
  {
    name: "fundsindia", displayName: "FundsIndia", peerGroup: "wealth_management",
    category: "Investment Platform", productOfferings: ["Mutual Funds", "Stocks", "NPS", "Insurance", "Advisory"],
    tags: ["established", "full-service"],
    metrics: {
      revenue: { value: "65", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "58", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "10", unit: "INR Cr", period: "FY2024" },
      pat: { value: "7", unit: "INR Cr", period: "FY2024" },
      aum: { value: "6200", unit: "INR Cr", period: "FY2024" },
      users: { value: "800000", unit: "count", period: "FY2024" },
      employee_count: { value: "200", unit: "count", period: "FY2024" },
      funds_raised: { value: "120", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "650", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "FundsIndia revamps advisory model with AI-driven recommendations", source: "Mint", sourceUrl: "https://www.livemint.com/companies/fundsindia-ai-advisory", summary: "The Chennai-based platform is using AI to personalize investment recommendations.", publishedAt: "2024-06-30" },
    ],
  },
  {
    name: "powerup_money", displayName: "PowerUp Money", peerGroup: "wealth_management",
    category: "Wealth Tech", productOfferings: ["Financial Planning", "Investment Advisory", "Insurance"],
    tags: ["early-stage"],
    metrics: {
      revenue: { value: "3", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "5", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "-1.5", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-2", unit: "INR Cr", period: "FY2024" },
      aum: { value: "120", unit: "INR Cr", period: "FY2024" },
      users: { value: "5000", unit: "count", period: "FY2024" },
      employee_count: { value: "18", unit: "count", period: "FY2024" },
      funds_raised: { value: "8", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "35", unit: "INR Cr", period: "2024" },
    },
    news: [],
  },
  {
    name: "centricity_wealth", displayName: "Centricity Wealth", peerGroup: "wealth_management",
    category: "Wealth Management", productOfferings: ["Wealth Management", "Real Estate Advisory", "Insurance", "Tax Planning"],
    tags: ["HNI-focused"],
    metrics: {
      revenue: { value: "18", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "20", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "0.5", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-2", unit: "INR Cr", period: "FY2024" },
      aum: { value: "1500", unit: "INR Cr", period: "FY2024" },
      users: { value: "3500", unit: "count", period: "FY2024" },
      employee_count: { value: "60", unit: "count", period: "FY2024" },
      funds_raised: { value: "35", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "180", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "Centricity Wealth targets Rs 2,000 crore AUM by FY25", source: "Business Standard", sourceUrl: "https://www.business-standard.com/companies/centricity-wealth-aum", summary: "The wealth management firm is expanding its HNI client base across metro cities.", publishedAt: "2024-04-15" },
    ],
  },
];

const p2pCompanies = [
  {
    name: "1_finance_p2p", displayName: "1 Finance", peerGroup: "p2p_lending",
    category: "Hybrid", productOfferings: ["P2P Lending", "Wealth Management", "Fixed Returns"],
    tags: ["hybrid", "multi-product"],
    metrics: {
      revenue: { value: "45", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "62", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "-12", unit: "INR Cr", period: "FY2024" },
      pat: { value: "-17", unit: "INR Cr", period: "FY2024" },
      loan_book: { value: "850", unit: "INR Cr", period: "FY2024" },
      users: { value: "85000", unit: "count", period: "FY2024" },
      employee_count: { value: "320", unit: "count", period: "FY2024" },
      funds_raised: { value: "185", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "850", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "1 Finance expands P2P lending book to Rs 850 crore", source: "Entrackr", sourceUrl: "https://entrackr.com/2024/1-finance-p2p-growth", summary: "The hybrid fintech platform has seen strong growth in its peer-to-peer lending vertical.", publishedAt: "2024-07-18" },
    ],
  },
  {
    name: "lendenclub", displayName: "LendenClub", peerGroup: "p2p_lending",
    category: "P2P Lending", productOfferings: ["P2P Lending", "Auto-invest", "Fractional Lending"],
    tags: ["market-leader", "profitable"],
    metrics: {
      revenue: { value: "520", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "380", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "165", unit: "INR Cr", period: "FY2024" },
      pat: { value: "140", unit: "INR Cr", period: "FY2024" },
      loan_book: { value: "4200", unit: "INR Cr", period: "FY2024" },
      users: { value: "15000000", unit: "count", period: "FY2024" },
      employee_count: { value: "450", unit: "count", period: "FY2024" },
      funds_raised: { value: "310", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "3500", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "LendenClub posts Rs 140 crore profit in FY24, becomes most profitable P2P lender", source: "Inc42", sourceUrl: "https://inc42.com/buzz/lendenclub-fy24-profit", summary: "The P2P lending platform reported strong profitability driven by scale and operational efficiency.", publishedAt: "2024-09-05" },
      { headline: "LendenClub crosses 1.5 crore registered users", source: "Economic Times", sourceUrl: "https://economictimes.indiatimes.com/tech/startups/lendenclub-users", summary: "The RBI-registered NBFC-P2P has seen rapid user acquisition through digital channels.", publishedAt: "2024-08-12" },
      { headline: "RBI tightens P2P lending norms, LendenClub adapts business model", source: "Business Standard", sourceUrl: "https://www.business-standard.com/finance/rbi-p2p-norms", summary: "New regulations require P2P platforms to ensure proper risk disclosure and lending limits.", publishedAt: "2024-07-20" },
    ],
  },
  {
    name: "faircent", displayName: "Faircent", peerGroup: "p2p_lending",
    category: "P2P Lending", productOfferings: ["P2P Lending", "Business Loans", "Personal Loans"],
    tags: ["established", "RBI-registered"],
    metrics: {
      revenue: { value: "85", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "72", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "18", unit: "INR Cr", period: "FY2024" },
      pat: { value: "13", unit: "INR Cr", period: "FY2024" },
      loan_book: { value: "1800", unit: "INR Cr", period: "FY2024" },
      users: { value: "3500000", unit: "count", period: "FY2024" },
      employee_count: { value: "180", unit: "count", period: "FY2024" },
      funds_raised: { value: "95", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "580", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "Faircent achieves profitability in FY24 amid regulatory changes", source: "Mint", sourceUrl: "https://www.livemint.com/companies/faircent-profitable-fy24", summary: "India's first P2P lending platform turned profitable while adapting to new RBI guidelines.", publishedAt: "2024-08-18" },
      { headline: "Faircent launches business loan vertical for MSMEs", source: "Financial Express", sourceUrl: "https://www.financialexpress.com/industry/faircent-msme-loans", summary: "The platform is diversifying beyond personal loans to serve small business credit needs.", publishedAt: "2024-06-25" },
    ],
  },
  {
    name: "lendbox", displayName: "Lendbox", peerGroup: "p2p_lending",
    category: "P2P Lending", productOfferings: ["P2P Lending", "Invoice Discounting", "Fixed Returns"],
    tags: ["RBI-registered"],
    metrics: {
      revenue: { value: "42", unit: "INR Cr", period: "FY2024" },
      total_expenses: { value: "38", unit: "INR Cr", period: "FY2024" },
      ebitda: { value: "6", unit: "INR Cr", period: "FY2024" },
      pat: { value: "4", unit: "INR Cr", period: "FY2024" },
      loan_book: { value: "950", unit: "INR Cr", period: "FY2024" },
      users: { value: "1200000", unit: "count", period: "FY2024" },
      employee_count: { value: "120", unit: "count", period: "FY2024" },
      funds_raised: { value: "55", unit: "INR Cr", period: "cumulative" },
      valuation: { value: "320", unit: "INR Cr", period: "2024" },
    },
    news: [
      { headline: "Lendbox diversifies into invoice discounting for SMEs", source: "VCCircle", sourceUrl: "https://www.vccircle.com/lendbox-invoice-discounting", summary: "The P2P platform is expanding its product suite to include supply chain financing.", publishedAt: "2024-07-08" },
      { headline: "Lendbox reports Rs 4 crore profit in FY24", source: "Entrackr", sourceUrl: "https://entrackr.com/2024/lendbox-fy24-financials", summary: "The P2P lender achieved modest profitability while growing its loan book.", publishedAt: "2024-08-30" },
    ],
  },
];

async function seed() {
  console.log("Seeding companies...");

  const allCompanies = [...wealthCompanies, ...p2pCompanies];

  for (const comp of allCompanies) {
    console.log(`  Seeding: ${comp.displayName} (${comp.peerGroup})`);

    // Insert company
    const result = await db.insert(companies).values({
      name: comp.name,
      displayName: comp.displayName,
      peerGroup: comp.peerGroup,
      category: comp.category || "",
      productOfferings: comp.productOfferings || [],
      tags: comp.tags || [],
    });
    const companyId = result[0].insertId;

    // Insert metrics
    for (const [metricName, metricData] of Object.entries(comp.metrics)) {
      await db.insert(companyMetrics).values({
        companyId,
        metricName,
        metricValue: metricData.value,
        metricUnit: metricData.unit,
        period: metricData.period,
        source: "manual",
        sourceDetail: "Initial seed data",
      });
    }

    // Insert news
    for (const news of comp.news) {
      await db.insert(newsItems).values({
        companyId,
        headline: news.headline,
        summary: news.summary,
        source: news.source,
        sourceUrl: news.sourceUrl,
        publishedAt: new Date(news.publishedAt),
      });
    }
  }

  console.log(`Seeded ${allCompanies.length} companies successfully!`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
