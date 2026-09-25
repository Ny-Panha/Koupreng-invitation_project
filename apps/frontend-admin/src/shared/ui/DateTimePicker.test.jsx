import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DatePicker, parseKhmerOrIsoDate, formatToKhmerDate } from "./DatePicker";
import { TimePicker, parseTime, to24HourString } from "./TimePicker";

afterEach(() => {
  cleanup();
});

describe("DatePicker", () => {
  it("parses Khmer and ISO dates accurately", () => {
    const fromKhmer = parseKhmerOrIsoDate("ថ្ងៃពុធ ២៨ មករា ២០២៦");
    expect(fromKhmer).toEqual({ year: 2026, month: 0, day: 28 });

    const fromIso = parseKhmerOrIsoDate("2026-11-28");
    expect(fromIso).toEqual({ year: 2026, month: 10, day: 28 });
  });

  it("formats date into Khmer display string", () => {
    const khmerDate = formatToKhmerDate(2026, 0, 28);
    expect(khmerDate).toBe("ថ្ងៃពុធ ២៨ មករា ២០២៦");
  });

  it("renders trigger and opens popover on click", () => {
    const handleChange = vi.fn();
    render(
      <DatePicker
        value="ថ្ងៃពុធ ២៨ មករា ២០២៦"
        onChange={handleChange}
        placeholder="ជ្រើសរើសថ្ងៃ"
      />
    );

    const trigger = screen.getByRole("button", { name: /ថ្ងៃពុធ ២៨ មករា ២០២៦/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("មករា")).toBeInTheDocument();
  });
});

describe("TimePicker", () => {
  it("parses 24h time and Khmer time strings", () => {
    const p1 = parseTime("17:00");
    expect(p1.hour12).toBe("05");
    expect(p1.minute).toBe("00");
    expect(p1.period).toBe("ល្ងាច");
    expect(p1.val24).toBe("17:00");

    const p2 = parseTime("08:30 ព្រឹក");
    expect(p2.hour12).toBe("08");
    expect(p2.minute).toBe("30");
    expect(p2.period).toBe("ព្រឹក");
    expect(p2.val24).toBe("08:30");
  });

  it("converts 12h + period to 24h string", () => {
    expect(to24HourString("05", "00", "ល្ងាច")).toBe("17:00");
    expect(to24HourString("12", "00", "ល្ងាច")).toBe("12:00");
    expect(to24HourString("07", "30", "ព្រឹក")).toBe("07:30");
    expect(to24HourString("12", "00", "ព្រឹក")).toBe("00:00");
  });

  it("renders trigger and allows preset selection", () => {
    const handleChange = vi.fn();
    render(
      <TimePicker
        value="17:00"
        onChange={handleChange}
        placeholder="ជ្រើសរើសម៉ោង"
      />
    );

    const trigger = screen.getByRole("button", { name: /17:00/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const applyBtn = screen.getByText("កំណត់ម៉ោង");
    fireEvent.click(applyBtn);
    expect(handleChange).toHaveBeenCalledWith("17:00");
  });
});
