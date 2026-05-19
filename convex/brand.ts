import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { replaceConstitutionChunksForBrand } from "./lib/constitutionChunking";

export const createBrand = mutation({
  args: {
    name: v.string(),
    constitution: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const brandId = await ctx.db.insert("brands", {
      name: args.name.trim(),
      constitution: args.constitution.trim(),
      createdAt: now,
      updatedAt: now,
    });

    const chunkResult = await replaceConstitutionChunksForBrand(
      ctx,
      brandId,
      args.constitution
    );

    return {
      brandId,
      chunkCount: chunkResult.chunkCount,
    };
  },
});

export const updateBrand = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    constitution: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.brandId, {
      name: args.name.trim(),
      constitution: args.constitution.trim(),
      updatedAt: Date.now(),
    });

    const chunkResult = await replaceConstitutionChunksForBrand(
      ctx,
      args.brandId,
      args.constitution
    );

    return {
      brandId: args.brandId,
      chunkCount: chunkResult.chunkCount,
    };
  },
});

export const getBrand = query({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.brandId);
  },
});

export const listBrands = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brands").order("desc").collect();
  },
});
