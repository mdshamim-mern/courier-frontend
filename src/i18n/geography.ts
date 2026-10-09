const places: ReadonlyArray<readonly [string, string]> = [
  ["ঢাকা", "Dhaka"],
  ["ঢাকা মহানগর", "Dhaka Metropolitan"],
  ["সাভার", "Savar"],
  ["সাভার — দত্তপাড়া", "Savar — Dattapara"],
  ["সাভার — বিরুলিয়া", "Savar — Birulia"],
  ["মিরপুর", "Mirpur"],
  ["উত্তরা", "Uttara"],
  ["ধানমন্ডি", "Dhanmondi"],
  ["মোহাম্মদপুর", "Mohammadpur"],
  ["গুলশান", "Gulshan"],
  ["বগুড়া", "Bogura"],
  ["বগুড়া", "Bogura"],
  ["বগুড়া সদর", "Bogura Sadar"],
  ["বগুড়া সদর", "Bogura Sadar"],
  ["শিবগঞ্জ", "Shibganj"],
  ["ঢাকা নর্থ হাব", "Dhaka North Hub"],
  ["ঢাকা সাউথ হাব", "Dhaka South Hub"],
  ["বগুড়া সদর হাব", "Bogura Sadar Hub"],
  ["বগুড়া সদর হাব", "Bogura Sadar Hub"],
];
export function placeName(value: string, locale: string): string {
  const normalized = value.trim().normalize("NFC").toLocaleLowerCase("en");
  const match = places.find((pair) =>
    pair.some(
      (name) => name.normalize("NFC").toLocaleLowerCase("en") === normalized,
    ),
  );
  return match ? match[locale === "bn" ? 0 : 1] : value;
}
export function placeSearch(values: string[], search: string): boolean {
  const text = values
    .flatMap((value) => [value, placeName(value, "en"), placeName(value, "bn")])
    .join(" ")
    .toLocaleLowerCase("en");
  return text.includes(search.trim().toLocaleLowerCase("en"));
}
