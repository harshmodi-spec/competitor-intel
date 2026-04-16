import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import type { ParsedFinancialData, MetricSource } from "../shared/types";
import { METRIC_NAMES } from "../shared/types";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  companies: router({
    list: publicProcedure.query(async () => {
      return db.getAllCompanies();
    }),

    byPeerGroup: publicProcedure
      .input(z.object({ peerGroup: z.enum(["wealth_management", "p2p_lending"]) }))
      .query(async ({ input }) => {
        return db.getCompaniesByPeerGroup(input.peerGroup);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCompanyById(input.id);
      }),

    getWithData: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const company = await db.getCompanyById(input.id);
        if (!company) return null;
        const metrics = await db.getMetricsForCompany(input.id);
        const news = await db.getNewsForCompany(input.id, 5);
        const fileCount = await db.getFileUploadCount(input.id);

        const metricsMap: Record<string, { value: string; unit: string; period: string; source: MetricSource; updatedAt: string }> = {};
        for (const m of metrics) {
          if (!metricsMap[m.metricName]) {
            metricsMap[m.metricName] = {
              value: m.metricValue || "N/A",
              unit: m.metricUnit || "",
              period: m.period || "",
              source: m.source,
              updatedAt: m.updatedAt.toISOString(),
            };
          }
        }

        return {
          ...company,
          productOfferings: (company.productOfferings as string[]) || [],
          tags: (company.tags as string[]) || [],
          metrics: metricsMap,
          news: news.map(n => ({ ...n, publishedAt: n.publishedAt?.toISOString() || null })),
          lastUpdated: company.updatedAt.toISOString(),
          fileCount,
        };
      }),

    getAllWithData: publicProcedure
      .input(z.object({ peerGroup: z.enum(["wealth_management", "p2p_lending"]).optional() }))
      .query(async ({ input }) => {
        const allCompanies = input.peerGroup
          ? await db.getCompaniesByPeerGroup(input.peerGroup)
          : await db.getAllCompanies();

        if (allCompanies.length === 0) return [];

        const companyIds = allCompanies.map(c => c.id);
        const allMetrics = await db.getMetricsForCompanies(companyIds);
        const allNews = await db.getNewsForCompanies(companyIds);

        return allCompanies.map(company => {
          const companyMetrics = allMetrics.filter(m => m.companyId === company.id);
          const companyNews = allNews.filter(n => n.companyId === company.id).slice(0, 5);

          const metricsMap: Record<string, { value: string; unit: string; period: string; source: MetricSource; updatedAt: string }> = {};
          for (const m of companyMetrics) {
            if (!metricsMap[m.metricName]) {
              metricsMap[m.metricName] = {
                value: m.metricValue || "N/A",
                unit: m.metricUnit || "",
                period: m.period || "",
                source: m.source,
                updatedAt: m.updatedAt.toISOString(),
              };
            }
          }

          return {
            ...company,
            productOfferings: (company.productOfferings as string[]) || [],
            tags: (company.tags as string[]) || [],
            metrics: metricsMap,
            news: companyNews.map(n => ({ ...n, publishedAt: n.publishedAt?.toISOString() || null })),
            lastUpdated: company.updatedAt.toISOString(),
            fileCount: 0,
          };
        });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        displayName: z.string().optional(),
        category: z.string().optional(),
        logoUrl: z.string().optional(),
        productOfferings: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCompany(id, data as any);
        return { success: true };
      }),
  }),

  metrics: router({
    forCompany: publicProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getMetricsForCompany(input.companyId);
      }),

    upsert: adminProcedure
      .input(z.object({
        companyId: z.number(),
        metricName: z.string(),
        metricValue: z.string(),
        metricUnit: z.string().optional(),
        period: z.string().optional(),
        source: z.enum(["manual", "parsed_pdf", "parsed_excel", "news", "uploaded_file"]).default("manual"),
        sourceDetail: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.upsertMetric(input);
        return { id };
      }),

    override: adminProcedure
      .input(z.object({ id: z.number(), value: z.string() }))
      .mutation(async ({ input }) => {
        await db.overrideMetric(input.id, input.value);
        return { success: true };
      }),
  }),

  files: router({
    upload: adminProcedure
      .input(z.object({
        companyId: z.number(),
        fileName: z.string(),
        fileType: z.enum(["pdf", "excel"]),
        fileBase64: z.string(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const ext = input.fileType === "pdf" ? "pdf" : "xlsx";
        const contentType = input.fileType === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const fileKey = `uploads/${input.companyId}/${nanoid()}.${ext}`;

        const { url } = await storagePut(fileKey, buffer, contentType);

        const uploadId = await db.createFileUpload({
          companyId: input.companyId,
          fileName: input.fileName,
          fileType: input.fileType,
          fileUrl: url,
          fileKey,
          fileSize: input.fileSize,
          uploadedBy: ctx.user.id,
        });

        // Start AI parsing in background
        parseFileInBackground(uploadId, input.companyId, url, input.fileType, input.fileName).catch(err => {
          console.error("[AI Parse] Background parsing failed:", err);
        });

        return { uploadId, url };
      }),

    forCompany: publicProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getFileUploadsForCompany(input.companyId);
      }),

    all: adminProcedure.query(async () => {
      return db.getAllFileUploads();
    }),
  }),

  news: router({
    forCompany: publicProcedure
      .input(z.object({ companyId: z.number(), limit: z.number().default(5) }))
      .query(async ({ input }) => {
        return db.getNewsForCompany(input.companyId, input.limit);
      }),

    refresh: adminProcedure
      .input(z.object({ companyId: z.number() }))
      .mutation(async ({ input }) => {
        const company = await db.getCompanyById(input.companyId);
        if (!company) throw new Error("Company not found");
        await fetchNewsForCompany(company.id, company.displayName);
        return { success: true };
      }),

    refreshAll: adminProcedure.mutation(async () => {
      const allCompanies = await db.getAllCompanies();
      for (const company of allCompanies) {
        try {
          await fetchNewsForCompany(company.id, company.displayName);
        } catch (err) {
          console.error(`[News] Failed to fetch news for ${company.displayName}:`, err);
        }
      }
      return { success: true };
    }),
  }),

  insights: router({
    list: publicProcedure
      .input(z.object({ peerGroup: z.enum(["wealth_management", "p2p_lending"]).optional() }))
      .query(async ({ input }) => {
        return db.getInsights(input.peerGroup);
      }),

    generate: adminProcedure
      .input(z.object({ peerGroup: z.enum(["wealth_management", "p2p_lending"]) }))
      .mutation(async ({ input }) => {
        await generateInsights(input.peerGroup);
        return { success: true };
      }),
  }),

  ai: router({
    query: protectedProcedure
      .input(z.object({ question: z.string(), companyIds: z.array(z.number()).optional() }))
      .mutation(async ({ input }) => {
        const allCompanies = await db.getAllCompanies();
        const targetCompanies = input.companyIds
          ? allCompanies.filter(c => input.companyIds!.includes(c.id))
          : allCompanies;

        const companyIds = targetCompanies.map(c => c.id);
        const allMetrics = await db.getMetricsForCompanies(companyIds);

        const context = targetCompanies.map(c => {
          const metrics = allMetrics.filter(m => m.companyId === c.id);
          return `Company: ${c.displayName} (${c.peerGroup})\nMetrics: ${metrics.map(m => `${m.metricName}: ${m.metricValue} ${m.metricUnit || ''} (${m.period || 'latest'})`).join(', ')}`;
        }).join('\n\n');

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a financial analyst assistant. Answer questions about Indian fintech companies based on the provided data. Be precise, analytical, and cite specific numbers. If data is not available, say so clearly." },
            { role: "user", content: `Context:\n${context}\n\nQuestion: ${input.question}` },
          ],
        });

        return { answer: typeof response.choices[0]?.message?.content === 'string' ? response.choices[0].message.content : 'Unable to generate response.' };
      }),
  }),
});

