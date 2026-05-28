import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import {
  APP_ROUTES,
  PUBLIC_SHELL_ROUTES,
  getSafeInternalRedirectPath,
} from "@/lib/routes";

const isAuthRoute = createRouteMatcher(["/api/auth(.*)"]);
const isSignInPage = createRouteMatcher([APP_ROUTES.signIn]);
const isPublicPage = createRouteMatcher([...PUBLIC_SHELL_ROUTES]);

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isAuthRoute(request)) return undefined;

  const isAuthenticated = await convexAuth.isAuthenticated();

  if (isSignInPage(request)) {
    if (isAuthenticated) {
      return nextjsMiddlewareRedirect(
        request,
        getSafeInternalRedirectPath(request.nextUrl.searchParams.get("next"))
      );
    }

    return undefined;
  }

  if (isPublicPage(request)) return undefined;

  if (!isAuthenticated) {
    const redirectPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    return nextjsMiddlewareRedirect(
      request,
      `/signin?next=${encodeURIComponent(redirectPath)}`
    );
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
