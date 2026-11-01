"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const bn = useLocale() === "bn";
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let enabled = window.matchMedia("(prefers-color-scheme: dark)").matches;
    try {
      const saved = localStorage.getItem("dropzo-theme");
      if (saved) enabled = saved === "dark";
    } catch {}
    document.documentElement.classList.toggle("dark", enabled);
    setDark(enabled);
    const sync = () =>
      setDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("dropzo-theme-change", sync);
    return () => window.removeEventListener("dropzo-theme-change", sync);
  }, []);
  return (
    <button
      type="button"
      className="language-button"
      aria-pressed={dark}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        window.dispatchEvent(new Event("dropzo-theme-change"));
        try {
          localStorage.setItem("dropzo-theme", next ? "dark" : "light");
        } catch {}
      }}
    >
      {bn ? (dark ? "লাইট মোড" : "ডার্ক মোড") : dark ? "Light mode" : "Dark mode"}
    </button>
  );
}
