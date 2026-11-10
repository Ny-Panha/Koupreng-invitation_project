import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import EventPhotoUpload from "./EventPhotoUpload";

afterEach(cleanup);

describe("EventPhotoUpload Component", () => {
  it("renders with Wedding-specific labels by default in Khmer", () => {
    render(
      <EventPhotoUpload
        file={null}
        previewUrl={null}
        eventType="WEDDING"
        en={false}
        onFileChange={vi.fn()}
        onFocalPointChange={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText("រូបថតគូស្វាមីភរិយា")).toBeInTheDocument();
    expect(screen.getByText("ត្រូវមានសម្រាប់កាត & គម្រប")).toBeInTheDocument();
    expect(screen.getByText(/រូបថតគូស្នេហ៍នឹងត្រូវបង្ហាញលើកាតកម្មវិធី/)).toBeInTheDocument();
  });

  it("renders with English labels when en=true and eventType=BIRTHDAY", () => {
    render(
      <EventPhotoUpload
        file={null}
        previewUrl={null}
        eventType="BIRTHDAY"
        en={true}
        onFileChange={vi.fn()}
        onFocalPointChange={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText("Celebrant Photo")).toBeInTheDocument();
    expect(screen.getByText("Required for event card & cover")).toBeInTheDocument();
    expect(screen.getByText(/This photo will appear on your event card/)).toBeInTheDocument();
  });

  it("validates file size limit of 5 MB", () => {
    render(
      <EventPhotoUpload
        file={null}
        previewUrl={null}
        eventType="WEDDING"
        en={true}
        onFileChange={vi.fn()}
        onFocalPointChange={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const input = document.getElementById("event-photo-input");
    const oversizedFile = new File(["dummy content".repeat(1000000)], "large.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(oversizedFile, "size", { value: 6 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [oversizedFile] } });

    expect(screen.getByText(/Photo exceeds 5 MB limit/i)).toBeInTheDocument();
  });

  it("warns about HEIC / HEIF format with conversion advice", () => {
    render(
      <EventPhotoUpload
        file={null}
        previewUrl={null}
        eventType="WEDDING"
        en={true}
        onFileChange={vi.fn()}
        onFocalPointChange={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const input = document.getElementById("event-photo-input");
    const heicFile = new File(["content"], "photo.heic", {
      type: "image/heic",
    });

    fireEvent.change(input, { target: { files: [heicFile] } });

    expect(screen.getByText(/Please convert your HEIC\/HEIF photo to JPG, PNG, or WebP/i)).toBeInTheDocument();
  });

  it("calls onFileChange for valid image selection", () => {
    const handleFileChange = vi.fn();
    window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test-preview");

    render(
      <EventPhotoUpload
        file={null}
        previewUrl={null}
        eventType="WEDDING"
        en={true}
        onFileChange={handleFileChange}
        onFocalPointChange={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const input = document.getElementById("event-photo-input");
    const validFile = new File(["image data"], "couple.png", {
      type: "image/png",
    });
    Object.defineProperty(validFile, "size", { value: 1024 * 1024 });

    fireEvent.change(input, { target: { files: [validFile] } });

    expect(handleFileChange).toHaveBeenCalledWith(validFile, "blob:http://localhost/test-preview");
  });

  it("renders preview card and allows focal point selection and removal", () => {
    const handleFocalChange = vi.fn();
    const handleRemove = vi.fn();

    render(
      <EventPhotoUpload
        file={new File([""], "couple.jpg", { type: "image/jpeg" })}
        previewUrl="blob:http://localhost/preview-123"
        focalPoint="center"
        eventType="WEDDING"
        en={true}
        onFileChange={vi.fn()}
        onFocalPointChange={handleFocalChange}
        onRemove={handleRemove}
      />
    );

    // Preview image is displayed
    const previewImg = screen.getByAltText("Event photo preview");
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute("src", "blob:http://localhost/preview-123");

    // Click focal point buttons
    const topBtn = screen.getByText("Top");
    fireEvent.click(topBtn);
    expect(handleFocalChange).toHaveBeenCalledWith("top");

    // Click remove button
    const removeBtn = screen.getByText("Remove");
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalled();
  });
});
