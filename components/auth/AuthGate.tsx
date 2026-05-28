"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { PUBLIC_SHELL_ROUTES } from "@/lib/routes";

const publicShellRouteSet = new Set<string>(PUBLIC_SHELL_ROUTES);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (publicShellRouteSet.has(pathname)) {
    return children;
  }

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
