import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { revenueDaily } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const revenueRouter = createRouter({
  today: publicQuery.query(async () => {
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await db.select().from(revenueDaily).where(eq(revenueDaily.date, today));
    if (result.length > 0) {
      return {
        gamingRevenue: Number(result[0].gamingRevenue),
        addonsRevenue: Number(result[0].addonsRevenue),
        totalRevenue: Number(result[0].totalRevenue),
        sessionCount: result[0].sessionCount || 0,
      };
    }
    return { gamingRevenue: 0, addonsRevenue: 0, totalRevenue: 0, sessionCount: 0 };
  }),

  weekly: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const result = await db
      .select()
      .from(revenueDaily)
      .where(gte(revenueDaily.date, sevenDaysAgo))
      .orderBy(desc(revenueDaily.date));

    const totals = result.reduce(
      (acc, r) => ({
        gamingRevenue: acc.gamingRevenue + Number(r.gamingRevenue),
        addonsRevenue: acc.addonsRevenue + Number(r.addonsRevenue),
        totalRevenue: acc.totalRevenue + Number(r.totalRevenue),
        sessionCount: acc.sessionCount + (r.sessionCount || 0),
      }),
      { gamingRevenue: 0, addonsRevenue: 0, totalRevenue: 0, sessionCount: 0 }
    );

    return totals;
  }),

  monthly: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const months: { month: string; gamingRevenue: number; addonsRevenue: number; totalRevenue: number; sessionCount: number }[] = [];

    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const result = await db
        .select()
        .from(revenueDaily)
        .where(and(gte(revenueDaily.date, d), lte(revenueDaily.date, endMonth)));

      const totals = result.reduce(
        (acc, r) => ({
          gamingRevenue: acc.gamingRevenue + Number(r.gamingRevenue),
          addonsRevenue: acc.addonsRevenue + Number(r.addonsRevenue),
          totalRevenue: acc.totalRevenue + Number(r.totalRevenue),
          sessionCount: acc.sessionCount + (r.sessionCount || 0),
        }),
        { gamingRevenue: 0, addonsRevenue: 0, totalRevenue: 0, sessionCount: 0 }
      );

      months.push({
        month: d.toLocaleString("en", { month: "short", year: "numeric" }),
        ...totals,
      });
    }

    return months;
  }),

  dailyChart: publicQuery
    .input(z.number().default(7))
    .query(async ({ input }) => {
      const db = getDb();
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const startDate = new Date(now.getTime() - input * 24 * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(revenueDaily)
        .where(gte(revenueDaily.date, startDate))
        .orderBy(revenueDaily.date);

      return result.map((r) => ({
        date: r.date instanceof Date ? r.date.toISOString().split("T")[0] : String(r.date),
        gaming: Number(r.gamingRevenue),
        addons: Number(r.addonsRevenue),
        total: Number(r.totalRevenue),
      }));
    }),

  breakdown: publicQuery
    .input(
      z.object({
        period: z.enum(["today", "week", "month"]).default("today"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      let startDate: Date;

      if (input.period === "today") {
        startDate = now;
      } else if (input.period === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const result = await db
        .select()
        .from(revenueDaily)
        .where(gte(revenueDaily.date, startDate));

      const totals = result.reduce(
        (acc, r) => ({
          gamingRevenue: acc.gamingRevenue + Number(r.gamingRevenue),
          addonsRevenue: acc.addonsRevenue + Number(r.addonsRevenue),
          totalRevenue: acc.totalRevenue + Number(r.totalRevenue),
          sessionCount: acc.sessionCount + (r.sessionCount || 0),
        }),
        { gamingRevenue: 0, addonsRevenue: 0, totalRevenue: 0, sessionCount: 0 }
      );

      return totals;
    }),
});
