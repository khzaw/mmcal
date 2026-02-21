// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readURLState, writeURLState } from "../url-state";

describe("readURLState", () => {
  beforeEach(() => {
    // Reset URL to clean state
    window.history.replaceState(null, "", "/");
  });

  it("returns empty object when no params", () => {
    const state = readURLState();
    expect(state.year).toBeUndefined();
    expect(state.month).toBeUndefined();
    expect(state.day).toBeUndefined();
    expect(state.view).toBeUndefined();
  });

  it("parses year, month, day from URL", () => {
    window.history.replaceState(null, "", "/?y=2024&m=4&d=17");
    const state = readURLState();
    expect(state.year).toBe(2024);
    expect(state.month).toBe(4);
    expect(state.day).toBe(17);
  });

  it("parses view param", () => {
    window.history.replaceState(null, "", "/?y=2024&m=1&d=1&v=week");
    const state = readURLState();
    expect(state.view).toBe("week");
  });

  it("accepts all valid view modes", () => {
    for (const v of ["month", "week", "year"] as const) {
      window.history.replaceState(null, "", `/?v=${v}`);
      expect(readURLState().view).toBe(v);
    }
  });

  it("ignores invalid view param", () => {
    window.history.replaceState(null, "", "/?v=invalid");
    expect(readURLState().view).toBeUndefined();
  });

  it("handles partial params", () => {
    window.history.replaceState(null, "", "/?y=2025");
    const state = readURLState();
    expect(state.year).toBe(2025);
    expect(state.month).toBeUndefined();
    expect(state.day).toBeUndefined();
  });
});

describe("writeURLState", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("writes year, month, day to URL", () => {
    writeURLState({ year: 2024, month: 4, day: 17, view: "month" });
    const params = new URLSearchParams(window.location.search);
    expect(params.get("y")).toBe("2024");
    expect(params.get("m")).toBe("4");
    expect(params.get("d")).toBe("17");
  });

  it("omits view param for default month view", () => {
    writeURLState({ year: 2024, month: 1, day: 1, view: "month" });
    const params = new URLSearchParams(window.location.search);
    expect(params.has("v")).toBe(false);
  });

  it("includes view param for week view", () => {
    writeURLState({ year: 2024, month: 1, day: 1, view: "week" });
    const params = new URLSearchParams(window.location.search);
    expect(params.get("v")).toBe("week");
  });

  it("includes view param for year view", () => {
    writeURLState({ year: 2024, month: 1, day: 1, view: "year" });
    const params = new URLSearchParams(window.location.search);
    expect(params.get("v")).toBe("year");
  });

  it("roundtrips through read", () => {
    writeURLState({ year: 2025, month: 8, day: 22, view: "week" });
    const state = readURLState();
    expect(state.year).toBe(2025);
    expect(state.month).toBe(8);
    expect(state.day).toBe(22);
    expect(state.view).toBe("week");
  });
});
