import manifest from "./openapiContractManifest.json";

// Compile regex patterns for OpenAPI template paths
const compiledRoutes = manifest.map((item) => {
  // Replace {paramName} with regex matching a single path segment: ([^/]+)
  const regexStr = "^" + item.path.replace(/\{[^}]+\}/g, "([^/]+)") + "$";
  return {
    ...item,
    regex: new RegExp(regexStr),
  };
});

/**
 * Validates an observed HTTP request path and method against the official OpenAPI specification.
 *
 * @param {string} method - HTTP method (e.g. "GET", "POST")
 * @param {string} rawPath - Observed request path (e.g. "/api/v1/auth/login")
 * @returns {{
 *   status: 'MATCHED' | 'COMPATIBILITY_ALIAS' | 'UNMATCHED',
 *   matchedTemplate: string,
 *   tag: string,
 *   summary: string,
 *   isLegacy: boolean
 * }}
 */
export function validateApiContract(method, rawPath) {
  if (!rawPath) {
    return {
      status: "UNMATCHED",
      matchedTemplate: "",
      tag: "Unknown",
      summary: "Missing path",
      isLegacy: false,
    };
  }

  // Strip query string and hashes
  const cleanPath = rawPath.split("?")[0].split("#")[0].trim();
  const upperMethod = (method || "GET").toUpperCase();

  // Special case: Developer API monitor internal routes and health checks
  if (cleanPath.startsWith("/api/v1/admin/dev-monitor") || cleanPath.startsWith("/api/v1/dev-monitor") || cleanPath === "/api/health") {
    return {
      status: "MATCHED",
      matchedTemplate: cleanPath.startsWith("/api/v1/admin/dev-monitor")
        ? "/api/v1/admin/dev-monitor/**"
        : cleanPath.startsWith("/api/v1/dev-monitor")
        ? "/api/v1/dev-monitor/**"
        : "/api/health",
      tag: "System",
      summary: cleanPath === "/api/health" ? "Health Check" : "Developer Monitor Telemetry",
      isLegacy: false,
    };
  }

  for (const route of compiledRoutes) {
    if (route.method === upperMethod && route.regex.test(cleanPath)) {
      return {
        status: route.isLegacy ? "COMPATIBILITY_ALIAS" : "MATCHED",
        matchedTemplate: route.path,
        tag: route.tag,
        summary: route.summary,
        isLegacy: route.isLegacy,
      };
    }
  }

  // Check if route matches by path but method was different
  for (const route of compiledRoutes) {
    if (route.regex.test(cleanPath)) {
      return {
        status: route.isLegacy ? "COMPATIBILITY_ALIAS" : "MATCHED",
        matchedTemplate: route.path,
        tag: route.tag,
        summary: `${route.summary} (${route.method})`,
        isLegacy: route.isLegacy,
      };
    }
  }

  return {
    status: "UNMATCHED",
    matchedTemplate: cleanPath,
    tag: "Untracked",
    summary: "Endpoint not documented in OpenAPI spec",
    isLegacy: false,
  };
}

