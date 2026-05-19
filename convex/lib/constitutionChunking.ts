import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export const CONSTITUTION_CHUNK_SIZE = 1200;
export const CONSTITUTION_CHUNK_OVERLAP = 240;

export function chunkConstitutionText(text: string) {
  const normalized = text.trim().replace(/\s+\n/g, "\n");
  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + CONSTITUTION_CHUNK_SIZE, normalized.length);
    chunks.push(normalized.slice(start, end).trim());

    if (end === normalized.length) break;
    start += CONSTITUTION_CHUNK_SIZE - CONSTITUTION_CHUNK_OVERLAP;
  }

  return chunks.filter(Boolean);
}

export async function replaceConstitutionChunksForBrand(
  ctx: MutationCtx,
  brandId: Id<"brands">,
  constitution: string
) {
  const existingChunks = await ctx.db
    .query("constitutionChunks")
    .withIndex("by_brand", (q) => q.eq("brandId", brandId))
    .collect();

  for (const chunk of existingChunks) {
    await ctx.db.delete(chunk._id);
  }

  const now = Date.now();
  const chunks = chunkConstitutionText(constitution);

  for (const [chunkIndex, text] of chunks.entries()) {
    await ctx.db.insert("constitutionChunks", {
      brandId,
      chunkIndex,
      text,
      createdAt: now,
    });
  }

  return { chunkCount: chunks.length };
}
