"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { ContentType } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import { FileUp, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type EditableAuditDraft = {
  _id: Id<"auditDrafts">;
  brandId: Id<"brands">;
  title: string;
  contentType: ContentType;
  content: string;
  updatedAt: number;
  brandName: string;
  creator: {
    id: Id<"users">;
    name: string | null;
    email: string | null;
  };
};

type DraftsPanelProps = {
  workspaceId?: Id<"workspaces">;
  activeDraftId: Id<"auditDrafts"> | null;
  onLoadDraft: (draft: EditableAuditDraft) => void;
};

export function DraftsPanel({
  workspaceId,
  activeDraftId,
  onLoadDraft,
}: DraftsPanelProps) {
  const router = useRouter();
  const drafts = useQuery(
    api.auditDraft.listWorkspaceDrafts,
    workspaceId ? { workspaceId } : {}
  );
  const runDraftAudit = useMutation(api.auditDraft.runDraftAudit);
  const discardDraft = useMutation(api.auditDraft.discardDraft);
  const [busyDraftId, setBusyDraftId] = useState<Id<"auditDrafts"> | null>(null);

  async function handleRunDraft(draftId: Id<"auditDrafts">) {
    setBusyDraftId(draftId);

    try {
      const result = await runDraftAudit({ draftId });
      toast.success("Audit started from draft");
      router.push(`/reports/${result.reportId}`);
    } catch (error) {
      toast.error("Action failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusyDraftId(null);
    }
  }

  async function handleDiscardDraft(draftId: Id<"auditDrafts">) {
    setBusyDraftId(draftId);

    try {
      await discardDraft({ draftId });
      toast.success("Draft discarded");
    } catch (error) {
      toast.error("Action failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusyDraftId(null);
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Drafts</CardTitle>
      </CardHeader>
      <CardContent>
        {drafts === undefined ? (
          <div className="rounded-lg border px-3 py-4 text-sm text-muted-foreground">
            Loading drafts...
          </div>
        ) : drafts.length ? (
          <div className="space-y-3">
            {drafts.map((draft) => {
              const creatorLabel = draft.creator.name ?? draft.creator.email ?? "Team member";
              const isBusy = busyDraftId === draft._id;
              const isActive = activeDraftId === draft._id;

              return (
                <div
                  key={draft._id}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium">
                          {draft.title}
                        </h3>
                        {isActive ? (
                          <Badge variant="secondary">Editing draft</Badge>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{draft.brandName}</span>
                        <span>{CONTENT_TYPE_LABELS[draft.contentType]}</span>
                        <span>{formatDate(draft.updatedAt)}</span>
                      </div>
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        {creatorLabel}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onLoadDraft(draft)}
                    >
                      <FileUp data-icon="inline-start" />
                      Load
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleRunDraft(draft._id)}
                    >
                      <Play data-icon="inline-start" />
                      Run draft
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={isBusy}
                        >
                          <Trash2 data-icon="inline-start" />
                          Discard
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Discard draft?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the draft from active draft lists.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDiscardDraft(draft._id)}
                          >
                            Discard
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No drafts"
            description="Saved audit drafts will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
}
