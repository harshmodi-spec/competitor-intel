/**
 * Keyword-based Excel extraction for semi-structured financial dumps.
 * Does NOT assume fixed headers or fixed column positions.
 * Scans every cell in every sheet and matches against financial keyword lists.
 */
import * as XLSX from "xlsx";
import type { ParsedFinancialData } from "../shared/types";

// Normalise a string for matching: lowercase, strip special chars
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s\-_\.&'()\[\]/\\,;:]+/g, "");
}

type FinancialMetricKey = Exclude<keyof ParsedFinancialData, "reportingPeriod">;

// Keyword groups mapped to metric keys
const KEYWORD_MAP: Record<FinancialMetricKey, string[]> = {
  revenue: [
    "revenue", "totalrevenue", "totalincome", "operatingrevenue",
    "netrevenue", "grossrevenue", "incomefromoperations", "operatingincome",
    "totaloperatingincome", "totalearnings",
  ],
  totalExpenses: [
    "totalexpenses", "totalcost", "operatingexpenses", "totaloperatingexpenses",
    "totalcosts", "expensestotal", "costsandexpenses",
  ],
  ebitda: [
    "ebitda", "earningsbeforeinteresttaxesdepreciationandamortization",
    "earningsbeforeinteresttaxdepreciation",
  ],
  pat: [
    "pat", "profitaftertax", "netprofit", "netloss", "netincome",
    "profitforthecurrentyear", "profitfortheyear", "netearnings",
    "profitandlossaftertax", "netprofitloss",
  ],
  aum: [
    "aum", "assetsundermanagement", "totalassetsundermanagement",
    "assetundermanagement",
  ],
  loanBook: [
    "loanbook", "totalloanbook", "loanportfolio", "grossloanbook",
    "netloanbook", "totalloans", "loansandadvances",
  ],
  users: [
    "users", "customers", "registeredusers", "totalusers", "totalcustomers",
    "activeusers", "activecustomers", "userbase",
  ],
  employeeCount: [
    "employees", "headcount", "totalemployees", "employeecount",
    "noofemployees", "numberofemployees", "totalheadcount", "staffcount",
  ],
  fundsRaised: [
    "fundsraised", "totalfundsraised", "capitalraised", "totalfunding",
    "cumulativefunding", "totalinvestment", "totalcapitalraised",
  ],
  valuation: [
    "valuation", "companyvaluation", "postmoneyvaluation", "currentvaluation",
    "enterprisevalue",
  ],
};

// Units for each metric
const METRIC_UNITS: Record<FinancialMetricKey, string> = {
  revenue: "INR Cr",
  totalExpenses: "INR Cr",
  ebitda: "INR Cr",
  pat: "INR Cr",
  aum: "INR Cr",
  loanBook: "INR Cr",
  users: "count",
  employeeCount: "count",
  fundsRaised: "INR Cr",
  valuation: "INR Cr",
};

/** Try to parse a raw cell value as a number. Returns null if not parseable. */
function toNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") return isNaN(raw) ? null : raw;
  if (typeof raw === "string") {
    // Remove currency symbols, commas, spaces
    const cleaned = raw.replace(/[₹$,\s]/g, "").trim();
    if (cleaned === "" || cleaned === "-" || cleaned === "NA" || cleaned === "N/A") return null;
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }
  return null;
}

/** Scan adjacent cells in the same row for a numeric value */
function findValueInRow(row: unknown[], labelColIdx: number): number | null {
  // Search right then left of the label cell
  for (let delta = 1; delta <= 5; delta++) {
    const rightIdx = labelColIdx + delta;
    if (rightIdx < row.length) {
      const v = toNumber(row[rightIdx]);
      if (v !== null) return v;
    }
  }
  // Try left
  for (let delta = 1; delta <= 2; delta++) {
    const leftIdx = labelColIdx - delta;
    if (leftIdx >= 0) {
      const v = toNumber(row[leftIdx]);
      if (v !== null) return v;
    }
  }
  return null;
}

/** Detect if a number is likely in Lakhs or Crores based on magnitude */
function normalizeToInrCr(value: number, rawLabel: string): number {
  const label = rawLabel.toLowerCase();
  // If the column/row header mentions "lakhs" or "in lakhs"
  if (label.includes("lakh") || label.includes("lac")) {
    return value / 100; // Convert lakhs to crores
  }
  // If > 10,000 and not marked as count/users, likely already in crores or raw INR
  // If > 10,000,000 treat as raw INR → convert to crores
  if (value > 10_000_000 && !label.includes("cr")) {
    return value / 10_000_000; // raw INR → crores
  }
  return value;
}

/** Detect reporting period from sheet name or data */
function detectPeriod(sheetName: string): string {
  const match = sheetName.match(/FY\s*(\d{2,4})/i) || sheetName.match(/20(\d{2})/);
  if (match) return `FY${match[0].replace(/\s+/g, "").toUpperCase()}`;
  return "FY2024";
}

/**
 * Main extraction function.
 * Returns ParsedFinancialData with best-guess values extracted via keywords.
 */
export function extractFromExcelBuffer(buffer: Buffer): ParsedFinancialData {
  const workbook = XLSX.read(buffer, { type: "buffer", cellText: false, cellDates: true });
  const result: Partial<Record<keyof ParsedFinancialData, { value: string; unit: string; period: string }>> = {};
  const scores: Partial<Record<keyof ParsedFinancialData, number>> = {};

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const period = detectPeriod(sheetName);
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      if (!row || row.length === 0) continue;

      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cell = row[colIdx];
        if (!cell || typeof cell !== "string") continue;

        const normalised = norm(cell);
        if (normalised.length < 3) continue;

        // Try to match this cell against all keyword groups
        for (const [metricKey, keywords] of Object.entries(KEYWORD_MAP) as [FinancialMetricKey, string[]][]) {
          const matched = keywords.some(kw => {
            // Exact match or startsWith
            return normalised === kw || normalised.startsWith(kw) || kw.startsWith(normalised);
          });

          if (!matched) continue;

          // Found a label match — find the numeric value
          const value = findValueInRow(row, colIdx);
          if (value === null) continue;

          // Score: prefer longer keyword matches (more specific)
          const matchScore = keywords.filter(kw => normalised === kw || normalised.startsWith(kw) || kw.startsWith(normalised))
            .reduce((max, kw) => Math.max(max, kw.length), 0);

          if (scores[metricKey] !== undefined && scores[metricKey]! >= matchScore) continue;

          const unit = METRIC_UNITS[metricKey];
          let finalValue = value;
          if (unit === "INR Cr") {
            finalValue = normalizeToInrCr(value, cell);
          }

          result[metricKey] = {
            value: String(Math.round(finalValue * 100) / 100),
            unit,
            period,
          };
          scores[metricKey] = matchScore;
        }
      }
    }
  }

  return result as ParsedFinancialData;
}

/**
 * Extract from base64-encoded Excel file content.
 */
export function extractFromExcelBase64(base64: string): ParsedFinancialData {
  const buffer = Buffer.from(base64, "base64");
  return extractFromExcelBuffer(buffer);
}
