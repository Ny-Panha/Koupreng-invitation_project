import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Modal from "./Modal";

afterEach(cleanup);
describe("A11Y-001 modal keyboard and background isolation", () => {
  it("focuses the dialog, traps forward/reverse Tab, and restores the opener on close", () => {
    const opener = document.createElement("button"); opener.textContent = "Open"; document.body.appendChild(opener); opener.focus();
    const close = vi.fn();
    const { rerender } = render(<Modal isOpen title="Guest editor" onClose={close}><input aria-label="Guest name" /><button>Save</button></Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
    const last = screen.getByRole("button", { name: "Save" }); last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close modal" }));
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: "Escape" }); expect(close).toHaveBeenCalledOnce();
    rerender(<Modal isOpen={false} title="Guest editor" onClose={close} />);
    expect(document.activeElement).toBe(opener); opener.remove();
  });

  it("makes background content inert and restores its previous state", () => {
    const background = document.createElement("main"); document.body.appendChild(background);
    const { unmount } = render(<Modal isOpen title="Dialog"><button>Action</button></Modal>);
    expect(background).toHaveAttribute("inert");
    expect(screen.getByRole("dialog").closest("[inert]")).toBeNull();
    unmount(); expect(background).not.toHaveAttribute("inert"); background.remove();
  });

  it("closes only the top nested dialog on Escape and keeps the background locked", () => {
    const parentClose = vi.fn(); const childClose = vi.fn();
    const { rerender } = render(<><Modal isOpen title="Parent" onClose={parentClose}><button>Parent action</button></Modal><Modal isOpen title="Child" onClose={childClose}><button>Child action</button></Modal></>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(childClose).toHaveBeenCalledOnce(); expect(parentClose).not.toHaveBeenCalled();
    rerender(<><Modal isOpen title="Parent" onClose={parentClose}><button>Parent action</button></Modal><Modal isOpen={false} title="Child" /></>);
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog", { name: "Parent" }).closest("[inert]")).toBeNull();
  });
});
