import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import process from "node:process";
import { expect, it } from "vitest";
import { inventoryRoutes } from "../../../../scripts/qa/routeInventory.mjs";
import App from "./App";

it("reconciles admin routes including fullscreen editor guards and aliases", () => {
  const rows = inventoryRoutes(App(), "apps/frontend-admin/src/app/App.jsx");
  expect(rows).toHaveLength(24);
  expect(rows.filter(row => !["/login", "*"].includes(row.pattern))).toSatisfy(items => items.every(row => row.access === "admin"));
  if (process.env.BATCH11_UPDATE_ROUTES) {
    mkdirSync("../../.cache/batch11", { recursive: true });
    writeFileSync("../../.cache/batch11/admin-routes.json", JSON.stringify(rows, null, 2));
  } else {
    const matrix = JSON.parse(readFileSync("../../docs/qa/batch11/route-matrix.json", "utf8"));
    expect(matrix.routes.filter(row => row.application === "frontend-admin").map(row => ({ pattern: row.routePattern, index: row.index, access: row.accessRequirement })))
      .toEqual(rows.map(({ pattern, index, access }) => ({ pattern, index, access })));
  }
});

it("reconciles final leaf smoke contracts with every declared pattern and access guard", () => {
  const rows = inventoryRoutes(App(), "final route factory");
  const matrix = JSON.parse(readFileSync("../../docs/qa/batch12/route-matrix.json", "utf8"));
  const contracts = matrix.routes.filter(row => row.application === "frontend-admin");
  expect(contracts.map(row => ({ pattern: row.pattern, access: row.accessRequirement })))
    .toEqual(rows.map(({ pattern, access }) => ({ pattern, access })));
  expect(contracts.every(row => row.concreteUrl && row.expectedPathname && row.readinessContract)).toBe(true);
});
