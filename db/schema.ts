import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  bigint,
  date,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// OAuth users (Kimi)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Local username/password users
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// Gaming stations/devices
export const stations = mysqlTable("stations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["pc", "ps5", "xbox", "vr"]).notNull(),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }).notNull().default("30.00"),
  status: mysqlEnum("status", ["vacant", "active", "paused", "maintenance"]).default("vacant").notNull(),
  currentUser: varchar("currentUser", { length: 255 }),
  currentSessionId: bigint("currentSessionId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Station = typeof stations.$inferSelect;
export type InsertStation = typeof stations.$inferInsert;

// Gaming sessions
export const sessions = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  stationId: bigint("stationId", { mode: "number", unsigned: true }).notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  duration: int("duration"),
  gamingCost: decimal("gamingCost", { precision: 10, scale: 2 }).default("0"),
  addonsCost: decimal("addonsCost", { precision: 10, scale: 2 }).default("0"),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// Session addons (snacks/drinks orders)
export const addons = mysqlTable("addons", {
  id: serial("id").primaryKey(),
  sessionId: bigint("sessionId", { mode: "number", unsigned: true }).notNull(),
  inventoryItemId: bigint("inventoryItemId", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull().default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Addon = typeof addons.$inferSelect;
export type InsertAddon = typeof addons.$inferInsert;

// Inventory (snacks & drinks catalog)
export const inventory = mysqlTable("inventory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["snack", "drink", "other"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").notNull().default(0),
  lowStockThreshold: int("lowStockThreshold").notNull().default(5),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = typeof inventory.$inferInsert;

// Inventory logs
export const inventoryLogs = mysqlTable("inventory_logs", {
  id: serial("id").primaryKey(),
  inventoryId: bigint("inventoryId", { mode: "number", unsigned: true }).notNull(),
  action: mysqlEnum("action", ["sale", "restock", "adjustment"]).notNull(),
  quantity: int("quantity").notNull(),
  note: text("note"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryLog = typeof inventoryLogs.$inferSelect;

// Aggregated daily revenue
export const revenueDaily = mysqlTable("revenue_daily", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  gamingRevenue: decimal("gamingRevenue", { precision: 10, scale: 2 }).default("0"),
  addonsRevenue: decimal("addonsRevenue", { precision: 10, scale: 2 }).default("0"),
  totalRevenue: decimal("totalRevenue", { precision: 10, scale: 2 }).default("0"),
  sessionCount: int("sessionCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueDaily = typeof revenueDaily.$inferSelect;

// Contact form submissions
export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// Background jobs queue
export const jobs = mysqlTable("jobs", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  payload: json("payload"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  result: json("result"),
  error: text("error"),
  attempts: int("attempts").default(0),
  maxAttempts: int("maxAttempts").default(3),
  runAt: timestamp("runAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
