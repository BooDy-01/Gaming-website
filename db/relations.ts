import { relations } from "drizzle-orm";
import { stations, sessions, addons, inventory, inventoryLogs } from "./schema";

export const stationsRelations = relations(stations, ({ one }) => ({
  currentSession: one(sessions, {
    fields: [stations.currentSessionId],
    references: [sessions.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  station: one(stations, {
    fields: [sessions.stationId],
    references: [stations.id],
  }),
  addons: many(addons),
}));

export const addonsRelations = relations(addons, ({ one }) => ({
  session: one(sessions, {
    fields: [addons.sessionId],
    references: [sessions.id],
  }),
  inventoryItem: one(inventory, {
    fields: [addons.inventoryItemId],
    references: [inventory.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ many }) => ({
  logs: many(inventoryLogs),
}));

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
  item: one(inventory, {
    fields: [inventoryLogs.inventoryId],
    references: [inventory.id],
  }),
}));
