import { useLocale } from "next-intl";
import {
  formatUiDate,
  formatUiNumber,
  translateError,
  translateUi,
} from "./ui";

export function useUiText() {
  const locale = useLocale();
  return (text: string | number | null | undefined) =>
    translateUi(locale, text);
}

export function useUiFormat() {
  const locale = useLocale();
  return {
    date: (value: Date | string, includeTime = false) =>
      formatUiDate(locale, value, includeTime),
    number: (value: string | number) => formatUiNumber(locale, value),
    money: (value: string | number) => formatUiNumber(locale, value, true),
    error: (message: string | null | undefined) =>
      translateError(locale, message),
  };
}
