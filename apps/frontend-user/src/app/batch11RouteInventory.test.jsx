import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import process from "node:process";
import { expect, it } from "vitest";
import { inventoryRoutes } from "../../../../scripts/qa/routeInventory.mjs";
import AppRouter from "./router";

it("reconciles every expanded customer route with the Batch 11 matrix", () => {
  const rows = inventoryRoutes(AppRouter(), "apps/frontend-user/src/app/router.jsx");
  expect(rows).toHaveLength(111);
  expect(rows.filter(row => row.pattern.startsWith("/app/"))).toSatisfy(items => items.every(row => row.access === "authenticated"));
  if (process.env.BATCH11_UPDATE_ROUTES) {
    mkdirSync("../../.cache/batch11", { recursive: true });
    writeFileSync("../../.cache/batch11/user-routes.json", JSON.stringify(rows, null, 2));
  } else {
    const matrix = JSON.parse(readFileSync("../../docs/qa/batch11/route-matrix.json", "utf8"));
    expect(matrix.routes.filter(row => row.application === "frontend-user").map(row => ({ pattern: row.routePattern, index: row.index, access: row.accessRequirement })))
      .toEqual(rows.map(({ pattern, index, access }) => ({ pattern, index, access })));
  }
});

it("reconciles final leaf smoke contracts with every declared pattern and access guard", () => {
  const rows = inventoryRoutes(AppRouter(), "final route factory");
  const matrix = JSON.parse(readFileSync("../../docs/qa/batch12/route-matrix.json", "utf8"));
  const contracts = matrix.routes.filter(row => row.application === "frontend-user");
  expect(contracts.map(row => ({ pattern: row.pattern, access: row.accessRequirement })))
    .toEqual(rows.map(({ pattern, access }) => ({ pattern, access })));
  expect(contracts.every(row => row.concreteUrl && row.expectedPathname && row.readinessContract)).toBe(true);
});
