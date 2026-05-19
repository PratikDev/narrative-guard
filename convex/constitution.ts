import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { replaceConstitutionChunksForBrand } from "./lib/constitutionChunking";

export const replaceConstitutionChunks = internalMutation({
  args: {
    brandId: v.id("brands"),
    constitution: v.string(),
  },
  handler: async (ctx, args) => {
    return await replaceConstitutionChunksForBrand(
      ctx,
      args.brandId,
      args.constitution
    );
  },
});

export const listConstitutionChunks = query({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("constitutionChunks")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
  },
});
