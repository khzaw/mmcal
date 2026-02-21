import { describe, expect, it } from "vitest";
import { reducer } from "../../hooks/use-calendar-state";
import type { CalendarState } from "../../hooks/use-calendar-state";
import { getDayInfo, w2j } from "../burmese-calendar";

function makeState(overrides: Partial<CalendarState> = {}): CalendarState {
  return {
    year: 2026,
    month: 2,
    day: 15,
    selectedJdn: null,
    selectedDay: null,
    view: "month",
    ...overrides,
  };
}

describe("reducer — PREV", () => {
  it("goes to previous month", () => {
    const state = makeState({ month: 6 });
    const next = reducer(state, { type: "PREV" });
    expect(next.month).toBe(5);
    expect(next.year).toBe(2026);
  });

  it("wraps to December of previous year", () => {
    const state = makeState({ month: 1 });
    const next = reducer(state, { type: "PREV" });
    expect(next.month).toBe(12);
    expect(next.year).toBe(2025);
  });

  it("goes back 7 days in week view", () => {
    const state = makeState({ view: "week", day: 15 });
    const next = reducer(state, { type: "PREV" });
    const expectedJdn = Math.round(w2j(2026, 2, 15)) - 7;
    const expectedInfo = getDayInfo(expectedJdn);
    expect(next.year).toBe(expectedInfo.gregorian.year);
    expect(next.month).toBe(expectedInfo.gregorian.month);
    expect(next.day).toBe(expectedInfo.gregorian.day);
  });

  it("crosses month boundary in week view", () => {
    const state = makeState({ view: "week", month: 3, day: 3 });
    const next = reducer(state, { type: "PREV" });
    expect(next.month).toBe(2);
  });

  it("decrements year in year view", () => {
    const state = makeState({ view: "year" });
    const next = reducer(state, { type: "PREV" });
    expect(next.year).toBe(2025);
    expect(next.month).toBe(2); // month unchanged
  });
});

describe("reducer — NEXT", () => {
  it("goes to next month", () => {
    const state = makeState({ month: 6 });
    const next = reducer(state, { type: "NEXT" });
    expect(next.month).toBe(7);
    expect(next.year).toBe(2026);
  });

  it("wraps to January of next year", () => {
    const state = makeState({ month: 12 });
    const next = reducer(state, { type: "NEXT" });
    expect(next.month).toBe(1);
    expect(next.year).toBe(2027);
  });

  it("goes forward 7 days in week view", () => {
    const state = makeState({ view: "week", day: 15 });
    const next = reducer(state, { type: "NEXT" });
    const expectedJdn = Math.round(w2j(2026, 2, 15)) + 7;
    const expectedInfo = getDayInfo(expectedJdn);
    expect(next.year).toBe(expectedInfo.gregorian.year);
    expect(next.month).toBe(expectedInfo.gregorian.month);
    expect(next.day).toBe(expectedInfo.gregorian.day);
  });

  it("crosses month boundary in week view", () => {
    const state = makeState({ view: "week", month: 2, day: 26 });
    const next = reducer(state, { type: "NEXT" });
    expect(next.month).toBe(3);
  });

  it("increments year in year view", () => {
    const state = makeState({ view: "year" });
    const next = reducer(state, { type: "NEXT" });
    expect(next.year).toBe(2027);
    expect(next.month).toBe(2); // month unchanged
  });
});

describe("reducer — TODAY", () => {
  it("sets to today's date with selection", () => {
    const state = makeState({ year: 2020, month: 1, day: 1 });
    const next = reducer(state, { type: "TODAY" });
    const now = new Date();
    expect(next.year).toBe(now.getFullYear());
    expect(next.month).toBe(now.getMonth() + 1);
    expect(next.day).toBe(now.getDate());
    expect(next.selectedJdn).not.toBeNull();
    expect(next.selectedDay).not.toBeNull();
  });

  it("preserves view mode", () => {
    const state = makeState({ view: "week" });
    const next = reducer(state, { type: "TODAY" });
    expect(next.view).toBe("week");
  });
});

