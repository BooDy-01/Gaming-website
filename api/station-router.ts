import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { stations, sessions, addons, inventory, inventoryLogs, revenueDaily } from "@db/schema";
import { eq, sql } from "drizzle-orm";

export const stationRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(stations).orderBy(stations.id);
  }),

  getById: publicQuery
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(stations).where(eq(stations.id, input));
      return result[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["pc", "ps5", "xbox", "vr"]),
        hourlyRate: z.string().or(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const rate = typeof input.hourlyRate === "string" ? input.hourlyRate : String(input.hourlyRate || 30);
      const result = await db.insert(stations).values({
        name: input.name,
        type: input.type,
        hourlyRate: rate,
        status: "vacant",
      }).$returningId();
      return { id: Number(result[0].id) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        hourlyRate: z.string().or(z.number()).optional(),
        status: z.enum(["vacant", "active", "paused", "maintenance"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: Record<string, unknown> = {};
      if (input.name) updates.name = input.name;
      if (input.hourlyRate !== undefined) updates.hourlyRate = String(input.hourlyRate);
      if (input.status) updates.status = input.status;
      await db.update(stations).set(updates).where(eq(stations.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(stations).where(eq(stations.id, input));
      return { success: true };
    }),

  startSession: publicQuery
    .input(
      z.object({
        stationId: z.number(),
        userName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const station = await db.select().from(stations).where(eq(stations.id, input.stationId));
      if (station.length === 0) throw new Error("Station not found");
      if (station[0].status !== "vacant") throw new Error("Station is not vacant");

      const now = new Date();
      const result = await db.insert(sessions).values({
        stationId: input.stationId,
        userName: input.userName,
        startTime: now,
        status: "active",
      }).$returningId();
      const sessionId = Number(result[0].id);

      await db.update(stations).set({
        status: "active",
        currentUser: input.userName,
        currentSessionId: sessionId,
      }).where(eq(stations.id, input.stationId));

      return { sessionId };
    }),

  pauseSession: publicQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      const station = await db.select().from(stations).where(eq(stations.id, input));
      if (station.length === 0) throw new Error("Station not found");
      if (station[0].status !== "active") throw new Error("No active session");

      const sessionId = station[0].currentSessionId;
      if (!sessionId) throw new Error("No active session");

      const session = await db.select().from(sessions).where(eq(sessions.id, sessionId));
      if (session.length === 0) throw new Error("Session not found");

      const startTime = new Date(session[0].startTime);
      const now = new Date();
      const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);

      await db.update(sessions).set({
        duration: elapsedMinutes,
      }).where(eq(sessions.id, sessionId));

      await db.update(stations).set({
        status: "paused",
      }).where(eq(stations.id, input));

      return { success: true };
    }),

  resumeSession: publicQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      const station = await db.select().from(stations).where(eq(stations.id, input));
      if (station.length === 0) throw new Error("Station not found");
      if (station[0].status !== "paused") throw new Error("No paused session");

      await db.update(stations).set({
        status: "active",
      }).where(eq(stations.id, input));

      return { success: true };
    }),

  endSession: publicQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      const station = await db.select().from(stations).where(eq(stations.id, input));
      if (station.length === 0) throw new Error("Station not found");
      if (station[0].status === "vacant" || station[0].status === "maintenance") {
        throw new Error("No active session");
      }

      const sessionId = station[0].currentSessionId;
      if (!sessionId) throw new Error("No active session");

      const session = await db.select().from(sessions).where(eq(sessions.id, sessionId));
      if (session.length === 0) throw new Error("Session not found");

      const startTime = new Date(session[0].startTime);
      const endTime = new Date();

      let totalMinutes = session[0].duration || 0;
      if (station[0].status === "active") {
        totalMinutes += Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
      }

      const rate = Number(station[0].hourlyRate);
      const gamingCost = (totalMinutes / 60) * rate;
      const addonsCost = Number(session[0].addonsCost || 0);
      const totalCost = gamingCost + addonsCost;

      await db.update(sessions).set({
        endTime,
        duration: totalMinutes,
        gamingCost: gamingCost.toFixed(2),
        totalCost: totalCost.toFixed(2),
        status: "completed",
      }).where(eq(sessions.id, sessionId));

      // Update revenue daily
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existingRevenue = await db.select().from(revenueDaily).where(eq(revenueDaily.date, today));
      if (existingRevenue.length > 0) {
        await db.update(revenueDaily).set({
          gamingRevenue: sql`${revenueDaily.gamingRevenue} + ${gamingCost.toFixed(2)}`,
          addonsRevenue: sql`${revenueDaily.addonsRevenue} + ${addonsCost.toFixed(2)}`,
          totalRevenue: sql`${revenueDaily.totalRevenue} + ${totalCost.toFixed(2)}`,
          sessionCount: sql`${revenueDaily.sessionCount} + 1`,
        }).where(eq(revenueDaily.date, today));
      } else {
        await db.insert(revenueDaily).values({
          date: today,
          gamingRevenue: gamingCost.toFixed(2),
          addonsRevenue: addonsCost.toFixed(2),
          totalRevenue: totalCost.toFixed(2),
          sessionCount: 1,
        }).$returningId();
      }

      await db.update(stations).set({
        status: "vacant",
        currentUser: null,
        currentSessionId: null,
      }).where(eq(stations.id, input));

      return {
        sessionId,
        duration: totalMinutes,
        gamingCost: gamingCost.toFixed(2),
        addonsCost: addonsCost.toFixed(2),
        totalCost: totalCost.toFixed(2),
      };
    }),

  addAddon: publicQuery
    .input(
      z.object({
        stationId: z.number(),
        inventoryItemId: z.number(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const station = await db.select().from(stations).where(eq(stations.id, input.stationId));
      if (station.length === 0) throw new Error("Station not found");
      if (!station[0].currentSessionId) throw new Error("No active session");

      const item = await db.select().from(inventory).where(eq(inventory.id, input.inventoryItemId));
      if (item.length === 0) throw new Error("Item not found");
      if (item[0].stock < input.quantity) throw new Error("Insufficient stock");

      const unitPrice = Number(item[0].price);
      const totalPrice = unitPrice * input.quantity;
      const sessionId = station[0].currentSessionId;

      await db.insert(addons).values({
        sessionId,
        inventoryItemId: input.inventoryItemId,
        quantity: input.quantity,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      }).$returningId();

      // Update inventory stock
      await db.update(inventory).set({
        stock: item[0].stock - input.quantity,
      }).where(eq(inventory.id, input.inventoryItemId));

      // Log the sale
      await db.insert(inventoryLogs).values({
        inventoryId: input.inventoryItemId,
        action: "sale",
        quantity: -input.quantity,
        note: `Sold to session ${sessionId}`,
      }).$returningId();

      // Update session addons cost
      const session = await db.select().from(sessions).where(eq(sessions.id, sessionId));
      if (session.length > 0) {
        const newAddonsCost = Number(session[0].addonsCost || 0) + totalPrice;
        const gamingCost = Number(session[0].gamingCost || 0);
        await db.update(sessions).set({
          addonsCost: newAddonsCost.toFixed(2),
          totalCost: (gamingCost + newAddonsCost).toFixed(2),
        }).where(eq(sessions.id, sessionId));
      }

      return { success: true };
    }),
});
