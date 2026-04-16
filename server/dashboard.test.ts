import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("companies router", () => {
  it("lists all companies", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companies = await caller.companies.list();
    expect(Array.isArray(companies)).toBe(true);
    expect(companies.length).toBeGreaterThan(0);
  });

  it("filters companies by wealth_management peer group", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companies = await caller.companies.byPeerGroup({ peerGroup: "wealth_management" });
    expect(Array.isArray(companies)).toBe(true);
    expect(companies.length).toBeGreaterThan(0);
    companies.forEach(c => {
      expect(c.peerGroup).toBe("wealth_management");
    });
  });

  it("filters companies by p2p_lending peer group", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companies = await caller.companies.byPeerGroup({ peerGroup: "p2p_lending" });
    expect(Array.isArray(companies)).toBe(true);
    expect(companies.length).toBeGreaterThan(0);
    companies.forEach(c => {
      expect(c.peerGroup).toBe("p2p_lending");
    });
  });

  it("gets company by id with full data", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companies = await caller.companies.list();
    const firstCompany = companies[0];
    expect(firstCompany).toBeDefined();

    const companyData = await caller.companies.getWithData({ id: firstCompany.id });
    expect(companyData).not.toBeNull();
    expect(companyData!.displayName).toBe(firstCompany.displayName);
    expect(companyData!.metrics).toBeDefined();
    expect(typeof companyData!.metrics).toBe("object");
    expect(companyData!.lastUpdated).toBeDefined();
  });

  it("returns null for non-existent company", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.companies.getWithData({ id: 99999 });
    expect(result).toBeNull();
  });

  it("gets all companies with data for a peer group", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companiesWithData = await caller.companies.getAllWithData({ peerGroup: "wealth_management" });
    expect(Array.isArray(companiesWithData)).toBe(true);
    expect(companiesWithData.length).toBeGreaterThan(0);

    const firstCompany = companiesWithData[0];
    expect(firstCompany.metrics).toBeDefined();
    expect(firstCompany.news).toBeDefined();
    expect(Array.isArray(firstCompany.news)).toBe(true);
  });
});

describe("admin operations", () => {
  it("allows admin to update company display name", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const publicCaller = appRouter.createCaller(createPublicContext());

    const companies = await publicCaller.companies.list();
    const targetCompany = companies[0];

    const originalName = targetCompany.displayName;
    const testName = `${originalName} (Test)`;

    const result = await adminCaller.companies.update({
      id: targetCompany.id,
      displayName: testName,
    });
    expect(result.success).toBe(true);

    // Verify the name changed
    const updated = await publicCaller.companies.getById({ id: targetCompany.id });
    expect(updated).not.toBeNull();
    expect(updated!.displayName).toBe(testName);

    // Restore original name
    await adminCaller.companies.update({
      id: targetCompany.id,
      displayName: originalName,
    });
  });

  it("prevents non-admin from updating companies", async () => {
    const userCaller = appRouter.createCaller(createUserContext());
    await expect(
      userCaller.companies.update({ id: 1, displayName: "Hacked" })
    ).rejects.toThrow();
  });

  it("allows admin to upsert metrics", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const publicCaller = appRouter.createCaller(createPublicContext());

    const companies = await publicCaller.companies.list();
    const targetCompany = companies[0];

    // Get original value to restore later
    const originalMetrics = await publicCaller.metrics.forCompany({ companyId: targetCompany.id });
    const originalRevenue = originalMetrics.find(m => m.metricName === "revenue" && m.period === "FY2025");

    const result = await adminCaller.metrics.upsert({
      companyId: targetCompany.id,
      metricName: "revenue",
      metricValue: "999",
      metricUnit: "INR Cr",
      period: "FY2025",
      source: "manual",
    });
    expect(result.id).toBeDefined();

    // Restore original value if it existed
    if (originalRevenue) {
      await adminCaller.metrics.upsert({
        companyId: targetCompany.id,
        metricName: "revenue",
        metricValue: originalRevenue.metricValue || "45",
        metricUnit: originalRevenue.metricUnit || "INR Cr",
        period: "FY2025",
        source: "manual",
      });
    } else {
      // Clean up test data
      await adminCaller.metrics.upsert({
        companyId: targetCompany.id,
        metricName: "revenue",
        metricValue: "45",
        metricUnit: "INR Cr",
        period: "FY2025",
        source: "manual",
      });
    }
  });

  it("prevents non-admin from upserting metrics", async () => {
    const userCaller = appRouter.createCaller(createUserContext());
    await expect(
      userCaller.metrics.upsert({
        companyId: 1,
        metricName: "revenue",
        metricValue: "100",
      })
    ).rejects.toThrow();
  });
});