describe("reducer — GO_TO_DATE", () => {
  it("navigates to a specific date", () => {
    const state = makeState();
    const next = reducer(state, {
      type: "GO_TO_DATE",
      year: 2024,
      month: 4,
      day: 17,
    });
    expect(next.year).toBe(2024);
    expect(next.month).toBe(4);
    expect(next.day).toBe(17);
    expect(next.selectedJdn).toBe(Math.round(w2j(2024, 4, 17)));
    expect(next.selectedDay).not.toBeNull();
    expect(next.selectedDay?.gregorian.day).toBe(17);
  });

  it("preserves view mode", () => {
    const state = makeState({ view: "year" });
    const next = reducer(state, {
      type: "GO_TO_DATE",
      year: 2024,
      month: 1,
      day: 1,
    });
    expect(next.view).toBe("year");
  });
});

describe("reducer — SELECT_DAY", () => {
  it("sets selected day info", () => {
    const state = makeState();
    const jdn = Math.round(w2j(2026, 2, 21));
    const dayInfo = getDayInfo(jdn);
    const next = reducer(state, { type: "SELECT_DAY", day: dayInfo });
    expect(next.selectedJdn).toBe(jdn);
    expect(next.selectedDay).toBe(dayInfo);
  });

  it("does not change navigation state", () => {
    const state = makeState({ year: 2026, month: 2, day: 15 });
    const jdn = Math.round(w2j(2026, 3, 1));
    const dayInfo = getDayInfo(jdn);
    const next = reducer(state, { type: "SELECT_DAY", day: dayInfo });
    expect(next.year).toBe(2026);
    expect(next.month).toBe(2);
    expect(next.day).toBe(15);
  });
});

describe("reducer — SET_VIEW", () => {
  it("changes view mode", () => {
    const state = makeState({ view: "month" });
    expect(reducer(state, { type: "SET_VIEW", view: "week" }).view).toBe(
      "week",
    );
    expect(reducer(state, { type: "SET_VIEW", view: "year" }).view).toBe(
      "year",
    );
    expect(reducer(state, { type: "SET_VIEW", view: "month" }).view).toBe(
      "month",
    );
  });

  it("preserves other state", () => {
    const state = makeState({ year: 2024, month: 7, day: 10 });
    const next = reducer(state, { type: "SET_VIEW", view: "week" });
    expect(next.year).toBe(2024);
    expect(next.month).toBe(7);
    expect(next.day).toBe(10);
  });
});

describe("reducer — SET_YEAR", () => {
  it("changes only the year", () => {
    const state = makeState({ year: 2026, month: 5 });
    const next = reducer(state, { type: "SET_YEAR", year: 2030 });
    expect(next.year).toBe(2030);
    expect(next.month).toBe(5);
  });
});

describe("reducer — SET_MONTH", () => {
  it("changes only the month", () => {
    const state = makeState({ year: 2026, month: 5 });
    const next = reducer(state, { type: "SET_MONTH", month: 11 });
    expect(next.month).toBe(11);
    expect(next.year).toBe(2026);
  });
});

describe("reducer — multi-step navigation", () => {
  it("navigates forward then backward returns to original month", () => {
    const state = makeState({ month: 6 });
    const fwd = reducer(state, { type: "NEXT" });
    const back = reducer(fwd, { type: "PREV" });
    expect(back.month).toBe(6);
    expect(back.year).toBe(2026);
  });

  it("navigates across year boundary and back", () => {
    const state = makeState({ month: 12 });
    const fwd = reducer(state, { type: "NEXT" });
    expect(fwd.year).toBe(2027);
    expect(fwd.month).toBe(1);
    const back = reducer(fwd, { type: "PREV" });
    expect(back.year).toBe(2026);
    expect(back.month).toBe(12);
  });

  it("week view: 4 weeks forward ≈ 28 days later", () => {
    let state = makeState({ view: "week", day: 1 });
    for (let i = 0; i < 4; i++) {
      state = reducer(state, { type: "NEXT" });
    }
    const startJdn = Math.round(w2j(2026, 2, 1));
    const endJdn = Math.round(w2j(state.year, state.month, state.day));
    expect(endJdn - startJdn).toBe(28);
  });
});
