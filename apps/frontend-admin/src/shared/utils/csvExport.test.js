import { describe, it, expect, vi } from "vitest";
import { sanitizeCsvCell, exportCsv } from "./csvExport";

describe("csvExport utility", () => {
  it("escapes quotes and handles null/undefined values safely", () => {
    expect(sanitizeCsvCell(null)).toBe('""');
    expect(sanitizeCsvCell(undefined)).toBe('""');
    expect(sanitizeCsvCell("Normal Text")).toBe('"Normal Text"');
    expect(sanitizeCsvCell('Text with "quotes"')).toBe('"Text with ""quotes"""');
  });

  it("defends against CSV formula injection with leading special characters", () => {
    expect(sanitizeCsvCell("=1+1")).toBe("\"'=1+1\"");
    expect(sanitizeCsvCell("+123")).toBe("\"'+123\"");
    expect(sanitizeCsvCell("-5")).toBe("\"'-5\"");
    expect(sanitizeCsvCell("@SUM(A1:A5)")).toBe("\"'@SUM(A1:A5)\"");
    expect(sanitizeCsvCell("   =CMD()")).toBe("\"'   =CMD()\"");
    expect(sanitizeCsvCell("＝1+1")).toBe("\"'＝1+1\"");
    expect(sanitizeCsvCell("＋SUM")).toBe("\"'＋SUM\"");
  });

  it("creates a blob with UTF-8 BOM and triggers download link click", () => {
    const createObjectURLMock = vi.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    exportCsv("test-report", ["ID", "Title"], [["1", "Wedding"]]);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mock-url");
  });
});

