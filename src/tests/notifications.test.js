// src/tests/notifications.test.js
import { describe, it, expect, vi } from "vitest";

// ── Simulated notification logic ─────────────────────────────

function canReceivePush(user) {
  return !!user && !user.blocked && user.pushEnabled && !!user.fcmToken;
}

function canReceiveSMS(user) {
  return !!user && !user.blocked && user.smsEnabled && !!user.phone;
}

function buildSMSBody(message, replyType) {
  const instructions =
    replyType === "yesno"    ? "\n\nReply YES or NO." :
    replyType === "freetext" ? "\n\nReply with any questions." :
                               "\n\nReply YES, NO, or with a question.";
  return `[Marilla Marching Band]\n${message}${instructions}`;
}

function validateBroadcast(message) {
  if (!message || !message.trim()) return "Message cannot be empty.";
  if (message.trim().length > 1000) return "Message is too long (max 1000 characters).";
  return null;
}

function processReply(reply) {
  const upper = reply.trim().toUpperCase();
  if (upper === "YES") return { type:"yesno", value:"YES" };
  if (upper === "NO")  return { type:"yesno", value:"NO" };
  return { type:"freetext", value: reply.trim() };
}

// ── Tests ────────────────────────────────────────────────────

describe("Push notification eligibility", () => {
  it("sends to opted-in user with token", () =>
    expect(canReceivePush({ blocked:false, pushEnabled:true, fcmToken:"token123" })).toBe(true));
  it("skips blocked user", () =>
    expect(canReceivePush({ blocked:true, pushEnabled:true, fcmToken:"token123" })).toBe(false));
  it("skips user who declined push", () =>
    expect(canReceivePush({ blocked:false, pushEnabled:false, fcmToken:"token123" })).toBe(false));
  it("skips user with no FCM token", () =>
    expect(canReceivePush({ blocked:false, pushEnabled:true, fcmToken:null })).toBe(false));
  it("skips guest (null user)", () =>
    expect(canReceivePush(null)).toBe(false));
});

describe("SMS eligibility", () => {
  it("sends to opted-in user with phone", () =>
    expect(canReceiveSMS({ blocked:false, smsEnabled:true, phone:"716-555-0000" })).toBe(true));
  it("skips blocked user", () =>
    expect(canReceiveSMS({ blocked:true, smsEnabled:true, phone:"716-555-0000" })).toBe(false));
  it("skips user who opted out", () =>
    expect(canReceiveSMS({ blocked:false, smsEnabled:false, phone:"716-555-0000" })).toBe(false));
  it("skips user with no phone", () =>
    expect(canReceiveSMS({ blocked:false, smsEnabled:true, phone:"" })).toBe(false));
});

describe("SMS body builder", () => {
  it("appends YES/NO instructions", () => {
    const body = buildSMSBody("Rehearsal cancelled tonight.", "yesno");
    expect(body).toContain("Reply YES or NO.");
    expect(body).toContain("[Marilla Marching Band]");
  });
  it("appends free text instructions", () => {
    const body = buildSMSBody("Parade starts at 9am.", "freetext");
    expect(body).toContain("Reply with any questions.");
  });
  it("appends both instructions", () => {
    const body = buildSMSBody("Uniform pickup Thursday.", "both");
    expect(body).toContain("Reply YES, NO, or with a question.");
  });
});

describe("Broadcast validation", () => {
  it("rejects empty message", () =>
    expect(validateBroadcast("")).toBeTruthy());
  it("rejects whitespace-only message", () =>
    expect(validateBroadcast("   ")).toBeTruthy());
  it("rejects message over 1000 chars", () =>
    expect(validateBroadcast("a".repeat(1001))).toBeTruthy());
  it("accepts valid message", () =>
    expect(validateBroadcast("Rehearsal tonight at 7pm!")).toBeNull());
});

describe("Reply processing", () => {
  it("recognizes YES reply", () =>
    expect(processReply("YES")).toEqual({ type:"yesno", value:"YES" }));
  it("recognizes NO reply (lowercase)", () =>
    expect(processReply("no")).toEqual({ type:"yesno", value:"NO" }));
  it("treats other text as free text", () =>
    expect(processReply("Will there be parking?")).toEqual({ type:"freetext", value:"Will there be parking?" }));
  it("trims whitespace from replies", () =>
    expect(processReply("  YES  ")).toEqual({ type:"yesno", value:"YES" }));
});