// ============ BACKGROUND FUNCTIONS ============

async function parseFileInBackground(uploadId: number, companyId: number, fileUrl: string, fileType: "pdf" | "excel", fileName: string) {
  try {
    await db.updateFileUploadStatus(uploadId, "parsing");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a financial data extraction expert. Extract structured financial data from the uploaded document. Return ONLY valid JSON matching this exact schema. All monetary values should be in INR Crores. If a field is not found, omit it.

Schema:
{
  "revenue": { "value": "string (number)", "unit": "INR Cr", "period": "FY2024" },
  "totalExpenses": { "value": "string", "unit": "INR Cr", "period": "FY2024" },
  "ebitda": { "value": "string", "unit": "INR Cr", "period": "FY2024" },
  "pat": { "value": "string", "unit": "INR Cr", "period": "FY2024" },
  "aum": { "value": "string", "unit": "INR Cr", "period": "FY2024" },
  "loanBook": { "value": "string", "unit": "INR Cr", "period": "FY2024" },
  "users": { "value": "string", "unit": "count", "period": "FY2024" },
  "employeeCount": { "value": "string", "unit": "count", "period": "FY2024" },
  "fundsRaised": { "value": "string", "unit": "INR Cr", "period": "cumulative" },
  "valuation": { "value": "string", "unit": "INR Cr", "period": "latest" },
  "reportingPeriod": "FY2024"
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Extract financial data from this ${fileType === "pdf" ? "PDF" : "Excel"} file named "${fileName}". Return only the JSON object.` },
            { type: "file_url", file_url: { url: fileUrl, mime_type: fileType === "pdf" ? "application/pdf" : undefined } } as any,
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = typeof response.choices[0]?.message?.content === 'string'
      ? response.choices[0].message.content
      : '';

    let parsed: ParsedFinancialData;
    try {
      parsed = JSON.parse(content);
    } catch {
      await db.updateFileUploadStatus(uploadId, "failed", { error: "Failed to parse AI response" });
      return;
    }

    await db.updateFileUploadStatus(uploadId, "parsed", parsed);

    const source: MetricSource = fileType === "pdf" ? "parsed_pdf" : "parsed_excel";
    const sourceDetail = fileName;

    // Save extracted metrics
    const metricMappings: Array<{ key: keyof ParsedFinancialData; name: string }> = [
      { key: "revenue", name: METRIC_NAMES.REVENUE },
      { key: "totalExpenses", name: METRIC_NAMES.TOTAL_EXPENSES },
      { key: "ebitda", name: METRIC_NAMES.EBITDA },
      { key: "pat", name: METRIC_NAMES.PAT },
      { key: "aum", name: METRIC_NAMES.AUM },
      { key: "loanBook", name: METRIC_NAMES.LOAN_BOOK },
      { key: "users", name: METRIC_NAMES.USERS },
      { key: "employeeCount", name: METRIC_NAMES.EMPLOYEE_COUNT },
      { key: "fundsRaised", name: METRIC_NAMES.FUNDS_RAISED },
      { key: "valuation", name: METRIC_NAMES.VALUATION },
    ];

    for (const mapping of metricMappings) {
      const data = parsed[mapping.key];
      if (data && typeof data === 'object' && 'value' in data && data.value) {
        await db.upsertMetric({
          companyId,
          metricName: mapping.name,
          metricValue: data.value,
          metricUnit: data.unit,
          period: data.period,
          source,
          sourceDetail,
        });
      }
    }
  } catch (error) {
    console.error("[AI Parse] Error:", error);
    await db.updateFileUploadStatus(uploadId, "failed", { error: String(error) });
  }
}

async function fetchNewsForCompany(companyId: number, companyName: string) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a financial news researcher. Find the latest 5 credible news items about the given Indian fintech company. Only include news from credible sources: Economic Times, Business Standard, Mint, Financial Express, Moneycontrol, Inc42, Entrackr, YourStory, VCCircle, or Tracxn.

Return ONLY valid JSON array with this schema:
[{
  "headline": "string",
  "summary": "1-2 sentence summary",
  "source": "Publication name",
  "sourceUrl": "https://full-url-to-article",
  "publishedAt": "2024-01-15T00:00:00Z"
}]

Rules:
- Only credible financial/business sources
- No duplicate headlines
- No vague or generic headlines
- Each must have a real, clickable URL
- Maximum 5 items, sorted by date descending`
        },
        {
          role: "user",
          content: `Find the latest 5 credible news items about "${companyName}" (Indian fintech company). Return only the JSON array.`
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = typeof response.choices[0]?.message?.content === 'string'
      ? response.choices[0].message.content
      : '[]';

    let newsArray: any[];
    try {
      const parsed = JSON.parse(content);
      newsArray = Array.isArray(parsed) ? parsed : (parsed.news || parsed.items || parsed.articles || []);
    } catch {
      console.error("[News] Failed to parse AI response for", companyName);
      return;
    }

    for (const item of newsArray.slice(0, 5)) {
      if (item.headline && item.source && item.sourceUrl) {
        await db.addNewsItem({
          companyId,
          headline: item.headline,
          summary: item.summary || null,
          source: item.source,
          sourceUrl: item.sourceUrl,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        });
      }
    }
  } catch (error) {
    console.error("[News] Error fetching news for", companyName, error);
  }
}

async function generateInsights(peerGroup: "wealth_management" | "p2p_lending") {
  const companies = await db.getCompaniesByPeerGroup(peerGroup);
  if (companies.length === 0) return;

  const companyIds = companies.map(c => c.id);
  const allMetrics = await db.getMetricsForCompanies(companyIds);

  const context = companies.map(c => {
    const metrics = allMetrics.filter(m => m.companyId === c.id);
    return `${c.displayName}: ${metrics.map(m => `${m.metricName}=${m.metricValue} ${m.metricUnit || ''}`).join(', ')}`;
  }).join('\n');

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a senior financial analyst. Generate sharp, analytical insights comparing the given fintech companies. Each insight must be specific, data-driven, and decision-useful.

Return ONLY valid JSON array:
[{
  "insightType": "highest_revenue|most_funded|fastest_growing|weakest_profitability|highest_valuation_revenue_ratio|strongest_operating_leverage|market_leader|emerging_threat",
  "title": "Short punchy title",
  "description": "2-3 sentence analytical insight with specific numbers",
  "relatedCompanyName": "Company name"
}]

Generate exactly 6 insights covering: highest revenue scale, most funded, fastest growing, weakest profitability, highest valuation vs revenue, strongest operating leverage.`
      },
      {
        role: "user",
        content: `Analyze these ${peerGroup === "wealth_management" ? "Wealth Management" : "P2P Lending"} companies:\n${context}`
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = typeof response.choices[0]?.message?.content === 'string'
    ? response.choices[0].message.content
    : '[]';

  let insightsArray: any[];
  try {
    const parsed = JSON.parse(content);
    insightsArray = Array.isArray(parsed) ? parsed : (parsed.insights || parsed.items || []);
  } catch {
    return;
  }

  await db.clearInsights(peerGroup);

  for (const item of insightsArray) {
    const relatedCompany = companies.find(c => c.displayName === item.relatedCompanyName);
    await db.addInsight({
      peerGroup,
      insightType: item.insightType || "general",
      title: item.title || "Insight",
      description: item.description || "",
      relatedCompanyId: relatedCompany?.id || null,
    });
  }
}

export type AppRouter = typeof appRouter;
