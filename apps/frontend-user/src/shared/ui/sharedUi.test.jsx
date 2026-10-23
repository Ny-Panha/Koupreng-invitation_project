import { useLanguageStore } from "@/stores/useLanguageStore";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => useLanguageStore.setState({ lang: "en" }));
import {
  Modal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  StatusBadge,
  LoadingButton,
  SearchInput,
} from "./index";

describe("Shared UI Primitives", () => {
  describe("Modal", () => {
    it("renders title, content and closes on Escape key", () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal Body Content</p>
        </Modal>
      );

      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal Body Content")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("ConfirmDialog", () => {
    it("calls onConfirm when confirm button is clicked", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Delete Guest"
          message="Are you sure?"
          confirmLabel="Delete"
          isDestructive={true}
        />
      );

      expect(screen.getByText("Delete Guest")).toBeInTheDocument();
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();

      const deleteBtn = screen.getByRole("button", { name: "Delete" });
      fireEvent.click(deleteBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("EmptyState & ErrorState", () => {
    it("renders EmptyState title and action button", () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No Guests"
          description="Add a guest to start."
          actionLabel="Add Guest"
          onAction={handleAction}
        />
      );

      expect(screen.getByText("No Guests")).toBeInTheDocument();
      const btn = screen.getByRole("button", { name: "Add Guest" });
      fireEvent.click(btn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it("renders ErrorState message and triggers retry", () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Failed to Load"
          message="Network timeout"
          onRetry={handleRetry}
        />
      );

      expect(screen.getByText("Failed to Load")).toBeInTheDocument();
      expect(screen.getByText("Network timeout")).toBeInTheDocument();

      const retryBtn = screen.getByRole("button", { name: "Retry" });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("StatusBadge & LoadingButton & SearchInput", () => {
    it("renders StatusBadge correctly", () => {
      render(<StatusBadge status="PUBLISHED" />);
      expect(screen.getByText("Published")).toBeInTheDocument();
    });

    it("renders LoadingButton in loading state and disables clicks", () => {
      const handleClick = vi.fn();
      render(
        <LoadingButton isLoading={true} onClick={handleClick}>
          Save
        </LoadingButton>
      );

      const btn = screen.getByRole("button", { name: "Save" });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("renders SearchInput and triggers onChange and onClear", () => {
      const handleChange = vi.fn();
      const handleClear = vi.fn();
      render(
        <SearchInput
          value="Koupreng"
          onChange={handleChange}
          onClear={handleClear}
          placeholder="Search..."
        />
      );

      const input = screen.getByPlaceholderText("Search...");
      expect(input).toHaveValue("Koupreng");

      const clearBtn = screen.getByLabelText("Clear search input");
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });
});
