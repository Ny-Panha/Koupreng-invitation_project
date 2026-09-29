import { describe, expect, it } from "vitest";
import { dataUrlToFile, stripInlineMedia } from "./invitationPayloadUtils";

describe("invitation payload media handling", () => {
  it("removes data and blob URLs from nested API JSON while preserving remote URLs", () => {
    expect(stripInlineMedia({
      coverImage: "data:image/jpeg;base64,AA==",
      invitationImage: "blob:http://localhost/preview",
      photos: [{ url: "data:image/png;base64,AA==" }, { url: "https://cdn.example/photo.jpg" }],
      title: "Khmer Celestial",
    })).toEqual({
      coverImage: null,
      invitationImage: null,
      photos: [{ url: null }, { url: "https://cdn.example/photo.jpg" }],
      title: "Khmer Celestial",
    });
  });

  it("converts local image data URLs into correctly typed upload files", () => {
    const file = dataUrlToFile("data:image/png;base64,aGVsbG8=", "cover.jpg");

    expect(file.name).toBe("cover.png");
    expect(file.type).toBe("image/png");
    expect(file.size).toBe(5);
  });
});
