import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RouteErrorBoundary from "./RouteErrorBoundary";

function ProblematicComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Simulated Safari Web API Failure");
  }
  return <div>Normal Content Loaded</div>;
}

describe("RouteErrorBoundary", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders children when no error occurs", () => {
    render(
      <MemoryRouter>
        <RouteErrorBoundary>
          <ProblematicComponent shouldThrow={false} />
        </RouteErrorBoundary>
      </MemoryRouter>
    );

    expect(screen.getByText("Normal Content Loaded")).toBeInTheDocument();
  });

  it("catches render error and displays localized recovery UI instead of blank screen", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <RouteErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/Something went wrong loading this page|មានបញ្ហាក្នុងការបង្ហាញទំព័រនេះ/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Try Again|ព្យាយាមម្ដងទៀត/)).toBeInTheDocument();
    expect(screen.getByText(/My Events|កម្មវិធីរបស់ខ្ញុំ/)).toBeInTheDocument();

    spy.mockRestore();
  });

  it("triggers onReset callback when Try Again is clicked", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const handleReset = vi.fn();

    render(
      <MemoryRouter>
        <RouteErrorBoundary onReset={handleReset}>
          <ProblematicComponent shouldThrow={true} />
        </RouteErrorBoundary>
      </MemoryRouter>
    );

    const retryBtn = screen.getByText(/Try Again|ព្យាយាមម្ដងទៀត/).closest("button");
    fireEvent.click(retryBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });
});
