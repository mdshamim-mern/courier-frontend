import bengali from "../../messages/ui.bn.json";

const messages: Record<string, string> = bengali;

export function translateUi(
  locale: string,
  text: string | number | null | undefined,
): string {
  if (text == null) return "";
  if (typeof text === "number")
    return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US").format(
      text,
    );
  return locale === "bn" ? (messages[text] ?? text) : text;
}

export function translateError(
  locale: string,
  message: string | null | undefined,
): string {
  if (!message) return translateUi(locale, "Unable to complete this request");
  if (locale !== "bn" || /[\u0980-\u09ff]/.test(message)) return message;
  return (
    messages[message] ?? "অনুরোধটি সম্পন্ন করা যায়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।"
  );
}

export function formatUiDate(
  locale: string,
  value: Date | string,
  includeTime = false,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return translateUi(locale, "N/A");
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Dhaka",
    ...(includeTime ? ({ hour: "2-digit", minute: "2-digit" } as const) : {}),
  }).format(date);
}

export function formatUiNumber(
  locale: string,
  value: string | number,
  money = false,
): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return translateUi(locale, "N/A");
  return new Intl.NumberFormat(
    locale === "bn" ? "bn-BD" : "en-US",
    money
      ? {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      : {},
  ).format(number);
}
