"use client";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function PendingDraftsCard() {
  const { workspaceId } = useWorkspace();
  const drafts = useQuery(
    api.auditDraft.listDashboardDrafts,
    workspaceId ? { workspaceId } : {}
  );

  if (drafts === undefined || drafts.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Pending drafts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {drafts.map((draft) => (
            <div
              key={draft._id}
              className="grid gap-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <h3 className="truncate font-medium">{draft.title}</h3>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{draft.brandName}</span>
                  <span>{CONTENT_TYPE_LABELS[draft.contentType]}</span>
                  <span>{formatDate(draft.updatedAt)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/audit?draftId=${draft._id}`}>
                  Continue
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
