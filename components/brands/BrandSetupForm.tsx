"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Pencil, Save } from "lucide-react";
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
import { BrandRagStatusBadge } from "./BrandRagStatusBadge";
import type { Doc } from "@/convex/_generated/dataModel";

export function BrandSetupForm({ brand }: { brand?: Doc<"brands"> }) {
  const brands = useQuery(api.brand.listBrands);
  const createBrand = useMutation(api.brand.createBrand);
  const updateBrand = useMutation(api.brand.updateBrand);
  const isEditing = Boolean(brand);
  const [name, setName] = useState(brand?.name ?? "");
  const [constitution, setConstitution] = useState(brand?.constitution ?? "");
  const [savedConstitution, setSavedConstitution] = useState(
    brand?.constitution ?? ""
  );
  const [savedBrandId, setSavedBrandId] = useState<Doc<"brands">["_id"] | null>(
    brand?._id ?? null
  );
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const savedBrand =
    brands?.find((brand) => brand._id === savedBrandId) ??
    (brand && brand._id === savedBrandId ? brand : undefined) ??
    null;

  async function saveBrand() {
    if (!name.trim() || !constitution.trim()) {
      setState("error");
      return;
    }

    setState("loading");
    try {
      const result = isEditing && brand
        ? await updateBrand({
            brandId: brand._id,
            name,
            constitution,
          })
        : await createBrand({
            name,
            constitution,
          });
      setSavedBrandId(result.brandId);
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
          <CardTitle>{isEditing ? "Edit brand details" : "Brand details"}</CardTitle>
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
            {state === "loading"
              ? "Saving"
              : isEditing
                ? "Update brand"
                : "Save brand"}
          </Button>
          {state === "success" ? (
            <Alert className="border-primary/40 bg-primary/10">
              <AlertTitle>{isEditing ? "Brand updated" : "Brand saved"}</AlertTitle>
              <AlertDescription>
                The brand constitution has been saved and queued for RAG
                indexing.
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
            <CardTitle>RAG indexing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {savedBrand ? (
              <>
                <BrandRagStatusBadge status={savedBrand.ragStatus} />
                {savedBrand.ragError ? (
                  <p className="text-sm leading-6 text-destructive">
                    {savedBrand.ragError}
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    The audit engine can use this brand once indexing is ready.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Save a brand to start indexing its constitution.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Saved brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brands === undefined ? (
              <p className="text-sm text-muted-foreground">Loading brands...</p>
            ) : brands.length ? (
              brands.map((brand) => (
                <div
                  key={brand._id}
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{brand.name}</p>
                      <BrandRagStatusBadge status={brand.ragStatus} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {brand.constitution}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/setup/${brand._id}`} aria-label={`Edit ${brand.name}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
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
