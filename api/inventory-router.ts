import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { inventory, inventoryLogs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const inventoryRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(inventory).orderBy(inventory.id);
  }),

  getById: publicQuery
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(inventory).where(eq(inventory.id, input));
      return result[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        category: z.enum(["snack", "drink", "other"]),
        price: z.number().positive(),
        stock: z.number().int().min(0).default(0),
        lowStockThreshold: z.number().int().min(0).default(5),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(inventory).values({
        name: input.name,
        category: input.category,
        price: input.price.toFixed(2),
        stock: input.stock,
        lowStockThreshold: input.lowStockThreshold,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.enum(["snack", "drink", "other"]).optional(),
        price: z.number().positive().optional(),
        lowStockThreshold: z.number().int().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: Record<string, unknown> = {};
      if (input.name) updates.name = input.name;
      if (input.category) updates.category = input.category;
      if (input.price !== undefined) updates.price = input.price.toFixed(2);
      if (input.lowStockThreshold !== undefined) updates.lowStockThreshold = input.lowStockThreshold;
      await db.update(inventory).set(updates).where(eq(inventory.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(inventory).where(eq(inventory.id, input));
      return { success: true };
    }),

  restock: adminQuery
    .input(
      z.object({
        id: z.number(),
        quantity: z.number().int().positive(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const item = await db.select().from(inventory).where(eq(inventory.id, input.id));
      if (item.length === 0) throw new Error("Item not found");

      const newStock = item[0].stock + input.quantity;
      await db.update(inventory).set({ stock: newStock }).where(eq(inventory.id, input.id));

      await db.insert(inventoryLogs).values({
        inventoryId: input.id,
        action: "restock",
        quantity: input.quantity,
        note: input.note || `Restocked ${input.quantity} units`,
      });

      return { success: true, newStock };
    }),

  getLogs: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(inventoryLogs).orderBy(desc(inventoryLogs.createdAt)).limit(50);
  }),
});
