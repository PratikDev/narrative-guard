/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as brand from "../brand.js";
import type * as http from "../http.js";
import type * as lib_auditContentTypes from "../lib/auditContentTypes.js";
import type * as lib_auditPrompts from "../lib/auditPrompts.js";
import type * as lib_auditScoring from "../lib/auditScoring.js";
import type * as lib_requireAuth from "../lib/requireAuth.js";
import type * as lib_workspaceAuth from "../lib/workspaceAuth.js";
import type * as maintenance from "../maintenance.js";
import type * as rag from "../rag.js";
import type * as report from "../report.js";
import type * as viewer from "../viewer.js";
import type * as workspace from "../workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  audit: typeof audit;
  auth: typeof auth;
  brand: typeof brand;
  http: typeof http;
  "lib/auditContentTypes": typeof lib_auditContentTypes;
  "lib/auditPrompts": typeof lib_auditPrompts;
  "lib/auditScoring": typeof lib_auditScoring;
  "lib/requireAuth": typeof lib_requireAuth;
  "lib/workspaceAuth": typeof lib_workspaceAuth;
  maintenance: typeof maintenance;
  rag: typeof rag;
  report: typeof report;
  viewer: typeof viewer;
  workspace: typeof workspace;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
};
