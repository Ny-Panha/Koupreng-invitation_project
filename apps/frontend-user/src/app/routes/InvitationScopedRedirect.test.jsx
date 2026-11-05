import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import InvitationScopedRedirect from "./InvitationScopedRedirect";

afterEach(cleanup);
function Destination() {
  const location = useLocation();
  return <p>{location.pathname + location.search + location.hash} | {location.state?.from}</p>;
}
it.each(["eventId", "invitationId", "id"])("keeps numeric %s identity, guest selection and safe anchors", parameter => {
  render(<MemoryRouter initialEntries={[{ pathname: "/legacy/42", search: "?guestId=501&token=private&password=private&accessToken=private", hash: "#recipients", state: { from: "dashboard" } }]}>
    <Routes><Route path={`/legacy/:${parameter}`} element={<InvitationScopedRedirect targetSubPath="delivery" />} /><Route path="/app/*" element={<Destination />} /></Routes>
  </MemoryRouter>);
  expect(screen.getByText("/app/events/42/delivery?guestId=501#recipients | dashboard")).toBeInTheDocument();
});
it.each(["?id=42", "?invitationId=42"])("resolves a query-scoped identity %s", query => {
  render(<MemoryRouter initialEntries={[`/legacy${query}`]}><Routes><Route path="/legacy" element={<InvitationScopedRedirect targetSubPath="guests" />} /><Route path="/app/*" element={<Destination />} /></Routes></MemoryRouter>);
  expect(screen.getByText("/app/events/42/guests |")).toBeInTheDocument();
});
it.each(["", "local-draft", "0", "-1", "1e2"])("requires event selection for invalid or absent identity %s", id => {
  render(<MemoryRouter initialEntries={[`/legacy${id ? `/${id}` : ""}?token=private`]}><Routes><Route path="/legacy/:id?" element={<InvitationScopedRedirect targetSubPath="rsvp" />} /><Route path="/app/*" element={<Destination />} /></Routes></MemoryRouter>);
  expect(screen.getByText("/app/events?module=rsvp |")).toBeInTheDocument();
});
