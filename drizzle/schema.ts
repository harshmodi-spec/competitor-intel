import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, json, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Companies table
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  peerGroup: mysqlEnum("peerGroup", ["wealth_management", "p2p_lending"]).notNull(),
  category: varchar("category", { length: 100 }).default(""),
  logoUrl: text("logoUrl"),
  productOfferings: json("productOfferings").$type<string[]>(),
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// Company metrics - stores all financial/operational data points
export const companyMetrics = mysqlTable("company_metrics", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  metricName: varchar("metricName", { length: 100 }).notNull(),
  metricValue: text("metricValue"),
  metricUnit: varchar("metricUnit", { length: 50 }),
  period: varchar("period", { length: 50 }),
  source: mysqlEnum("source", ["manual", "parsed_pdf", "parsed_excel", "news", "uploaded_file"]).default("manual").notNull(),
  sourceDetail: text("sourceDetail"),
  isOverridden: boolean("isOverridden").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyMetric = typeof companyMetrics.$inferSelect;
export type InsertCompanyMetric = typeof companyMetrics.$inferInsert;

// File uploads with version history
export const fileUploads = mysqlTable("file_uploads", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileType: mysqlEnum("fileType", ["pdf", "excel"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileSize: int("fileSize"),
  status: mysqlEnum("status", ["uploaded", "parsing", "parsed", "failed"]).default("uploaded").notNull(),
  parsedData: json("parsedData"),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;

// News items per company
export const newsItems = mysqlTable("news_items", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  headline: text("headline").notNull(),
  summary: text("summary"),
  source: varchar("source", { length: 255 }).notNull(),
  sourceUrl: text("sourceUrl").notNull(),
  publishedAt: timestamp("publishedAt"),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
});

export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = typeof newsItems.$inferInsert;

// Auto-generated insights
export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  peerGroup: mysqlEnum("peerGroup", ["wealth_management", "p2p_lending", "all"]).notNull(),
  insightType: varchar("insightType", { length: 100 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  relatedCompanyId: int("relatedCompanyId"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;
