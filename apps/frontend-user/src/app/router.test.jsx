import { Children, isValidElement } from "react";
import { describe, expect, it } from "vitest";

import AppRouter from "./router";

function routePaths(element, result = []) {
  if (!isValidElement(element)) return result;
  if (typeof element.props.path === "string") result.push(element.props.path);
  Children.forEach(element.props.children, (child) => routePaths(child, result));
  return result;
}

const EXPECTED_PATHS = [
  "/templates/:id/preview", "/create/wedding", "/event/create",
  "/dashboard/events/create", "/create/wedding/:id", "/event/:id/manage",
  "/event/:draftId", "/preview/:draftId", "/payments/:orderCode/status",
  "/payments/success", "/payments/return", "/payments/cancel",
  "/w/:slug", "/i/:slug", "/", "/templates", "/templates/:templateId/checkout",
  "/pricing", "/contact", "/venues", "/venues/:id", "/about", "/help",
  "/templates/:id", "/templates/:id/demo", "/login", "/register",
  "/forgot-password", "/reset-password", "/dashboard", "/dashboard/events",
  "/dashboard/invitations", "/dashboard/invitations/new", "/dashboard/invitations/design",
  "/dashboard/invitations/edit", "/dashboard/invitations/:id/edit",
  "/dashboard/invitations/:id/preview", "/dashboard/invitations/:id",
  "/dashboard/invitations/:invitationId/assistant",
  "/dashboard/invitations/:invitationId/guests", "/dashboard/invitations/:invitationId/rsvp",
  "/dashboard/invitations/:id/delivery", "/dashboard/invitations/:id/media",
  "/dashboard/invitations/:invitationId/budget", "/dashboard/invitations/:invitationId/check-in",
  "/dashboard/invitations/:invitationId/seating",
  "/dashboard/invitations/:invitationId/reports",
  "/dashboard/invitations/:invitationId/qr",
  "/dashboard/invitations/:invitationId/wishes",
  "/dashboard/reports",
  "/dashboard/guests",
  "/dashboard/seating",
  "/dashboard/check-in",
  "/dashboard/rsvp",
  "/dashboard/media",
  "/dashboard/delivery",
  "/dashboard/share",
  "/dashboard/budget",
  "/dashboard/expenses", "/dashboard/gifts", "/dashboard/templates/paid",
  "/dashboard/profile", "/dashboard/change-password", "/dashboard/notifications",
  "/dashboard/organizations", "/dashboard/organizations/:organizationId",
  "/dashboard/packages", "/dashboard/payments", "/dashboard/payments/:orderCode",
  "/events", "/event/list", "/guests", "/expenses", "/gift", "/gifts",
  "/profile", "/templates/browse", "/templates/browse/:id", "*",
];


describe("the authoritative user router", () => {
  it("registers every public, auth, builder, host, payment and fallback route", () => {
    expect(routePaths(AppRouter())).toEqual(EXPECTED_PATHS);
    expect(new Set(EXPECTED_PATHS).size).toBe(EXPECTED_PATHS.length);
  });
});
