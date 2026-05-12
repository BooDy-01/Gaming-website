import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { jobs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const jobRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        type: z.string().min(1),
        payload: z.record(z.string(), z.unknown()).optional(),
        runAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(jobs).values({
        type: input.type,
        payload: input.payload || {},
        runAt: input.runAt ? new Date(input.runAt) : new Date(),
      }).$returningId();
      return { id: Number(result[0].id) };
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(20);
  }),

  poll: publicQuery
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(jobs).where(eq(jobs.id, input));
      if (result.length === 0) return null;
      return result[0];
    }),
});
