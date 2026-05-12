import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { localUsers } from "@db/schema";
import { getDb } from "./queries/connection";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.APP_SECRET || "nexus-gaming-cafe-secret";

export type UnifiedUser = {
  id: number;
  name: string;
  email: string | null;
  avatar: string | null;
  role: "user" | "admin";
  authType: "oauth" | "local";
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  unifiedUser?: UnifiedUser;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth first
  try {
    const user = await authenticateRequest(opts.req.headers);
    if (user) {
      ctx.user = user;
      ctx.unifiedUser = {
        id: user.id,
        name: user.name || "User",
        email: user.email || null,
        avatar: user.avatar || null,
        role: user.role as "user" | "admin",
        authType: "oauth",
      };
      return ctx;
    }
  } catch {
    // OAuth auth failed, try local
  }

  // Try local auth
  try {
    const authHeader = opts.req.headers.get("x-local-auth-token");
    if (authHeader) {
      const decoded = jwt.verify(authHeader, JWT_SECRET) as { userId: number; type: string };
      if (decoded.type === "local") {
        const db = getDb();
        const users = await db.select().from(localUsers).where(eq(localUsers.id, decoded.userId));
        if (users.length > 0) {
          const localUser = users[0];
          ctx.unifiedUser = {
            id: localUser.id,
            name: localUser.displayName || localUser.username,
            email: localUser.email || null,
            avatar: null,
            role: localUser.role as "user" | "admin",
            authType: "local",
          };
        }
      }
    }
  } catch {
    // Local auth failed
  }

  return ctx;
}
