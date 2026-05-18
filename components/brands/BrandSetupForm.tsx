"use client";

import { useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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

export function BrandSetupForm() {
  const brands = useQuery(api.brand.listBrands);
  const createBrand = useMutation(api.brand.createBrand);
  const [name, setName] = useState("");
  const [constitution, setConstitution] = useState("");
  const [savedConstitution, setSavedConstitution] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  async function saveBrand() {
    if (!name.trim() || !constitution.trim()) {
      setState("error");
      return;
    }

    setState("loading");
    try {
      await createBrand({
        name,
        constitution,
      });
      setSavedConstitution(constitution);
      setState("success");
    } catch {
      setState("error");
    }
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
              <AlertTitle>Brand saved</AlertTitle>
              <AlertDescription>
                The brand constitution has been persisted in Convex.
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
      <div className="space-y-4">
        <BrandConstitutionPreview constitution={savedConstitution} />
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Saved brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brands === undefined ? (
              <p className="text-sm text-muted-foreground">Loading brands...</p>
            ) : brands.length ? (
              brands.map((brand) => (
                <div key={brand._id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{brand.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {brand.constitution}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No brands have been saved yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
