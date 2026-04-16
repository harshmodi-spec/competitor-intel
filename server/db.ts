import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companies, companyMetrics, fileUploads, newsItems, insights, type InsertCompany, type InsertCompanyMetric, type InsertNewsItem, type InsertInsight } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { MetricSource } from "../shared/types";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ COMPANIES ============

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(companies.name);
}

export async function getCompaniesByPeerGroup(peerGroup: "wealth_management" | "p2p_lending") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).where(eq(companies.peerGroup, peerGroup)).orderBy(companies.name);
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

export async function createCompany(data: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companies).values(data);
  return result[0].insertId;
}

export async function updateCompany(id: number, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companies).set({ ...data, updatedAt: new Date() }).where(eq(companies.id, id));
}

// ============ METRICS ============

export async function getMetricsForCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyMetrics).where(eq(companyMetrics.companyId, companyId)).orderBy(desc(companyMetrics.updatedAt));
}

export async function getMetricsForCompanies(companyIds: number[]) {
  const db = await getDb();
  if (!db || companyIds.length === 0) return [];
  return db.select().from(companyMetrics).where(inArray(companyMetrics.companyId, companyIds)).orderBy(desc(companyMetrics.updatedAt));
}

export async function upsertMetric(data: { companyId: number; metricName: string; metricValue: string; metricUnit?: string; period?: string; source: MetricSource; sourceDetail?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if metric exists for this company+name+period
  const existing = await db.select().from(companyMetrics)
    .where(and(eq(companyMetrics.companyId, data.companyId), eq(companyMetrics.metricName, data.metricName), data.period ? eq(companyMetrics.period, data.period) : sql`${companyMetrics.period} IS NULL`))
    .limit(1);
  if (existing.length > 0) {
    await db.update(companyMetrics).set({ metricValue: data.metricValue, metricUnit: data.metricUnit || null, source: data.source, sourceDetail: data.sourceDetail || null, updatedAt: new Date() }).where(eq(companyMetrics.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(companyMetrics).values({ companyId: data.companyId, metricName: data.metricName, metricValue: data.metricValue, metricUnit: data.metricUnit || null, period: data.period || null, source: data.source, sourceDetail: data.sourceDetail || null });
    return result[0].insertId;
  }
}

export async function overrideMetric(id: number, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companyMetrics).set({ metricValue: value, isOverridden: true, updatedAt: new Date() }).where(eq(companyMetrics.id, id));
}

// ============ FILE UPLOADS ============

export async function createFileUpload(data: { companyId: number; fileName: string; fileType: "pdf" | "excel"; fileUrl: string; fileKey: string; fileSize?: number; uploadedBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(fileUploads).values(data);
  return result[0].insertId;
}

export async function updateFileUploadStatus(id: number, status: "uploaded" | "parsing" | "parsed" | "failed", parsedData?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fileUploads).set({ status, parsedData: parsedData || null }).where(eq(fileUploads.id, id));
}

export async function getFileUploadsForCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fileUploads).where(eq(fileUploads.companyId, companyId)).orderBy(desc(fileUploads.createdAt));
}

export async function getAllFileUploads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fileUploads).orderBy(desc(fileUploads.createdAt));
}

// ============ NEWS ============

export async function getNewsForCompany(companyId: number, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsItems).where(eq(newsItems.companyId, companyId)).orderBy(desc(newsItems.fetchedAt)).limit(limit);
}

export async function getNewsForCompanies(companyIds: number[]) {
  const db = await getDb();
  if (!db || companyIds.length === 0) return [];
  return db.select().from(newsItems).where(inArray(newsItems.companyId, companyIds)).orderBy(desc(newsItems.fetchedAt));
}

export async function addNewsItem(data: InsertNewsItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check for duplicate by headline+companyId
  const existing = await db.select().from(newsItems)
    .where(and(eq(newsItems.companyId, data.companyId), eq(newsItems.headline, data.headline)))
    .limit(1);
  if (existing.length > 0) return existing[0].id;
  const result = await db.insert(newsItems).values(data);
  return result[0].insertId;
}

export async function deleteNewsForCompany(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(newsItems).where(eq(newsItems.companyId, companyId));
}

// ============ INSIGHTS ============

export async function getInsights(peerGroup?: "wealth_management" | "p2p_lending") {
  const db = await getDb();
  if (!db) return [];
  if (peerGroup) {
    return db.select().from(insights).where(eq(insights.peerGroup, peerGroup)).orderBy(desc(insights.generatedAt));
  }
  return db.select().from(insights).orderBy(desc(insights.generatedAt));
}

export async function clearInsights(peerGroup: "wealth_management" | "p2p_lending" | "all") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(insights).where(eq(insights.peerGroup, peerGroup));
}

export async function addInsight(data: InsertInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(insights).values(data);
  return result[0].insertId;
}

export async function getFileUploadCount(companyId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(fileUploads).where(eq(fileUploads.companyId, companyId));
  return result[0]?.count ?? 0;
}
