import { describe, expect, it } from "vitest";
import { classifyChatError } from "@/lib/chat-errors";

describe("classifyChatError", () => {
  it("classifies UNIT_RESTING embedded in a full JSON error body", () => {
    expect(classifyChatError('{"error":"UNIT_RESTING"}')).toEqual({
      kind: "resting",
    });
  });

  it("classifies RATE_LIMITED embedded in a full JSON error body", () => {
    expect(classifyChatError('{"error":"RATE_LIMITED"}')).toEqual({
      kind: "rate-limited",
    });
  });

  it("classifies SESSION_LIMIT embedded in a full JSON error body", () => {
    expect(classifyChatError('{"error":"SESSION_LIMIT"}')).toEqual({
      kind: "session-limit",
    });
  });

  it("classifies UNIT_RESTING as a bare string", () => {
    expect(classifyChatError("UNIT_RESTING")).toEqual({ kind: "resting" });
  });

  it("classifies RATE_LIMITED as a bare string", () => {
    expect(classifyChatError("RATE_LIMITED")).toEqual({
      kind: "rate-limited",
    });
  });

  it("classifies SESSION_LIMIT as a bare string", () => {
    expect(classifyChatError("SESSION_LIMIT")).toEqual({
      kind: "session-limit",
    });
  });

  it("classifies a generic network error as transient", () => {
    expect(classifyChatError("Failed to fetch")).toEqual({
      kind: "transient",
    });
  });

  it("classifies an empty string as transient", () => {
    expect(classifyChatError("")).toEqual({ kind: "transient" });
  });

  it("classifies MALFORMED_TRANSMISSION (an unmapped route error code) as transient", () => {
    expect(classifyChatError('{"error":"MALFORMED_TRANSMISSION"}')).toEqual({
      kind: "transient",
    });
  });
});
