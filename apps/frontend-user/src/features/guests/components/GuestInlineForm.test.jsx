import { useLanguageStore } from "@/stores/useLanguageStore";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

beforeEach(() => useLanguageStore.setState({ lang: "en" }));
import { LOCAL_MESSAGES } from "@/shared/i18n/messagesDictionary";
import GuestInlineForm from "./GuestInlineForm";

afterEach(cleanup);

const groups = [{ id: "groom", name: "Groom Side" }, { id: "bride", name: "Bride Side" }];
const categories = [{ id: "friend", name: "Friend" }, { id: "family", name: "Family" }];
const t = key => LOCAL_MESSAGES.guests.en[key] || key;
const props = { groups, categories, t, onCancel: vi.fn() };

function renderForm(formProps) {
  return render(<table><tbody><GuestInlineForm {...props} {...formProps} /></tbody></table>);
}

describe("GuestInlineForm", () => {
  it("renders on the page and validates names and seat counts before saving", () => {
    const onSave = vi.fn();
    renderForm({ onSave });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const form = screen.getByRole("form");
    fireEvent.change(screen.getByRole("textbox", { name: "Guest Name", exact: true }), { target: { value: "   " } });
    fireEvent.submit(form);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Guest Name", exact: true }), { target: { value: "Dara" } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } });
    fireEvent.submit(form);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("retains failed entries, prevents duplicate submissions, and resets after a successful retry", async () => {
    let finishSave;
    const onSave = vi.fn().mockReturnValueOnce(new Promise(resolve => { finishSave = resolve; }));
    renderForm({ onSave });
    const name = screen.getByRole("textbox", { name: "Guest Name", exact: true });
    fireEvent.change(name, { target: { value: " Dara " } });
    fireEvent.change(screen.getByLabelText("Group"), { target: { value: "Bride Side" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Family" } });
    fireEvent.submit(screen.getByRole("form"));
    fireEvent.submit(screen.getByRole("form"));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: "Dara" }), null);
    await act(async () => finishSave(false));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(name).toHaveValue(" Dara ");
    onSave.mockResolvedValueOnce(true);
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => expect(name).toHaveValue(""));
    await waitFor(() => expect(name).toHaveFocus());
    expect(screen.getByLabelText("Group")).toHaveValue("Bride Side");
    expect(screen.getByLabelText("Category")).toHaveValue("Family");
  });

  it("omits the extra fields and preserves their saved values when editing", async () => {
    const guest = { id: 14, name: "Dara", count: 2, phone: "012345678", email: "dara@example.test", group: "Bride Side", category: "Family", seat: "A-01", companionName: "Sophea", note: "Vegetarian" };
    const onSave = vi.fn().mockResolvedValue(true);
    const onCancel = vi.fn();
    renderForm({ guest, onSave, onCancel });
    expect(screen.queryByText("More details")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Phone Number")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Companion / Plus-One")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Notes")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Table / seat")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Guest Name", exact: true }), { target: { value: "Dara Updated" } });
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: "Dara Updated", count: "2", phone: "012345678", email: "dara@example.test", group: "Bride Side", category: "Family", seat: "A-01", companionName: "Sophea", note: "Vegetarian" }), 14));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("cancels an edit without saving it", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    renderForm({ guest: { id: 14, name: "Dara" }, onSave, onCancel });
    fireEvent.change(screen.getByRole("textbox", { name: "Guest Name", exact: true }), { target: { value: "Unsaved name" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});
