import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthRoute = createRouteMatcher(["/api/auth(.*)"]);
const isSignInPage = createRouteMatcher(["/signin"]);

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isAuthRoute(request)) return undefined;

  const isAuthenticated = await convexAuth.isAuthenticated();

  if (isSignInPage(request)) {
    if (isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/");
    }

    return undefined;
  }

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
