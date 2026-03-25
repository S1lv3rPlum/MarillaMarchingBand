// src/tests/photos.test.js
import { describe, it, expect } from "vitest";

// ── Simulated photo flow logic ───────────────────────────────
function createPhotoEntry({ url, album, caption, uploadedBy, uploaderName }) {
  if (!url)   throw new Error("Photo URL is required.");
  if (!album) throw new Error("An event album must be selected.");
  return {
    url,
    album,
    caption:     caption || "",
    uploadedBy,
    uploaderName,
    status:      "pending",   // Always starts as pending
    flagged:     false,
    createdAt:   new Date().toISOString(),
  };
}

function approvePhoto(photo) {
  return { ...photo, status: "approved" };
}

function rejectPhoto(photo) {
  // Rejected photos are deleted — simulated by returning null
  return null;
}

function flagPhoto(photo, flaggedBy) {
  return { ...photo, flagged: true, flaggedBy };
}

function isVisibleToPublic(photo) {
  return photo.status === "approved" && !photo.flagged;
}

// ── Tests ────────────────────────────────────────────────────
describe("Photo submission", () => {
  it("creates a pending photo entry", () => {
    const photo = createPhotoEntry({ url:"http://img.test/1.jpg", album:"Spring Concert", uploadedBy:"uid123", uploaderName:"Jane" });
    expect(photo.status).toBe("pending");
    expect(photo.flagged).toBe(false);
  });

  it("requires a URL", () => {
    expect(() => createPhotoEntry({ url:"", album:"Spring Concert", uploadedBy:"uid123", uploaderName:"Jane" })).toThrow("Photo URL is required.");
  });

  it("requires an album", () => {
    expect(() => createPhotoEntry({ url:"http://img.test/1.jpg", album:"", uploadedBy:"uid123", uploaderName:"Jane" })).toThrow("An event album must be selected.");
  });

  it("caption is optional", () => {
    const photo = createPhotoEntry({ url:"http://img.test/1.jpg", album:"Parade", uploadedBy:"uid123", uploaderName:"Jane" });
    expect(photo.caption).toBe("");
  });
});

describe("Photo approval flow", () => {
  const pending = createPhotoEntry({ url:"http://img.test/1.jpg", album:"Parade", uploadedBy:"uid123", uploaderName:"Jane" });

  it("pending photo is not visible to public", () => {
    expect(isVisibleToPublic(pending)).toBe(false);
  });

  it("approved photo is visible to public", () => {
    const approved = approvePhoto(pending);
    expect(approved.status).toBe("approved");
    expect(isVisibleToPublic(approved)).toBe(true);
  });

  it("rejected photo is removed", () => {
    const result = rejectPhoto(pending);
    expect(result).toBeNull();
  });
});

describe("Photo flagging", () => {
  const approved = approvePhoto(createPhotoEntry({ url:"http://img.test/2.jpg", album:"Festival", uploadedBy:"uid123", uploaderName:"Tom" }));

  it("flagged photo is hidden from public even if approved", () => {
    const flagged = flagPhoto(approved, "uid456");
    expect(flagged.flagged).toBe(true);
    expect(isVisibleToPublic(flagged)).toBe(false);
  });
});
