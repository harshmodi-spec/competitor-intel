const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 3000;

app.use(cors());
app.use(express.json());

const PEER_GROUPS = {
  wealth_management: [
    "1 Finance",
    "CRED",
    "Ionic Wealth",
    "Dezerv",
    "IND Money",
    "Waterfield",
    "Asset Plus",
    "ScripBox",
    "FundsIndia",
    "PowerUp Money",
    "Centricity Wealth",
  ],
  p2p_lending: ["1 Finance", "LendenClub", "Faircent", "Lendbox"],
};

const metricKeywords = {
  revenue: ["revenue", "sales", "income", "operating income", "total income"],
  profit: ["profit", "net profit", "pat", "profit after tax"],
  ebitda: ["ebitda"],
  aum: ["aum", "assets under management"],
  users: ["users", "customers", "clients"],
  employees: ["employees", "headcount"],
  company: ["company", "name"],
  year: ["fy", "year", "2021", "2022", "2023", "2024", "2025", "2026"],
};

const aliasToCanonical = {
  "1finance": "1 Finance",
  "onefinance": "1 Finance",
  cred: "CRED",
  ionicwealth: "Ionic Wealth",
  dezerv: "Dezerv",
  indmoney: "IND Money",
  scripbox: "ScripBox",
  assetplus: "Asset Plus",
  powerup: "PowerUp Money",
  powerupmoney: "PowerUp Money",
  waterfield: "Waterfield",
  fundsindia: "FundsIndia",
  centricitywealth: "Centricity Wealth",
  lenclub: "LendenClub",
  lendenclub: "LendenClub",
  lendenclubindia: "LendenClub",
  faircent: "Faircent",
  lendbox: "Lendbox",
};

const state = {
  companies: {},
  aliases: { ...aliasToCanonical },
  sourceFile: null,
};

function normalizeKey(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function canonicalizeCompanyName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "Unknown Company";
  const key = normalizeKey(raw);
  return state.aliases[key] || raw;
}

function isKeywordMatch(text, keywords) {
  const cell = String(text || "").toLowerCase();
  return keywords.some((k) => cell.includes(k));
}

function parseNumeric(input) {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[,₹$%]/g, "").trim();
  if (!cleaned) return null;
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

function parseYear(input) {
  const str = String(input || "");
  const y = str.match(/(20\d{2})/);
  return y ? Number(y[1]) : undefined;
}

function inferCompanyFromSheet(sheetName, rowCells) {
  const candidates = [sheetName, ...rowCells.map((c) => String(c || ""))];
  for (const candidate of candidates) {
    const maybe = canonicalizeCompanyName(candidate);
    if (maybe !== "Unknown Company" && maybe !== candidate) return maybe;
  }
  for (const candidate of candidates) {
    const trimmed = String(candidate || "").trim();
    if (trimmed && trimmed.length > 2 && /[a-z]/i.test(trimmed)) return canonicalizeCompanyName(trimmed);
  }
  return "Unknown Company";
}

function updateMetrics(existing, candidate) {
  const out = { ...existing };
  ["revenue", "profit", "ebitda", "aum", "users", "employees"].forEach((metric) => {
    if (candidate[metric] !== undefined && candidate[metric] !== null) out[metric] = candidate[metric];
  });
  if (!out.year && candidate.year) out.year = candidate.year;
  return out;
}

function extractFromTabular(headers, row, sheetName) {
  const obj = { company: undefined, year: undefined };
  headers.forEach((h, idx) => {
    const cell = row[idx];
    const header = String(h || "").toLowerCase();
    if (!obj.company && isKeywordMatch(header, metricKeywords.company)) obj.company = String(cell || "").trim();
    if (!obj.year && isKeywordMatch(header, metricKeywords.year)) obj.year = parseYear(cell || h);
    for (const metric of ["revenue", "profit", "ebitda", "aum", "users", "employees"]) {
      if (isKeywordMatch(header, metricKeywords[metric])) {
        const n = parseNumeric(cell);
        if (n !== null) obj[metric] = n;
      }
    }
  });
  if (!obj.company) obj.company = inferCompanyFromSheet(sheetName, row);
  return obj;
}

function extractFromSemiStructured(grid, r, c, sheetName) {
  const val = String(grid[r]?.[c] || "").trim();
  if (!val) return null;
  const row = grid[r] || [];
  const candidate = { company: inferCompanyFromSheet(sheetName, row), year: parseYear(val) };
  let hit = false;

  for (const metric of ["revenue", "profit", "ebitda", "aum", "users", "employees"]) {
    if (isKeywordMatch(val, metricKeywords[metric])) {
      const right = parseNumeric(grid[r]?.[c + 1]);
      const down = parseNumeric(grid[r + 1]?.[c]);
      const same = parseNumeric(grid[r]?.[c]);
      const found = right ?? down ?? same;
      if (found !== null) {
        candidate[metric] = found;
        hit = true;
      }
    }
  }

  if (isKeywordMatch(val, metricKeywords.company)) {
    const rightName = String(grid[r]?.[c + 1] || "").trim();
    if (rightName) {
      candidate.company = rightName;
      hit = true;
    }
  }

  return hit ? candidate : null;
}

