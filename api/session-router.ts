import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sessions, addons, stations } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const sessionRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.enum(["active", "completed", "cancelled"]).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        stationId: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [];

      if (input?.status) {
        filters.push(eq(sessions.status, input.status));
      }
      if (input?.stationId) {
        filters.push(eq(sessions.stationId, input.stationId));
      }
      if (input?.dateFrom) {
        filters.push(gte(sessions.createdAt, new Date(input.dateFrom)));
      }
      if (input?.dateTo) {
        filters.push(lte(sessions.createdAt, new Date(input.dateTo)));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      const results = where
        ? await db.select().from(sessions).where(where).orderBy(desc(sessions.createdAt)).limit(limit).offset(offset)
        : await db.select().from(sessions).orderBy(desc(sessions.createdAt)).limit(limit).offset(offset);

      return results;
    }),

  getById: publicQuery
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      const session = await db.select().from(sessions).where(eq(sessions.id, input));
      if (session.length === 0) return null;

      const sessionAddons = await db.select().from(addons).where(eq(addons.sessionId, input));
      return { ...session[0], addons: sessionAddons };
    }),

  getActive: publicQuery.query(async () => {
    const db = getDb();
    const activeSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.status, "active"))
      .orderBy(desc(sessions.createdAt));

    const stationList = await db.select().from(stations);
    const stationMap = new Map(stationList.map((s) => [s.id, s]));

    return activeSessions.map((s) => ({
      ...s,
      station: stationMap.get(s.stationId),
    }));
  }),
});
