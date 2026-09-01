"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { APP_ROUTES, PUBLIC_SHELL_ROUTES } from "@/lib/routes";

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
      <Unauthenticated>
        <RedirectToHome />
      </Unauthenticated>
      <Authenticated>
        <AppShell>{children}</AppShell>
      </Authenticated>
    </>
  );
}

/**
 * Rendered when a protected route ends up unauthenticated on the client
 * (sign out, expired session). The middleware guards initial loads, but a
 * client-side auth change can tear down providers like WorkspaceProvider
 * while the protected page is still mounted, so send the user home instead
 * of rendering that page without its providers.
 */
function RedirectToHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace(APP_ROUTES.home);
  }, [router]);

  return (
    <div className="p-6">
      <LoadingState label="Redirecting" />
    </div>
  );
}
