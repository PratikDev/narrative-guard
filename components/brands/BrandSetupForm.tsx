"use client";

import { useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BrandConstitutionPreview } from "./BrandConstitutionPreview";
import type { Brand } from "@/lib/types";

export function BrandSetupForm({ initialBrand }: { initialBrand: Brand }) {
  const [name, setName] = useState(initialBrand.name);
  const [constitution, setConstitution] = useState(initialBrand.constitution);
  const [savedConstitution, setSavedConstitution] = useState(
    initialBrand.constitution
  );
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  function saveBrand() {
    if (!name.trim() || !constitution.trim()) {
      setState("error");
      return;
    }

    setState("loading");
    window.setTimeout(() => {
      setSavedConstitution(constitution);
      setState("success");
    }, 650);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Brand details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="grid gap-2 text-sm font-medium">
            Brand name
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Brand Constitution
            <Textarea
              value={constitution}
              onChange={(event) => setConstitution(event.target.value)}
              className="min-h-80 resize-y"
            />
          </label>
          <p className="text-sm leading-6 text-muted-foreground">
            Include tone, messaging pillars, banned phrases, approved examples,
            audience notes, and any review rules the team should follow.
          </p>
          <Button onClick={saveBrand} disabled={state === "loading"}>
            <Save className="size-4" />
            {state === "loading" ? "Saving" : "Save brand"}
          </Button>
          {state === "success" ? (
            <Alert className="border-primary/40 bg-primary/10">
              <AlertTitle>Brand saved for this session</AlertTitle>
              <AlertDescription>
                This is a frontend-only mock state. No data has been persisted.
              </AlertDescription>
            </Alert>
          ) : null}
          {state === "error" ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Brand details incomplete</AlertTitle>
              <AlertDescription>
                Add a brand name and constitution before saving.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
      <BrandConstitutionPreview constitution={savedConstitution} />
    </div>
  );
}
