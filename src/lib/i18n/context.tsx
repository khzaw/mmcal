import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { en } from "./en";
import { mm } from "./mm";
import type { Locale, LocaleCode } from "./types";

const locales: Record<LocaleCode, Locale> = { mm, en };

interface I18nContextValue {
  locale: Locale;
  localeCode: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: Locale; // shorthand alias
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  defaultLocale = "mm",
}: {
  children: ReactNode;
  defaultLocale?: LocaleCode;
}) {
  const [localeCode, setLocaleCode] = useState<LocaleCode>(() => {
    const saved = localStorage.getItem("mmcal-locale") as LocaleCode | null;
    const code = saved && locales[saved] ? saved : defaultLocale;
    document.documentElement.lang = code === "mm" ? "my" : "en";
    return code;
  });

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleCode(code);
    localStorage.setItem("mmcal-locale", code);
    document.documentElement.lang = code === "mm" ? "my" : "en";
  }, []);

  const locale = locales[localeCode];
  const value: I18nContextValue = { locale, localeCode, setLocale, t: locale };

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
