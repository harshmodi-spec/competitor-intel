/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Peer groups
export type PeerGroup = "wealth_management" | "p2p_lending";
export type MetricSource = "manual" | "parsed_pdf" | "parsed_excel" | "news" | "uploaded_file";

// Standard metric names used across the system
export const METRIC_NAMES = {
  REVENUE: "revenue",
  TOTAL_EXPENSES: "total_expenses",
  EBITDA: "ebitda",
  PAT: "pat",
  AUM: "aum",
  LOAN_BOOK: "loan_book",
  USERS: "users",
  EMPLOYEE_COUNT: "employee_count",
  FUNDS_RAISED: "funds_raised",
  VALUATION: "valuation",
} as const;

export type MetricName = (typeof METRIC_NAMES)[keyof typeof METRIC_NAMES];

// Parsed data structure from AI extraction
export interface ParsedFinancialData {
  revenue?: { value: string; unit: string; period: string };
  totalExpenses?: { value: string; unit: string; period: string };
  ebitda?: { value: string; unit: string; period: string };
  pat?: { value: string; unit: string; period: string };
  aum?: { value: string; unit: string; period: string };
  loanBook?: { value: string; unit: string; period: string };
  users?: { value: string; unit: string; period: string };
  employeeCount?: { value: string; unit: string; period: string };
  fundsRaised?: { value: string; unit: string; period: string };
  valuation?: { value: string; unit: string; period: string };
  reportingPeriod?: string;
}

// Company with all related data for frontend
export interface CompanyWithData {
  id: number;
  name: string;
  displayName: string;
  peerGroup: PeerGroup;
  category: string;
  logoUrl: string | null;
  productOfferings: string[];
  tags: string[];
  metrics: Record<string, { value: string; unit: string; period: string; source: MetricSource; updatedAt: string }>;
  news: Array<{ id: number; headline: string; summary: string | null; source: string; sourceUrl: string; publishedAt: string | null }>;
  lastUpdated: string;
  fileCount: number;
}
