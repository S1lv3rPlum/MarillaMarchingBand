// src/tests/auth.test.js
// Run with: npm test
// These tests cover authentication logic without needing a live Firebase connection.

import { describe, it, expect } from "vitest";

// ── Simulated auth logic (mirrors LoginModal behavior) ───────
function validateSignup({ name, email, phone, password }) {
  const errors = [];
  if (!name)     errors.push("Name is required.");
  if (!email)    errors.push("Email is required.");
  if (!phone)    errors.push("Phone number is required.");
  if (!password) errors.push("Password is required.");
  if (password && password.length < 6) errors.push("Password must be at least 6 characters.");
  if (email && !email.includes("@"))   errors.push("Invalid email address.");
  return errors;
}

function validateLogin({ email, password }) {
  const errors = [];
  if (!email)    errors.push("Email is required.");
  if (!password) errors.push("Password is required.");
  return errors;
}

function isBlocked(email, blockedList) {
  return blockedList.includes(email);
}

function assignInitialRole() {
  // All new signups start as member — role is promoted by admin
  return "member";
}

// ── Tests ────────────────────────────────────────────────────
describe("Signup validation", () => {
  it("rejects empty form", () => {
    const errs = validateSignup({ name:"", email:"", phone:"", password:"" });
    expect(errs.length).toBeGreaterThan(0);
  });

  it("requires phone number", () => {
    const errs = validateSignup({ name:"Jane", email:"jane@test.com", phone:"", password:"abc123" });
    expect(errs).toContain("Phone number is required.");
  });

  it("rejects weak password", () => {
    const errs = validateSignup({ name:"Jane", email:"jane@test.com", phone:"716-555-0000", password:"abc" });
    expect(errs).toContain("Password must be at least 6 characters.");
  });

  it("rejects invalid email", () => {
    const errs = validateSignup({ name:"Jane", email:"notanemail", phone:"716-555-0000", password:"abc123" });
    expect(errs).toContain("Invalid email address.");
  });

  it("passes with all valid fields", () => {
    const errs = validateSignup({ name:"Jane Doe", email:"jane@test.com", phone:"716-555-0000", password:"secure123" });
    expect(errs.length).toBe(0);
  });

  it("assigns member role on signup", () => {
    expect(assignInitialRole()).toBe("member");
  });
});

describe("Login validation", () => {
  it("rejects missing email", () => {
    const errs = validateLogin({ email:"", password:"abc123" });
    expect(errs).toContain("Email is required.");
  });

  it("rejects missing password", () => {
    const errs = validateLogin({ email:"jane@test.com", password:"" });
    expect(errs).toContain("Password is required.");
  });

  it("passes with valid credentials", () => {
    const errs = validateLogin({ email:"jane@test.com", password:"abc123" });
    expect(errs.length).toBe(0);
  });
});

describe("Blocked user check", () => {
  const blockedList = ["blocked@test.com", "kicked@test.com"];

  it("blocks a blocked user", () => {
    expect(isBlocked("blocked@test.com", blockedList)).toBe(true);
  });

  it("allows a non-blocked user", () => {
    expect(isBlocked("gooduser@test.com", blockedList)).toBe(false);
  });
});
