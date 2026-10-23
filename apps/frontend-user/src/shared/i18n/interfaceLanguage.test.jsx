import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { StatusBadge, ErrorState } from "@/shared/ui";
import GuestTable from "@/features/guests/components/GuestTable";
import GuestInlineForm from "@/features/guests/components/GuestInlineForm";
import GuestImportModal from "@/features/guests/components/GuestImportModal";
import { DEFAULT_CATEGORIES, DEFAULT_GROUPS } from "@/features/guests/model/guestConstants";
import { buildShareMessage } from "@/features/guests/model/guestMappers";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import ChangePasswordPage from "@/features/auth/ChangePasswordFeature";
import { TimePicker } from "@/shared/ui/TimePicker";

beforeEach(() => useLanguageStore.getState().setLang("km"));
afterEach(cleanup);

describe("Selected interface language", () => {
  it("updates built-in guest labels and legacy status values without changing saved data", () => {
    const guest = { id: 1, name: "Dara", group: "Groom Side", category: "Family", sendStatus: "បានផ្ញើ" };
    render(<GuestTable guests={[guest]} showQuickAdd={false} />);
    expect(screen.getByText("ខាងកូនកំលោះ")).toBeInTheDocument();
    expect(screen.getByText("គ្រួសារ")).toBeInTheDocument();
    expect(screen.getByText("បានផ្ញើ")).toBeInTheDocument();
    act(() => useLanguageStore.getState().setLang("en"));
    expect(screen.getByText("Groom Side")).toBeInTheDocument();
    expect(screen.getByText("Family")).toBeInTheDocument();
    expect(screen.getByText("Sent")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/[\u1780-\u17b3]/);
    expect(guest).toEqual({ id: 1, name: "Dara", group: "Groom Side", category: "Family", sendStatus: "បានផ្ញើ" });
  });

  it("saves canonical choices after changing language with an unfinished guest form", async () => {
    const save = vi.fn().mockResolvedValue(true);
    render(<table><tbody><GuestInlineForm groups={DEFAULT_GROUPS} categories={DEFAULT_CATEGORIES} onSave={save} /></tbody></table>);
    fireEvent.change(screen.getByRole("textbox", { name: "ឈ្មោះភ្ញៀវ", exact: true }), { target: { value: "Dara" } });
    act(() => useLanguageStore.getState().setLang("en"));
    expect(screen.getByRole("textbox", { name: "Guest Name", exact: true })).toHaveValue("Dara");
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ name: "Dara", group: "Groom Side", category: "High School Friend" }), null));
  });

  it("keeps custom guest group names intact in both languages", () => {
    render(<GuestTable guests={[{ id: 1, name: "Dara", group: "College 2020", category: "My cousins" }]} showQuickAdd={false} />);
    act(() => useLanguageStore.getState().setLang("en"));
    expect(screen.getByText("College 2020")).toBeInTheDocument();
    expect(screen.getByText("My cousins")).toBeInTheDocument();
  });

  it("switches an open import dialog and its accessible controls", () => {
    render(<GuestImportModal isOpen onClose={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: "នាំចូលបញ្ជីភ្ញៀវ" })).toBeInTheDocument();
    act(() => useLanguageStore.getState().setLang("en"));
    expect(screen.getByRole("dialog", { name: "Import guests" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload CSV file" })).toBeInTheDocument();
    expect(screen.getByLabelText("Guest import file")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close modal" })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/[\u1780-\u17b3]/);
  });

  it("switches shared states, notifications and account labels immediately", () => {
    render(<><ErrorState onRetry={vi.fn()} /><StatusBadge status="PAID_PENDING_REVIEW" /><NotificationList /><ChangePasswordPage /></>);
    expect(screen.getByText("រង់ចាំការត្រួតពិនិត្យ")).toBeInTheDocument();
    act(() => useLanguageStore.getState().setLang("en"));
    expect(screen.getByText("Pending review")).toBeInTheDocument();
    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/[\u1780-\u17b3]/);
  });

  it("switches the displayed time without changing its stored 24-hour value", () => {
    render(<TimePicker value="17:30" onChange={vi.fn()} />);
    expect(screen.getByText("05:30 ល្ងាច")).toBeInTheDocument();
    act(() => useLanguageStore.getState().setLang("en"));
    expect(screen.getByText("05:30 PM")).toBeInTheDocument();
  });

  it.each(["km", "en"])("generates invitation sharing text in %s", lang => {
    const message = buildShareMessage({ name: "Dara", companionName: "Sophea", inviteToken: "guest-token" }, { slug: "our-wedding" }, null, lang);
    expect(message).toContain("/w/our-wedding?token=guest-token");
    if (lang === "en") expect(message).not.toMatch(/[\u1780-\u17b3]/);
    else expect(message).toContain("សូមគោរពអញ្ជើញ៖ Dara និង Sophea");
  });
});
