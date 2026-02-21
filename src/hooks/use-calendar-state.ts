import { getDayInfo, w2j } from "@/lib/burmese-calendar";
import type { CalendarDayInfo } from "@/lib/burmese-calendar";
import { useReducer } from "react";

export type ViewMode = "month" | "week" | "year";

export interface CalendarState {
  year: number;
  month: number;
  day: number;
  selectedJdn: number | null;
  selectedDay: CalendarDayInfo | null;
  view: ViewMode;
}

type Action =
  | { type: "PREV" }
  | { type: "NEXT" }
  | { type: "TODAY" }
  | { type: "GO_TO_DATE"; year: number; month: number; day: number }
  | { type: "SELECT_DAY"; day: CalendarDayInfo }
  | { type: "SET_VIEW"; view: ViewMode }
  | { type: "SET_YEAR"; year: number }
  | { type: "SET_MONTH"; month: number };

function reducer(state: CalendarState, action: Action): CalendarState {
  switch (action.type) {
    case "PREV": {
      if (state.view === "year") {
        return { ...state, year: state.year - 1 };
      }
      if (state.view === "week") {
        // Go back 7 days
        const jdn = Math.round(w2j(state.year, state.month, state.day)) - 7;
        const info = getDayInfo(jdn);
        return {
          ...state,
          year: info.gregorian.year,
          month: info.gregorian.month,
          day: info.gregorian.day,
        };
      }
      // Month view
      if (state.month === 1) {
        return { ...state, year: state.year - 1, month: 12 };
      }
      return { ...state, month: state.month - 1 };
    }
    case "NEXT": {
      if (state.view === "year") {
        return { ...state, year: state.year + 1 };
      }
      if (state.view === "week") {
        const jdn = Math.round(w2j(state.year, state.month, state.day)) + 7;
        const info = getDayInfo(jdn);
        return {
          ...state,
          year: info.gregorian.year,
          month: info.gregorian.month,
          day: info.gregorian.day,
        };
      }
      if (state.month === 12) {
        return { ...state, year: state.year + 1, month: 1 };
      }
      return { ...state, month: state.month + 1 };
    }
    case "TODAY": {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      const d = now.getDate();
      const jdn = Math.round(w2j(y, m, d));
      const day = getDayInfo(jdn);
      return {
        ...state,
        year: y,
        month: m,
        day: d,
        selectedJdn: jdn,
        selectedDay: day,
      };
    }
    case "GO_TO_DATE": {
      const jdn = Math.round(w2j(action.year, action.month, action.day));
      const day = getDayInfo(jdn);
      return {
        ...state,
        year: action.year,
        month: action.month,
        day: action.day,
        selectedJdn: jdn,
        selectedDay: day,
      };
    }
    case "SELECT_DAY":
      return { ...state, selectedJdn: action.day.jdn, selectedDay: action.day };
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "SET_YEAR":
      return { ...state, year: action.year };
    case "SET_MONTH":
      return { ...state, month: action.month };
  }
}

// Compute once at module load — today doesn't change during a session
const _now = new Date();
const _y = _now.getFullYear();
const _m = _now.getMonth() + 1;
const _d = _now.getDate();
const _todayJdn = Math.round(w2j(_y, _m, _d));
const _todayInfo = getDayInfo(_todayJdn);

const _initialState: CalendarState = {
  year: _y,
  month: _m,
  day: _d,
  selectedJdn: _todayJdn,
  selectedDay: _todayInfo,
  view: "month",
};

export function useCalendarState() {
  const [state, dispatch] = useReducer(reducer, _initialState);
  return { state, dispatch, todayJdn: _todayJdn, todayInfo: _todayInfo };
}
