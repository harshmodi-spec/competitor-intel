import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";
import puppeteer from "puppeteer";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // PDF export endpoint
  app.get("/api/export-pdf", async (req, res) => {
    try {
      const peerGroup = (req.query.peerGroup as string) || "wealth_management";
      const companies = await db.getCompaniesByPeerGroup(peerGroup as "wealth_management" | "p2p_lending");
      const allMetrics = await db.getMetricsForCompanies(companies.map((c: any) => c.id));
      const metricsMap: Record<number, Record<string, any>> = {};
      allMetrics.forEach((m: any) => {
        if (!metricsMap[m.companyId]) metricsMap[m.companyId] = {};
        metricsMap[m.companyId][m.metricName] = { value: m.metricValue, unit: m.metricUnit, source: m.source, period: m.period };
      });
      const title = peerGroup === "p2p_lending" ? "P2P Lending Peer Benchmarking" : "Wealth Management Peer Benchmarking";
      const dateStr = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
      const metricKeys = ["revenue", "ebitda", "pat", "valuation", "funds_raised", peerGroup === "p2p_lending" ? "loan_book" : "aum", "users", "employee_count"];
      const metricLabels = ["Revenue", "EBITDA", "PAT", "Valuation", "Funds Raised", peerGroup === "p2p_lending" ? "Loan Book" : "AUM", "Users", "Employees"];
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1a1a2e; margin: 40px; }
          h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
          .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #1a1a2e; color: #fff; padding: 8px 10px; text-align: right; font-weight: 600; }
          th:first-child { text-align: left; }
          td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-family: 'Courier New', monospace; }
          td:first-child { text-align: left; font-family: 'Helvetica', sans-serif; font-weight: 500; }
          tr:nth-child(even) { background: #f8f9fa; }
          .footer { margin-top: 24px; font-size: 10px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 8px; }
        </style></head><body>
        <h1>${title}</h1>
        <div class="subtitle">Generated on ${dateStr} | Competitor Intelligence Dashboard</div>
        <table><thead><tr><th>Company</th>`;
      metricLabels.forEach(l => { html += `<th>${l}</th>`; });
      html += `</tr></thead><tbody>`;
      companies.forEach((c: any) => {
        const m = metricsMap[c.id] || {};
        html += `<tr><td>${c.displayName}</td>`;
        metricKeys.forEach(k => {
          const metric = m[k];
          const val = metric?.value || "N/A";
          const unit = metric?.unit || "";
          let display = val === "N/A" ? "—" : val;
          if (display !== "—" && unit && unit !== "count") display = `₹${display} Cr`;
          html += `<td>${display}</td>`;
        });
        html += `</tr>`;
      });
      html += `</tbody></table>
        <div class="footer">Confidential — For internal use only. Source: Competitor Intelligence Dashboard.</div>
        </body></html>`;
      // Generate PDF from HTML using Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });
      await browser.close();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="benchmarking-${peerGroup}-${new Date().toISOString().slice(0,10)}.pdf"`);
      res.send(Buffer.from(pdfBuffer));
    } catch (err) {
      console.error("PDF export error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