describe("metrics router", () => {
  it("returns metrics for a company", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companies = await caller.companies.list();
    const targetCompany = companies[0];

    const metrics = await caller.metrics.forCompany({ companyId: targetCompany.id });
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBeGreaterThan(0);

    const firstMetric = metrics[0];
    expect(firstMetric.metricName).toBeDefined();
    expect(firstMetric.metricValue).toBeDefined();
    expect(firstMetric.source).toBeDefined();
  });
});

describe("news router", () => {
  it("returns news for a company", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companies = await caller.companies.list();

    // Find a company that should have news (1 Finance)
    const targetCompany = companies.find(c => c.displayName.includes("1 Finance"));
    expect(targetCompany).toBeDefined();

    const news = await caller.news.forCompany({ companyId: targetCompany!.id, limit: 5 });
    expect(Array.isArray(news)).toBe(true);
    expect(news.length).toBeGreaterThan(0);

    const firstNews = news[0];
    expect(firstNews.headline).toBeDefined();
    expect(firstNews.source).toBeDefined();
    expect(firstNews.sourceUrl).toBeDefined();
  });
});

describe("insights router", () => {
  it("returns insights list (may be empty)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const insights = await caller.insights.list({ peerGroup: "wealth_management" });
    expect(Array.isArray(insights)).toBe(true);
  });
});

describe("data integrity", () => {
  it("all companies have required fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companies = await caller.companies.list();

    for (const company of companies) {
      expect(company.name).toBeDefined();
      expect(company.displayName).toBeDefined();
      expect(company.peerGroup).toBeDefined();
      expect(["wealth_management", "p2p_lending"]).toContain(company.peerGroup);
    }
  });

  it("1 Finance appears in both peer groups", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const wmCompanies = await caller.companies.byPeerGroup({ peerGroup: "wealth_management" });
    const p2pCompanies = await caller.companies.byPeerGroup({ peerGroup: "p2p_lending" });

    const wmHas1Finance = wmCompanies.some(c => c.displayName === "1 Finance");
    const p2pHas1Finance = p2pCompanies.some(c => c.displayName === "1 Finance");

    expect(wmHas1Finance).toBe(true);
    expect(p2pHas1Finance).toBe(true);
  });

  it("metrics have valid source tags", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const companies = await caller.companies.list();
    const metrics = await caller.metrics.forCompany({ companyId: companies[0].id });

    const validSources = ["manual", "parsed_pdf", "parsed_excel", "news", "uploaded_file"];
    for (const metric of metrics) {
      expect(validSources).toContain(metric.source);
    }
  });

  it("company display name aliasing propagates correctly", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const publicCaller = appRouter.createCaller(createPublicContext());

    const companies = await publicCaller.companies.list();
    const target = companies.find(c => c.name === "lendenclub");
    if (!target) return; // Skip if not found

    const originalName = target.displayName;

    // Update alias
    await adminCaller.companies.update({ id: target.id, displayName: "LenClub" });

    // Verify in list
    const updatedList = await publicCaller.companies.list();
    const updatedCompany = updatedList.find(c => c.id === target.id);
    expect(updatedCompany!.displayName).toBe("LenClub");

    // Verify in getWithData
    const fullData = await publicCaller.companies.getWithData({ id: target.id });
    expect(fullData!.displayName).toBe("LenClub");

    // Verify in getAllWithData
    const allData = await publicCaller.companies.getAllWithData({ peerGroup: "p2p_lending" });
    const inAll = allData.find(c => c.id === target.id);
    expect(inAll!.displayName).toBe("LenClub");

    // Restore
    await adminCaller.companies.update({ id: target.id, displayName: originalName });
  });
});
