import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import { action, internalMutation } from "./_generated/server";

const DELETE_BATCH_SIZE = 100;
const SEED_BATCH_SIZE = 100;
const RAG_NAMESPACE_STATUSES = ["pending", "ready", "replaced"] as const;

const wipeTable = v.union(
  v.literal("auditFindings"),
  v.literal("auditReports"),
  v.literal("brands"),
  v.literal("authVerificationCodes"),
  v.literal("authRefreshTokens"),
  v.literal("authAccounts"),
  v.literal("authSessions"),
  v.literal("authRateLimits"),
  v.literal("users")
);

type WipeTable = (typeof wipeTable)["type"];
type DeleteTablePageHandler = (ctx: MutationCtx) => Promise<number>;

async function deleteAuditFindings(ctx: MutationCtx) {
  const rows = await ctx.db.query("auditFindings").take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

async function deleteAuditReports(ctx: MutationCtx) {
  const rows = await ctx.db.query("auditReports").take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

async function deleteBrands(ctx: MutationCtx) {
  const rows = await ctx.db.query("brands").take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

async function deleteAuthVerificationCodes(ctx: MutationCtx) {
  const rows = await ctx.db
    .query("authVerificationCodes")
    .take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

async function deleteAuthRefreshTokens(ctx: MutationCtx) {
  const rows = await ctx.db.query("authRefreshTokens").take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

async function deleteAuthAccounts(ctx: MutationCtx) {
  const rows = await ctx.db.query("authAccounts").take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

async function deleteAuthSessions(ctx: MutationCtx) {
  const rows = await ctx.db.query("authSessions").take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

async function deleteAuthRateLimits(ctx: MutationCtx) {
  const rows = await ctx.db.query("authRateLimits").take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

async function deleteUsers(ctx: MutationCtx) {
  const rows = await ctx.db.query("users").take(DELETE_BATCH_SIZE);
  for (const row of rows) await ctx.db.delete(row._id);
  return rows.length;
}

const deleteTablePageHandlers: Record<WipeTable, DeleteTablePageHandler> = {
  auditFindings: deleteAuditFindings,
  auditReports: deleteAuditReports,
  brands: deleteBrands,
  authVerificationCodes: deleteAuthVerificationCodes,
  authRefreshTokens: deleteAuthRefreshTokens,
  authAccounts: deleteAuthAccounts,
  authSessions: deleteAuthSessions,
  authRateLimits: deleteAuthRateLimits,
  users: deleteUsers,
};

export const deleteTablePage = internalMutation({
  args: {
    table: wipeTable,
  },
  handler: async (ctx, args) => {
    const deleted = await deleteTablePageHandlers[args.table](ctx);

    return {
      deleted,
      hasMore: deleted === DELETE_BATCH_SIZE,
    };
  },
});

export const seedAuditFindingsIssueTypePage = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("auditFindings").paginate({
      numItems: SEED_BATCH_SIZE,
      cursor: args.cursor,
    });

    for (const row of rows.page) {
      await ctx.db.patch(row._id, { issueType: "mild_style" });
    }

    return {
      patched: rows.page.length,
      cursor: rows.continueCursor,
      isDone: rows.isDone,
    };
  },
});

export const seedAuditFindingsIssueType = action({
  args: {
    confirmation: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    if (process.env.ENABLE_WIPE_ALL_DATA !== "true") {
      throw new Error(
        "Set ENABLE_WIPE_ALL_DATA=true before running maintenance seeds."
      );
    }

    if (!process.env.WIPE_ALL_DATA_TOKEN) {
      throw new Error("Set WIPE_ALL_DATA_TOKEN before running maintenance seeds.");
    }

    if (args.token !== process.env.WIPE_ALL_DATA_TOKEN) {
      throw new Error("Invalid maintenance token.");
    }

    if (args.confirmation !== "SEED_AUDIT_FINDINGS_ISSUE_TYPE") {
      throw new Error(
        'Pass confirmation: "SEED_AUDIT_FINDINGS_ISSUE_TYPE" to seed issue types.'
      );
    }

    let totalPatched = 0;
    let cursor: string | null = null;
    let isDone = false;

    while (!isDone) {
      const result: {
        patched: number;
        cursor: string | null;
        isDone: boolean;
      } = await ctx.runMutation(
        internal.maintenance.seedAuditFindingsIssueTypePage,
        { cursor }
      );
      totalPatched += result.patched;
      cursor = result.cursor;
      isDone = result.isDone;
    }

    return { patched: totalPatched, issueType: "mild_style" };
  },
});

export const wipeAllData = action({
  args: {
    confirmation: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    if (process.env.ENABLE_WIPE_ALL_DATA !== "true") {
      throw new Error("Set ENABLE_WIPE_ALL_DATA=true before wiping data.");
    }

    if (!process.env.WIPE_ALL_DATA_TOKEN) {
      throw new Error("Set WIPE_ALL_DATA_TOKEN before wiping data.");
    }

    if (args.token !== process.env.WIPE_ALL_DATA_TOKEN) {
      throw new Error("Invalid wipe token.");
    }

    if (args.confirmation !== "WIPE_ALL_DATA") {
      throw new Error('Pass confirmation: "WIPE_ALL_DATA" to wipe data.');
    }

    const tableOrder = [
      "auditFindings",
      "auditReports",
      "brands",
      "authVerificationCodes",
      "authRefreshTokens",
      "authAccounts",
      "authSessions",
      "authRateLimits",
      "users",
    ] as const;

    const deletedTables: Record<(typeof tableOrder)[number], number> = {
      auditFindings: 0,
      auditReports: 0,
      brands: 0,
      authVerificationCodes: 0,
      authRefreshTokens: 0,
      authAccounts: 0,
      authSessions: 0,
      authRateLimits: 0,
      users: 0,
    };

    for (const table of tableOrder) {
      let hasMore = true;
      while (hasMore) {
        const result = await ctx.runMutation(
          internal.maintenance.deleteTablePage,
          { table }
        );
        deletedTables[table] += result.deleted;
        hasMore = result.hasMore;
      }
    }

    let deletedRagNamespaces = 0;
    for (const status of RAG_NAMESPACE_STATUSES) {
      let hasMore = true;
      while (hasMore) {
        const namespaces = await ctx.runQuery(components.rag.namespaces.list, {
          status,
          paginationOpts: {
            numItems: 50,
            cursor: null,
          },
        });

        for (const namespace of namespaces.page) {
          await ctx.runAction(components.rag.namespaces.deleteNamespaceSync, {
            namespaceId: namespace.namespaceId,
          });
          deletedRagNamespaces += 1;
        }

        hasMore = !namespaces.isDone || namespaces.page.length > 0;
      }
    }

    return {
      deletedTables,
      deletedRagNamespaces,
    };
  },
});
