"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="footer-top-button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        })
      }
    >
      <ArrowUp size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
