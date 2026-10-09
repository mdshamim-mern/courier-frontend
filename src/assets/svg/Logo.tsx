import type * as React from "react";

export default function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      <path d="m20 4 14 8v16l-14 8-14-8V12L20 4Z" fill="#7135B8" />
      <path
        d="m7 12 13 8 13-8M20 20v15"
        stroke="#EAD9FF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m13 8 14 8v7l-6 3v-7L7 11" fill="#A574E0" />
      <path d="m13 23 3 2v4l-3-2v-4Z" fill="white" />
      <circle
        cx="33"
        cy="7"
        r="5"
        fill="#BFEA80"
        stroke="#FCFAFF"
        strokeWidth="2"
      />
    </svg>
  );
}
