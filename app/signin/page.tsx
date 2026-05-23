import { Suspense } from "react";
import { SignInPageClient } from "@/components/auth/SignInPageClient";
import { LoadingState } from "@/components/shared/LoadingState";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6">
          <LoadingState label="Loading sign in" />
        </main>
      }
    >
      <SignInPageClient />
    </Suspense>
  );
}
