import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { stationRouter } from "./station-router";
import { sessionRouter } from "./session-router";
import { inventoryRouter } from "./inventory-router";
import { revenueRouter } from "./revenue-router";
import { contactRouter } from "./contact-router";
import { jobRouter } from "./job-router";
import { aiRouter } from "./ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  station: stationRouter,
  session: sessionRouter,
  inventory: inventoryRouter,
  revenue: revenueRouter,
  contact: contactRouter,
  job: jobRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
