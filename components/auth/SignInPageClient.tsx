"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogIn, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSafeInternalRedirectPath } from "@/lib/routes";

export function SignInPageClient() {
  const searchParams = useSearchParams();
  const { signIn } = useAuthActions();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const redirectTo = getSafeInternalRedirectPath(searchParams.get("next"));

  async function signInWithGoogle() {
    setState("loading");
    try {
      await signIn("google", { redirectTo });
    } catch {
      setState("error");
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <CardTitle className="text-xl">Sign in to NarrativeGuard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            className="w-full"
            size="lg"
            onClick={signInWithGoogle}
            disabled={state === "loading"}
          >
            <LogIn className="size-4" />
            {state === "loading" ? "Opening Google" : "Continue with Google"}
          </Button>
          {state === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>
                The Google sign-in flow could not be started. Check the Convex
                Auth environment variables and try again.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
