// src/tests/permissions.test.js
import { describe, it, expect } from "vitest";

// ── Role-based permission helpers (mirror your security rules) ─
function canPostAnnouncement(user)  { return user?.role === "admin"; }
function canDeleteAnnouncement(user){ return user?.role === "admin"; }
function canAddEvent(user)          { return user?.role === "admin"; }
function canDeleteEvent(user)       { return user?.role === "admin"; }
function canAccessChat(user)        { return !!user && !user.blocked; }
function canUploadPhoto(user)       { return !!user && !user.blocked; }
function canApprovePhoto(user)      { return user?.role === "admin"; }
function canFlagPhoto(user)         { return !!user && !user.blocked; }
function canManageUsers(user)       { return user?.role === "admin"; }
function canChangeRole(actor, targetRole) {
  // Admins can promote/demote anyone. No one else can change roles.
  return actor?.role === "admin";
}

const admin   = { role:"admin",  blocked:false };
const member  = { role:"member", blocked:false };
const parent  = { role:"parent", blocked:false };
const blocked = { role:"member", blocked:true  };
const guest   = null;

describe("Announcement permissions", () => {
  it("admin can post",    () => expect(canPostAnnouncement(admin)).toBe(true));
  it("member cannot post",() => expect(canPostAnnouncement(member)).toBe(false));
  it("parent cannot post",() => expect(canPostAnnouncement(parent)).toBe(false));
  it("guest cannot post", () => expect(canPostAnnouncement(guest)).toBe(false));
  it("admin can delete",  () => expect(canDeleteAnnouncement(admin)).toBe(true));
  it("member cannot delete",()=> expect(canDeleteAnnouncement(member)).toBe(false));
});

describe("Event permissions", () => {
  it("admin can add events",    () => expect(canAddEvent(admin)).toBe(true));
  it("member cannot add events",() => expect(canAddEvent(member)).toBe(false));
  it("admin can delete events", () => expect(canDeleteEvent(admin)).toBe(true));
});

describe("Chat permissions", () => {
  it("member can chat",        () => expect(canAccessChat(member)).toBe(true));
  it("parent can chat",        () => expect(canAccessChat(parent)).toBe(true));
  it("admin can chat",         () => expect(canAccessChat(admin)).toBe(true));
  it("blocked user cannot chat",()=> expect(canAccessChat(blocked)).toBe(false));
  it("guest cannot chat",      () => expect(canAccessChat(guest)).toBe(false));
});

describe("Photo permissions", () => {
  it("member can upload",        () => expect(canUploadPhoto(member)).toBe(true));
  it("parent can upload",        () => expect(canUploadPhoto(parent)).toBe(true));
  it("blocked user cannot upload",()=> expect(canUploadPhoto(blocked)).toBe(false));
  it("guest cannot upload",      () => expect(canUploadPhoto(guest)).toBe(false));
  it("admin can approve photos", () => expect(canApprovePhoto(admin)).toBe(true));
  it("member cannot approve",    () => expect(canApprovePhoto(member)).toBe(false));
  it("member can flag",          () => expect(canFlagPhoto(member)).toBe(true));
  it("blocked user cannot flag", () => expect(canFlagPhoto(blocked)).toBe(false));
});

describe("User management permissions", () => {
  it("admin can manage users",   () => expect(canManageUsers(admin)).toBe(true));
  it("member cannot manage users",()=> expect(canManageUsers(member)).toBe(false));
  it("admin can change roles",   () => expect(canChangeRole(admin, "admin")).toBe(true));
  it("member cannot change roles",()=> expect(canChangeRole(member, "admin")).toBe(false));
});
