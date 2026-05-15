"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Play } from "lucide-react";
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
import { mockReports } from "@/lib/mock-data";
import { getVerdictForScore } from "@/lib/score";
import type { AuditReport, Brand, ContentType } from "@/lib/types";
import { AuditResult } from "./AuditResult";

export function AuditForm({ brands }: { brands: Brand[] }) {
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [contentType, setContentType] = useState<ContentType>("generic");
  const [content, setContent] = useState(
    "This campaign helps teams move faster with confident messaging, clearer priorities, and less review friction before launch."
  );
  const [status, setStatus] = useState<"idle" | "processing" | "complete" | "failed">(
    "idle"
  );
  const [report, setReport] = useState<AuditReport | null>(null);

  const selectedBrand = brands.find((brand) => brand.id === brandId) ?? brands[0];

  const mockReport = useMemo(() => {
    const matched =
      mockReports.find(
        (item) => item.brandId === brandId && item.contentType === contentType
      ) ?? mockReports.find((item) => item.brandId === brandId) ?? mockReports[0];

    const score = content.toLowerCase().includes("guarantee")
      ? Math.min(matched.score, 62)
      : matched.score;

    return {
      ...matched,
      id: "report-current",
      brandId: selectedBrand?.id ?? matched.brandId,
      brandName: selectedBrand?.name ?? matched.brandName,
      contentType,
      originalContent: content,
      score,
      verdict: getVerdictForScore(score),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [brandId, content, contentType, selectedBrand?.id, selectedBrand?.name]);

  function analyze() {
    if (!brandId || !content.trim()) {
      setStatus("failed");
      setReport(null);
      return;
    }

    setStatus("processing");
    setReport(null);
    window.setTimeout(() => {
      setReport(mockReport);
      setStatus("complete");
    }, 900);
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
            <BrandSelector
              brands={brands}
              value={brandId}
              onValueChange={setBrandId}
            />
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
          <Button onClick={analyze} disabled={status === "processing"}>
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
        {status === "processing" ? <LoadingState label="Analyzing content" /> : null}
        {status === "complete" && report ? (
          <>
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertTitle>Mock report created</AlertTitle>
              <AlertDescription>
                The result below is generated from static demo data for this
                frontend phase.
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
