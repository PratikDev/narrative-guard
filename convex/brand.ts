import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import type { EntryId } from "@convex-dev/rag";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAuthUserId } from "./lib/requireAuth";
import {
	resolveWorkspaceForMutation,
	resolveWorkspaceForQuery,
	requireWorkspaceMember,
	requireWorkspaceRole,
} from "./lib/workspaceAuth";
import { BRAND_CONSTITUTION_KEY, brandNamespace, brandRag } from "./rag";

export async function createConstitutionVersion(
  ctx: MutationCtx,
  args: {
    workspaceId: Id<"workspaces">;
    brandId: Id<"brands">;
    userId: Id<"users">;
    constitution: string;
  },
) {
  const latestVersion = await ctx.db
    .query("brandConstitutionVersions")
    .withIndex("by_brand_and_version", (q) => q.eq("brandId", args.brandId))
    .order("desc")
    .first();

  return await ctx.db.insert("brandConstitutionVersions", {
    workspaceId: args.workspaceId,
    brandId: args.brandId,
    userId: args.userId,
    version: latestVersion ? latestVersion.version + 1 : 1,
    constitution: args.constitution,
    createdAt: Date.now(),
  });
}

function formatEditor(user: Doc<"users"> | null) {
  return {
    name: user?.name ?? null,
    email: user?.email ?? null,
  };
}

export const createBrand = mutation({
	args: {
		workspaceId: v.optional(v.id("workspaces")),
		name: v.string(),
		constitution: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const membership = await resolveWorkspaceForMutation(
			ctx,
			userId,
			args.workspaceId,
		);
		if (!["owner", "admin"].includes(membership.role)) {
			throw new Error("You do not have permission to create brands.");
		}

		const now = Date.now();
		const constitution = args.constitution.trim();

		const brandId = await ctx.db.insert("brands", {
			userId,
			workspaceId: membership.workspaceId,
			name: args.name.trim(),
			constitution,
      ragStatus: "indexing",
      createdAt: now,
      updatedAt: now,
    });

    await createConstitutionVersion(ctx, {
      workspaceId: membership.workspaceId,
      brandId,
      userId,
      constitution,
    });

    await ctx.scheduler.runAfter(0, internal.brand.ingestBrandConstitution, {
      brandId,
    });

    return {
      brandId,
    };
  },
});

export const updateBrand = mutation({
	args: {
		workspaceId: v.optional(v.id("workspaces")),
		brandId: v.id("brands"),
		name: v.string(),
		constitution: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const brand = await ctx.db.get(args.brandId);
		if (!brand) {
			throw new Error("Brand not found.");
		}
		if (args.workspaceId && brand.workspaceId !== args.workspaceId) {
			throw new Error("Brand not found.");
		}
		await requireWorkspaceRole(ctx, brand.workspaceId, userId, "admin");

		const constitution = args.constitution.trim();
		const constitutionChanged = brand.constitution !== constitution;

		await ctx.db.patch(args.brandId, {
      name: args.name.trim(),
      constitution,
      ragStatus: "indexing",
      ragError: undefined,
      updatedAt: Date.now(),
    });

    if (constitutionChanged) {
      await createConstitutionVersion(ctx, {
        workspaceId: brand.workspaceId,
        brandId: args.brandId,
        userId,
        constitution,
      });
    }

    await ctx.scheduler.runAfter(0, internal.brand.ingestBrandConstitution, {
      brandId: args.brandId,
    });

    return {
      brandId: args.brandId,
    };
  },
});

export const getBrand = query({
	args: {
		workspaceId: v.optional(v.id("workspaces")),
		brandId: v.id("brands"),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);

		const brand = await ctx.db.get(args.brandId);
		if (!brand) return null;
		if (args.workspaceId && brand.workspaceId !== args.workspaceId) return null;
		await requireWorkspaceMember(ctx, brand.workspaceId, userId);

		return brand;
	},
});

export const listBrands = query({
	args: {
		workspaceId: v.optional(v.id("workspaces")),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuthUserId(ctx);
		const membership = await resolveWorkspaceForQuery(
			ctx,
			userId,
			args.workspaceId,
		);
		if (!membership) return [];

		return await ctx.db
			.query("brands")
			.withIndex("by_workspace", (q) =>
				q.eq("workspaceId", membership.workspaceId),
			)
			.order("desc")
			.collect();
	  },
	});

export const listConstitutionVersions = query({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      throw new Error("Brand not found.");
    }
    await requireWorkspaceMember(ctx, brand.workspaceId, userId);

    const versions = await ctx.db
      .query("brandConstitutionVersions")
      .withIndex("by_brand_and_created", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();

    return await Promise.all(
      versions.map(async (version) => {
        const editor = await ctx.db.get(version.userId);

        return {
          id: version._id,
          version: version.version,
          createdAt: version.createdAt,
          editor: formatEditor(editor),
        };
      }),
    );
  },
});

export const getConstitutionVersion = query({
  args: {
    versionId: v.id("brandConstitutionVersions"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new Error("Constitution version not found.");
    }
    await requireWorkspaceMember(ctx, version.workspaceId, userId);

    const [brand, editor] = await Promise.all([
      ctx.db.get(version.brandId),
      ctx.db.get(version.userId),
    ]);

    return {
      id: version._id,
      version: version.version,
      constitution: version.constitution,
      createdAt: version.createdAt,
      editor: formatEditor(editor),
      brandName: brand?.name ?? "Deleted brand",
    };
  },
});

export const getBrandForIngestion = internalQuery({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.brandId);
  },
});

export const markBrandRagReady = internalMutation({
  args: {
    brandId: v.id("brands"),
    ragEntryId: v.string(),
  },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.brandId);
    if (!brand) return null;

    await ctx.db.patch(args.brandId, {
      ragStatus: "ready",
      ragEntryId: args.ragEntryId,
      ragIndexedAt: Date.now(),
      ragError: undefined,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const markBrandRagFailed = internalMutation({
  args: {
    brandId: v.id("brands"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.brandId);
    if (!brand) return null;

    await ctx.db.patch(args.brandId, {
      ragStatus: "failed",
      ragError: args.error,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const ingestBrandConstitution = internalAction({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const brand = await ctx.runQuery(internal.brand.getBrandForIngestion, {
      brandId: args.brandId,
    });

    if (!brand) return null;

    try {
      const result = await brandRag.add(ctx, {
        namespace: brandNamespace(args.brandId),
        key: BRAND_CONSTITUTION_KEY,
        title: `${brand.name} Brand Constitution`,
        text: brand.constitution,
        metadata: {
          brandId: args.brandId,
          source: "brand_constitution",
        },
      });

      if (result.replacedEntry) {
        await brandRag.delete(ctx, {
          entryId: result.replacedEntry.entryId as EntryId,
        });
      }

      await ctx.runMutation(internal.brand.markBrandRagReady, {
        brandId: args.brandId,
        ragEntryId: result.entryId,
      });
    } catch (error) {
      await ctx.runMutation(internal.brand.markBrandRagFailed, {
        brandId: args.brandId,
        error: error instanceof Error ? error.message : "RAG indexing failed.",
      });
    }

    return null;
  },
});
