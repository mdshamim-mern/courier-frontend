import { getApiErrorMessage, getApiErrorStatus } from "./api-error";

const messages: Record<string, readonly [string, string]> = {
  "Approved business account required for COD": [
    "COD booking requires an approved business account. Submit your business details for administrator review, or enter 0 for COD if no product money needs to be collected.",
    "পণ্যের টাকা সংগ্রহের বুকিংয়ের জন্য অনুমোদিত ব্যবসায়িক অ্যাকাউন্ট দরকার। প্রশাসকের যাচাইয়ের জন্য ব্যবসার তথ্য দিন; পণ্যের টাকা সংগ্রহ না করলে COD ঘরে ০ দিন।",
  ],
  "Pricing changed; review a new quote": [
    "Pricing or the confirmed service changed. Review the updated cost and confirm it again before booking.",
    "মাশুল বা নিশ্চিত সেবা বদলেছে। নতুন হিসাব দেখে আবার সম্মতি দিয়ে বুকিং করুন।",
  ],
  "Verified customer account required": [
    "Booking requires an active, verified customer account. Verify your email and sign in again.",
    "বুকিংয়ের জন্য সক্রিয়, যাচাইকৃত গ্রাহক অ্যাকাউন্ট দরকার। ইমেইল যাচাই করে আবার প্রবেশ করুন।",
  ],
  "Account access changed": [
    "Your account access changed. Verify your email and sign in again with an active customer account.",
    "অ্যাকাউন্টের প্রবেশাধিকার বদলেছে। ইমেইল যাচাই করে সক্রিয় গ্রাহক অ্যাকাউন্টে আবার প্রবেশ করুন।",
  ],
  "Delivery area is not available": [
    "Pickup or delivery is unavailable in the selected area. Check coverage and the pickup method.",
    "নির্বাচিত এলাকায় সংগ্রহ বা ডেলিভারি চালু নেই। সেবার এলাকা ও সংগ্রহের পদ্ধতি যাচাই করুন।",
  ],
  "Active route hubs are required": [
    "The assigned route hub is unavailable. Contact Dropzo support before booking.",
    "নির্ধারিত পথের হাব চালু নেই। বুকিংয়ের আগে Dropzo সহায়তা দলের সঙ্গে যোগাযোগ করুন।",
  ],
  "Approved pricing is not available": [
    "No approved price is available for this route and service. Choose an available service or contact support.",
    "এই পথ ও সেবার অনুমোদিত মূল্য নেই। চালু সেবা বেছে নিন অথবা সহায়তা দলের সঙ্গে যোগাযোগ করুন।",
  ],
  "Approved next-day pricing is required after cutoff": [
    "The same-day cutoff has passed, but next-day pricing is not approved for this route. Choose an available service.",
    "একই দিনের বুকিংয়ের শেষ সময় পার হয়েছে; এই পথে পরের দিনের মূল্য অনুমোদিত নেই। চালু সেবা বেছে নিন।",
  ],
  "Calculated delivery charge exceeds supported limit": [
    "The calculated delivery charge exceeds the supported limit. Contact support.",
    "হিসাব করা ডেলিভারি মাশুল অনুমোদিত সীমার বেশি। সহায়তা দলের সঙ্গে যোগাযোগ করুন।",
  ],
};
export function bookingErrorMessage(error: unknown, locale: string): string {
  const bn = locale === "bn";
  const known = messages[getApiErrorMessage(error, "")];
  if (known) return known[bn ? 1 : 0];
  const status = getApiErrorStatus(error);
  if (status === 401)
    return bn
      ? "প্রবেশের মেয়াদ শেষ। আবার প্রবেশ করুন; ফরমের তথ্য মুছবেন না।"
      : "Your session expired. Sign in again without clearing your form.";
  if (status === 400 || status === 422)
    return bn
      ? "ফরমের তথ্য গ্রহণ করা যায়নি। ফোন, ঠিকানা, মূল্য ও ভবিষ্যতের সংগ্রহের সময় যাচাই করুন।"
      : "The booking details were not accepted. Check phone numbers, addresses, amounts and a future pickup time.";
  if (status === 403)
    return bn
      ? "এই অ্যাকাউন্ট থেকে বুকিংয়ের অনুমতি নেই। গ্রাহক অ্যাকাউন্টের যাচাই ও প্রবেশাধিকার পরীক্ষা করুন।"
      : "This account cannot book parcels. Check your customer account verification and access.";
  return bn
    ? "বুকিং সম্পন্ন হয়নি। আপনার তথ্য রাখা আছে। আবার চেষ্টা করুন বা সহায়তা দলের সঙ্গে যোগাযোগ করুন।"
    : "Booking could not be completed. Your details are retained. Retry or contact support.";
}