function parseWorkbook(workbook) {
  const records = [];
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const grid = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!grid.length) return;

    const headerRowIndex = Math.min(
      5,
      Math.max(
        0,
        grid.findIndex((row) => row.some((cell) => isKeywordMatch(cell, metricKeywords.company) || isKeywordMatch(cell, metricKeywords.revenue)))
      )
    );

    if (headerRowIndex >= 0 && grid[headerRowIndex]) {
      const headers = grid[headerRowIndex];
      for (let i = headerRowIndex + 1; i < grid.length; i += 1) {
        const row = grid[i];
        if (!row || row.every((c) => String(c || "").trim() === "")) continue;
        const entry = extractFromTabular(headers, row, sheetName);
        const canonical = canonicalizeCompanyName(entry.company);
        if (canonical && canonical !== "Unknown Company") records.push({ canonicalName: canonical, ...entry });
      }
    }

    for (let r = 0; r < grid.length; r += 1) {
      for (let c = 0; c < grid[r].length; c += 1) {
        const hit = extractFromSemiStructured(grid, r, c, sheetName);
        if (hit) {
          const canonical = canonicalizeCompanyName(hit.company);
          if (canonical && canonical !== "Unknown Company") records.push({ canonicalName: canonical, ...hit });
        }
      }
    }
  });
  return records;
}

function getPeerGroupsForCompany(canonicalName) {
  const groups = [];
  if (PEER_GROUPS.wealth_management.includes(canonicalName)) groups.push("wealth_management");
  if (PEER_GROUPS.p2p_lending.includes(canonicalName)) groups.push("p2p_lending");
  return groups;
}

function rebuildState(records) {
  const companies = {};
  records.forEach((record) => {
    const canonicalName = canonicalizeCompanyName(record.canonicalName || record.company);
    if (!companies[canonicalName]) {
      companies[canonicalName] = {
        canonicalName,
        displayName: canonicalName,
        aliases: [],
        peerGroups: getPeerGroupsForCompany(canonicalName),
        metrics: {},
        year: record.year,
      };
    }
    companies[canonicalName].metrics = updateMetrics(companies[canonicalName].metrics, record);
    if (record.year) companies[canonicalName].year = record.year;
  });

  Object.values(companies).forEach((company) => {
    Object.entries(state.aliases).forEach(([alias, canonical]) => {
      if (canonical === company.canonicalName) company.aliases.push(alias);
    });
  });

  state.companies = companies;
}

function findPreferredSamplePath() {
  const root = path.resolve(__dirname, "..");
  const preferred = path.join(root, "Sample.xlsx");
  if (fs.existsSync(preferred)) return preferred;
  const alt = fs.readdirSync(root).find((n) => n.toLowerCase().endsWith(".xlsx"));
  return alt ? path.join(root, alt) : null;
}

function loadWorkbookFromBufferOrDisk(buffer) {
  if (buffer) return xlsx.read(buffer, { type: "buffer" });
  const samplePath = findPreferredSamplePath();
  if (!samplePath) throw new Error("No upload provided and /Sample.xlsx was not found in repository root.");
  state.sourceFile = samplePath;
  return xlsx.readFile(samplePath, { cellDates: true });
}

function getCompanyList() {
  return Object.values(state.companies).map((c) => ({ ...c, strictPeerCompany: c.peerGroups.length > 0 }));
}

function chooseMetric(question) {
  if (/aum/.test(question)) return "aum";
  if (/ebitda/.test(question)) return "ebitda";
  if (/user|customer|client/.test(question)) return "users";
  if (/employee|headcount/.test(question)) return "employees";
  if (/profit|pat|loss/.test(question)) return "profit";
  return "revenue";
}

