import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { QaSessionBar } from "./QaSessionBar";

describe("QaSessionBar", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders idle state with record button and export actions", () => {
    const onStartSession = vi.fn();
    const onExport = vi.fn();

    render(
      <QaSessionBar
        isRecording={false}
        activeSession={null}
        onStartSession={onStartSession}
        onStopSession={vi.fn()}
        onAddNote={vi.fn()}
        onExport={onExport}
        eventsCount={5}
        lang="en"
      />
    );

    expect(screen.getByText("QA Diagnostic Session Recorder")).toBeInTheDocument();
    const recordBtn = screen.getByRole("button", { name: /Record QA Session/i });
    fireEvent.click(recordBtn);

    const input = screen.getByPlaceholderText(/Test session name/i);
    fireEvent.change(input, { target: { value: "RSVP Smoke Test" } });
    fireEvent.click(screen.getByRole("button", { name: /Start/i }));

    expect(onStartSession).toHaveBeenCalledWith("RSVP Smoke Test");
  });

  it("renders active recording state with note and stop controls", () => {
    const onStopSession = vi.fn();
    const onAddNote = vi.fn();

    render(
      <QaSessionBar
        isRecording={true}
        activeSession={{ name: "Guest Creation Flow", notes: [] }}
        onStartSession={vi.fn()}
        onStopSession={onStopSession}
        onAddNote={onAddNote}
        onExport={vi.fn()}
        eventsCount={10}
        lang="en"
      />
    );

    expect(screen.getByText(/RECORDING QA SESSION/i)).toBeInTheDocument();
    expect(screen.getByText("Guest Creation Flow")).toBeInTheDocument();

    const addNoteBtn = screen.getByRole("button", { name: /Add Note/i });
    fireEvent.click(addNoteBtn);

    const noteInput = screen.getByPlaceholderText(/Enter test step note/i);
    fireEvent.change(noteInput, { target: { value: "Submitting invalid email" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    expect(onAddNote).toHaveBeenCalledWith("Submitting invalid email");

    const stopBtn = screen.getByRole("button", { name: /Stop Recording/i });
    fireEvent.click(stopBtn);
    expect(onStopSession).toHaveBeenCalled();
  });
});
