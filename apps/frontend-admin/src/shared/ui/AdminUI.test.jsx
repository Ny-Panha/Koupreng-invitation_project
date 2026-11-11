import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminLanguageProvider } from "../../app/providers/AdminLanguageProvider";
import { ActionButton, StatCard, StatusBadge } from "./AdminUI";
import Toast from "./Toast";

afterEach(() => { vi.useRealTimers(); localStorage.clear(); });

describe("admin operational primitives", () => {
  it("uses a safe button type in report filters while preserving explicit submit", () => {
    const submit = vi.fn(event => event.preventDefault());
    render(<form onSubmit={submit}><ActionButton>Refresh report</ActionButton><ActionButton type="submit">Apply</ActionButton></form>);
    fireEvent.click(screen.getByRole("button", { name: "Refresh report" }));
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("keeps pending payment semantically distinct from paid and shares theme roles", () => {
    render(<><StatusBadge status="PAID_PENDING_REVIEW" /><StatusBadge status="PAID" /><StatCard label="Payments" value="5" /></>);
    expect(screen.getByText("PAID_PENDING_REVIEW")).toHaveClass("text-[var(--ui-theme-warning)]");
    expect(screen.getByText("PAID")).toHaveClass("text-[var(--ui-theme-success)]");
    expect(screen.getByText("Payments").closest("article")).toHaveClass("bg-[var(--ui-theme-surface)]");
  });

  it("persists an error until dismissal and auto-dismisses informational feedback", () => {
    localStorage.setItem("koupreng.admin.lang", "en");
    vi.useFakeTimers();
    const close = vi.fn();
    const view = render(<AdminLanguageProvider><Toast toast={{ id: 1, type: "error", message: "Payment failed" }} onClose={close} /></AdminLanguageProvider>);
    act(() => vi.advanceTimersByTime(10000));
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Payment failed");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(close).toHaveBeenCalledTimes(1);
    view.rerender(<AdminLanguageProvider><Toast toast={{ id: 2, type: "info", message: "Updated" }} onClose={close} /></AdminLanguageProvider>);
    act(() => vi.advanceTimersByTime(3500));
    expect(close).toHaveBeenCalledTimes(2);
  });

  it("names error dismissal in Khmer", () => {
    localStorage.setItem("koupreng.admin.lang", "km");
    render(<AdminLanguageProvider><Toast toast={{ id: 3, type: "error", message: "មានបញ្ហា" }} onClose={vi.fn()} /></AdminLanguageProvider>);
    expect(screen.getByRole("button", { name: "បិទការជូនដំណឹង" })).toBeInTheDocument();
  });
});