function metricValue(company, metric) {
  const v = company.metrics?.[metric];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function detectCompaniesFromQuestion(question, list) {
  const q = question.toLowerCase();
  return list.filter((company) => {
    const keys = [company.canonicalName, company.displayName, ...company.aliases].map((v) => String(v || "").toLowerCase());
    return keys.some((k) => k && q.includes(k));
  });
}

function rankCompanies(companies, metric, direction = "desc") {
  const present = companies
    .map((c) => ({ company: c, value: metricValue(c, metric) }))
    .filter((x) => x.value !== null);
  present.sort((a, b) => (direction === "asc" ? a.value - b.value : b.value - a.value));
  return present;
}

function answerQuestion(question) {
  const q = String(question || "").toLowerCase().trim();
  const list = getCompanyList();
  if (!q) return { answer: "Please ask a question." };
  if (!list.length) return { answer: "No data available yet. Upload a file or parse /Sample.xlsx first." };

  const metric = chooseMetric(q);
  const mentioned = detectCompaniesFromQuestion(q, list);

  if (/(compare|vs|versus)/.test(q) && mentioned.length >= 2) {
    const compared = mentioned.slice(0, 2);
    const [a, b] = compared;
    const av = metricValue(a, metric);
    const bv = metricValue(b, metric);
    if (av === null || bv === null) return { answer: `I found both companies, but ${metric.toUpperCase()} is missing for one of them.` };
    const better = av > bv ? a.displayName : b.displayName;
    return { answer: `${metric.toUpperCase()} comparison: ${a.displayName} (${av}) vs ${b.displayName} (${bv}). ${better} is higher.` };
  }

  if (/(loss|loss making|negative profit)/.test(q)) {
    const losers = list.filter((c) => {
      const p = metricValue(c, "profit");
      return p !== null && p < 0;
    });
    return { answer: losers.length ? `Loss-making companies: ${losers.map((x) => x.displayName).join(", ")}.` : "No loss-making companies found in current data." };
  }

  if (/(profitable|profit making)/.test(q)) {
    const profitable = list.filter((c) => {
      const p = metricValue(c, "profit");
      return p !== null && p > 0;
    });
    return { answer: profitable.length ? `Profitable companies: ${profitable.map((x) => x.displayName).join(", ")}.` : "No profitable companies identified from current data." };
  }

  if (/(top\s*\d+|ranking|rank|top companies|best company|highest|lowest|worst)/.test(q)) {
    const topNMatch = q.match(/top\s*(\d+)/);
    const topN = topNMatch ? Number(topNMatch[1]) : 3;
    const asc = /(lowest|worst)/.test(q);
    const ranked = rankCompanies(list, metric, asc ? "asc" : "desc");
    if (!ranked.length) return { answer: `No ${metric.toUpperCase()} values available for ranking.` };
    if (/(highest|best company)/.test(q)) {
      return { answer: `Highest ${metric.toUpperCase()}: ${ranked[0].company.displayName} (${ranked[0].value}).` };
    }
    if (/(lowest|worst)/.test(q)) {
      return { answer: `Lowest ${metric.toUpperCase()}: ${ranked[0].company.displayName} (${ranked[0].value}).` };
    }
    const slice = ranked.slice(0, topN).map((x, i) => `${i + 1}. ${x.company.displayName} (${x.value})`).join("; ");
    return { answer: `Top ${Math.min(topN, ranked.length)} by ${metric.toUpperCase()}: ${slice}.` };
  }

  if (/(growth)/.test(q) && mentioned.length) {
    return { answer: `Growth analysis needs multi-period data. I currently have year=${mentioned[0].year || "unknown"} for ${mentioned[0].displayName}. Upload more years for trend comparison.` };
  }

  return { answer: "Supported queries: highest revenue/AUM, top N ranking, compare A vs B, profitable/loss-making, and best/worst by metric." };
}

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const workbook = loadWorkbookFromBufferOrDisk(req.file?.buffer);
    const records = parseWorkbook(workbook);
    rebuildState(records);
    res.json({
      message: "Data parsed successfully.",
      count: Object.keys(state.companies).length,
      sourceFile: state.sourceFile,
      companies: getCompanyList(),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/companies", (_req, res) => {
  res.json({ count: Object.keys(state.companies).length, companies: getCompanyList(), peerGroups: PEER_GROUPS });
});

app.post("/ask", (req, res) => {
  res.json(answerQuestion(req.body?.question));
});

app.post("/admin/company-name", (req, res) => {
  const canonicalName = canonicalizeCompanyName(req.body?.canonicalName);
  const displayName = String(req.body?.displayName || "").trim();
  const company = state.companies[canonicalName];
  if (!company) return res.status(404).json({ error: "Company not found" });
  if (!displayName) return res.status(400).json({ error: "displayName is required" });
  company.displayName = displayName;
  return res.json({ ok: true, company });
});

app.post("/admin/alias", (req, res) => {
  const canonicalName = canonicalizeCompanyName(req.body?.canonicalName);
  const alias = String(req.body?.alias || "").trim();
  if (!state.companies[canonicalName]) return res.status(404).json({ error: "Company not found" });
  if (!alias) return res.status(400).json({ error: "alias is required" });

  const key = normalizeKey(alias);
  state.aliases[key] = canonicalName;
  if (!state.companies[canonicalName].aliases.includes(key)) state.companies[canonicalName].aliases.push(key);
  res.json({ ok: true, canonicalName, aliasKey: key });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
