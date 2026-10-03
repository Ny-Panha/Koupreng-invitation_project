import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ContactFeature from "./ContactFeature";
import { api } from "../../shared/api/httpClient";

vi.mock("../../shared/api/httpClient", () => ({ api: { post: vi.fn() } }));
vi.mock("../../shared/ui/toast", () => ({ toast: vi.fn() }));

const mount = () => render(<MemoryRouter><ContactFeature /></MemoryRouter>);
const fill = () => {
  fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Audit host" } });
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "host@example.test" } });
  fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Please advise on our event." } });
};
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

describe("Contact delivery acknowledgement", () => {
  it("waits for SMTP acceptance and sends the required contact fields", async () => {
    let accept;
    api.post.mockReturnValue(new Promise((resolve) => { accept = resolve; }));
    mount(); fill();
    fireEvent.click(screen.getByRole("button", { name: /Submit Message/ }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/v1/contact", expect.objectContaining({ name: "Audit host", email: "host@example.test", message: "Please advise on our event." }), expect.any(Object)));
    expect(screen.queryByText(/SMTP_ACCEPTED/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sending|កំពុង/ })).toBeDisabled();
    await act(async () => accept({ data: { accepted: true, delivery: "SMTP_ACCEPTED" } }));
    expect(await screen.findByRole("status")).toHaveTextContent(/received|ទទួល/);
  });

  it.each([429, 502, 503])("retains entered values and allows retry after HTTP %s", async (status) => {
    api.post.mockRejectedValue({ status });
    mount(); fill();
    fireEvent.click(screen.getByRole("button", { name: /Submit Message/ }));
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(screen.getByLabelText(/Full Name/)).toHaveValue("Audit host");
    expect(screen.getByLabelText(/Email/)).toHaveValue("host@example.test");
    expect(screen.getByLabelText(/Message/)).toHaveValue("Please advise on our event.");
    expect(screen.getByRole("button", { name: /Submit Message/ })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("rejects an unacknowledged success response and does not double submit", async () => {
    let finish;
    api.post.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    mount(); fill();
    const form = screen.getByLabelText(/Full Name/).closest("form");
    fireEvent.submit(form); fireEvent.submit(form);
    expect(api.post).toHaveBeenCalledTimes(1);
    await act(async () => finish({ data: { accepted: true, delivery: "QUEUED" } }));
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(screen.getByLabelText(/Message/)).toHaveValue("Please advise on our event.");
  });

  it("exposes associated labels, required fields, and API length limits", () => {
    mount();
    for (const [name, limit] of [[/Full Name/,120],[/Email/,255],[/Message/,5000]]) {
      const field = screen.getByLabelText(name);
      expect(field).toBeRequired(); expect(field).toHaveAttribute("maxlength", String(limit));
    }
    expect(screen.getByLabelText(/Phone|Telegram/)).not.toBeRequired();
    expect(screen.getByLabelText(/Phone|Telegram/)).toHaveAttribute("maxlength", "30");
    expect(screen.getByLabelText(/Plan/)).toBeInTheDocument();
  });
});
