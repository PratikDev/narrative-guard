"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Play } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BrandSelector } from "@/components/brands/BrandSelector";
import { LoadingState } from "@/components/shared/LoadingState";
import { CONTENT_TYPE_LABELS, CONTENT_TYPES } from "@/lib/constants";
import type { ContentType } from "@/lib/types";
import { AuditResult } from "./AuditResult";

export function AuditForm() {
  const brands = useQuery(api.brand.listBrands);
  const createManualAudit = useMutation(api.audit.createManualAudit);
  const [brandId, setBrandId] = useState<Id<"brands"> | "">("");
  const [currentReportId, setCurrentReportId] =
    useState<Id<"auditReports"> | null>(null);
  const [contentType, setContentType] = useState<ContentType>("generic");
  const [content, setContent] = useState(
    "This campaign helps teams move faster with confident messaging, clearer priorities, and less review friction before launch."
  );
  const [status, setStatus] = useState<"idle" | "processing" | "complete" | "failed">(
    "idle"
  );
  const report = useQuery(
    api.report.getReportWithFindings,
    currentReportId ? { reportId: currentReportId } : "skip"
  );

  const activeBrandId = brandId || brands?.[0]?._id || "";

  async function analyze() {
    if (!activeBrandId || !content.trim()) {
      setStatus("failed");
      setCurrentReportId(null);
      return;
    }

    setStatus("processing");
    setCurrentReportId(null);

    try {
      const result = await createManualAudit({
        brandId: activeBrandId,
        contentType,
        content,
      });
      setCurrentReportId(result.reportId);
      setStatus("complete");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Audit setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="grid gap-2 text-sm font-medium">
            Brand
            {brands === undefined ? (
              <div className="rounded-lg border px-2.5 py-2 text-sm text-muted-foreground">
                Loading brands...
              </div>
            ) : brands.length ? (
              <BrandSelector
                brands={brands}
                value={activeBrandId}
                onValueChange={setBrandId}
              />
            ) : (
              <div className="rounded-lg border border-dashed px-2.5 py-2 text-sm text-muted-foreground">
                Create a brand before running an audit.
              </div>
            )}
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Content type
            <Select
              value={contentType}
              onValueChange={(value) => {
                if (value) setContentType(value as ContentType);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {CONTENT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Content to audit
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-56 resize-y"
              placeholder="Paste the content you plan to publish."
            />
          </label>
          <Button
            onClick={analyze}
            disabled={status === "processing" || brands === undefined}
          >
            <Play className="size-4" />
            Analyze
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {status === "failed" ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Audit needs content</AlertTitle>
            <AlertDescription>
              Select a brand and add text before running the mock analysis.
            </AlertDescription>
          </Alert>
        ) : null}
        {status === "processing" ||
        (status === "complete" && currentReportId && report === undefined) ? (
          <LoadingState label="Analyzing content" />
        ) : null}
        {status === "complete" && report ? (
          <>
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertTitle>Report saved</AlertTitle>
              <AlertDescription>
                The audit report has been persisted in Convex and is available
                in report history.
              </AlertDescription>
            </Alert>
            <AuditResult report={report} />
          </>
        ) : null}
        {status === "idle" ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-8">
            <h2 className="text-sm font-medium">Current report result</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Run an audit to see the coherence score, verdict, flagged
              sentences, reasons, and rewrite suggestion.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
