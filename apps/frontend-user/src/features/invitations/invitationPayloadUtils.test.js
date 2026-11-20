import { describe, expect, it } from "vitest";
import { dataUrlToFile, stripInlineMedia, preserveStudioJson, studioGallery, acknowledgeStudioMedia } from "./invitationPayloadUtils";

describe("invitation payload media handling", () => {
  it('N13-32 late media upload cannot overwrite a replacement selected during the save', () => {
    const sent = { coverImage: 'data:old', title: 'Before' };
    const current = { coverImage: 'data:new', title: 'Typed while saving' };
    expect(acknowledgeStudioMedia(current, sent, 'coverImage', 'https://example.invalid/old.webp')).toBe(current);
    expect(acknowledgeStudioMedia({ ...sent, title: current.title }, sent, 'coverImage', 'https://example.invalid/old.webp')).toEqual({ coverImage: 'https://example.invalid/old.webp', title: current.title });
  });
  it('preserves nested extension values while honoring explicit nulls, array deletions and order', () => {
    const previous = { appearance: { future: { list: [null, false] }, known: 'old' }, rows: [{ id: 'removed' }, { id: 'kept' }] };
    expect(preserveStudioJson(previous, { appearance: { known: null }, rows: [{ id: 'kept' }] })).toEqual({ appearance: { future: { list: [null, false] }, known: null }, rows: [{ id: 'kept' }] });
    expect(previous.appearance.known).toBe('old');
  });
  it('does not merge prototype keys or align reordered gallery metadata by array index', () => {
    const poisoned = JSON.parse('{"__proto__":{"polluted":true},"nested":{"constructor":{"prototype":{"polluted":true}},"safe":null}}');
    expect(preserveStudioJson({}, poisoned)).toEqual({ nested: { safe: null } });
    expect({}.polluted).toBeUndefined();
    expect(studioGallery([{ id: 'b', url: 'new-b' }], [{ id: 'a', future: 'A' }, { id: 'b', future: 'B' }])).toEqual([{ id: 'b', future: 'B', preview: 'new-b', type: 'image' }]);
  });
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
