import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.APP_SECRET || "nexus-gaming-cafe-secret";

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6).max(100),
        displayName: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(localUsers).where(eq(localUsers.username, input.username));
      if (existing.length > 0) {
        throw new Error("Username already taken");
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      const result = await db.insert(localUsers).values({
        username: input.username,
        passwordHash,
        displayName: input.displayName || input.username,
        email: input.email || null,
        role: "user",
      });
      const userId = Number(result[0].insertId);
      const token = jwt.sign({ userId, type: "local" }, JWT_SECRET, { expiresIn: "30d" });
      return { token, userId };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const users = await db.select().from(localUsers).where(eq(localUsers.username, input.username));
      if (users.length === 0) {
        throw new Error("Invalid username or password");
      }
      const user = users[0];
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("Invalid username or password");
      }
      const token = jwt.sign({ userId: user.id, type: "local" }, JWT_SECRET, { expiresIn: "30d" });
      return { token, userId: user.id };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("x-local-auth-token");
    if (!authHeader) return null;
    try {
      const decoded = jwt.verify(authHeader, JWT_SECRET) as { userId: number; type: string };
      if (decoded.type !== "local") return null;
      const db = getDb();
      const users = await db.select().from(localUsers).where(eq(localUsers.id, decoded.userId));
      if (users.length === 0) return null;
      const user = users[0];
      return {
        id: user.id,
        name: user.displayName || user.username,
        email: user.email,
        username: user.username,
        role: user.role,
        authType: "local" as const,
      };
    } catch {
      return null;
    }
  }),
});
