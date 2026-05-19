"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConstitutionChunksPreview({
  brand,
}: {
  brand: Doc<"brands"> | null;
}) {
  const chunks = useQuery(
    api.constitution.listConstitutionChunks,
    brand ? { brandId: brand._id } : "skip"
  );

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Constitution chunks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!brand ? (
          <p className="text-sm text-muted-foreground">
            Save a brand to see generated constitution chunks.
          </p>
        ) : chunks === undefined ? (
          <p className="text-sm text-muted-foreground">Loading chunks...</p>
        ) : chunks.length ? (
          <>
            <p className="text-sm text-muted-foreground">
              {chunks.length} chunks generated for {brand.name}.
            </p>
            <div className="space-y-2">
              {chunks.slice(0, 3).map((chunk) => (
                <div key={chunk._id} className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Chunk {chunk.chunkIndex + 1}
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No chunks are stored for this brand.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
