"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/shared/LoadingState";

export function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthLoading>
        <div className="p-6">
          <LoadingState label="Loading session" />
        </div>
      </AuthLoading>
      <Unauthenticated>{children}</Unauthenticated>
      <Authenticated>
        <AppShell>{children}</AppShell>
      </Authenticated>
    </>
  );
}
