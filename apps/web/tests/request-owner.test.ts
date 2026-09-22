import { describe, expect, it } from "vitest";
import { getRequestOwnerId } from "../lib/request-owner";

function requestWithHeader(value: string | null) {
  const headers = new Headers();
  if (value !== null) {
    headers.set("x-owner-id", value);
  }
  return new Request("http://localhost/api/logs", { headers });
}

describe("getRequestOwnerId", () => {
  it("returns the owner id when it is a valid UUID", () => {
    const ownerId = "9f8b3c1e-3b1a-4b3a-8b8a-2f3e4d5c6b7a";
    expect(getRequestOwnerId(requestWithHeader(ownerId))).toBe(ownerId);
  });

  it("returns null when the header is missing", () => {
    expect(getRequestOwnerId(requestWithHeader(null))).toBeNull();
  });

  it("returns null when the header is not a valid UUID", () => {
    expect(getRequestOwnerId(requestWithHeader("not-a-uuid"))).toBeNull();
  });
});
