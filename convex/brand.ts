import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBrand = mutation({
  args: {
    name: v.string(),
    constitution: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("brands", {
      name: args.name.trim(),
      constitution: args.constitution.trim(),
      createdAt: now,
      updatedAt: now,
    });
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

    return args.brandId;
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
