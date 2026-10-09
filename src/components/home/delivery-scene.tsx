import { useId } from "react";

export default function DeliveryScene() {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      viewBox="0 0 560 400"
      fill="none"
      aria-hidden="true"
      className="delivery-scene"
    >
      <defs>
        <linearGradient
          id={`${id}body`}
          x1="180"
          y1="155"
          x2="420"
          y2="280"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9C61D7" />
          <stop offset="1" stopColor="#61259F" />
        </linearGradient>
        <linearGradient
          id={`${id}box`}
          x1="120"
          y1="80"
          x2="225"
          y2="210"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E3C3A6" />
          <stop offset="1" stopColor="#C6976F" />
        </linearGradient>
        <linearGradient
          id={`${id}glass`}
          x1="343"
          y1="172"
          x2="400"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDE0FF" />
          <stop offset="1" stopColor="#BE91EC" />
        </linearGradient>
        <radialGradient id={`${id}halo`}>
          <stop stopColor="#DDC6F5" />
          <stop offset="1" stopColor="#F8F3FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="290" cy="220" rx="245" ry="170" fill={`url(#${id}halo)`} />
      <ellipse
        cx="294"
        cy="316"
        rx="188"
        ry="23"
        fill="#5F328F"
        opacity=".12"
      />
      <path
        d="M64 301c0-34 22-64 54-64h345c33 0 40-35 22-56"
        stroke="#C6ACDE"
        strokeWidth="3"
        strokeDasharray="7 9"
        strokeLinecap="round"
      />
      <circle
        cx="66"
        cy="300"
        r="8"
        fill="#BFEA80"
        stroke="#7135B8"
        strokeWidth="3"
      />
      <path d="m330 133 63 20 39 48v75l-109 28V153l7-20Z" fill="#562185" />
      <path
        d="M172 145c0-10 8-18 18-18h128c10 0 18 8 18 18v72h44l37 48v31H172V145Z"
        fill={`url(#${id}body)`}
      />
      <path d="M172 153h164v124H172V153Z" fill="#8950C7" />
      <path d="M344 173h33l29 37h-62v-37Z" fill={`url(#${id}glass)`} />
      <path d="m378 175 25 33h-9l-25-33h9Z" fill="white" opacity=".45" />
      <path d="M337 223h67v58h-67v-58Z" fill="#793DB4" />
      <path
        d="M351 234h16"
        stroke="#E8D8F6"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M172 267h149M180 282h137"
        stroke="#BCA0DF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="403" y="247" width="14" height="10" rx="3" fill="#E9EEAA" />
      <rect x="168" y="267" width="7" height="16" rx="3" fill="#EAA6C4" />
      <rect x="167" y="289" width="251" height="11" rx="5.5" fill="#532179" />
      <circle cx="215" cy="300" r="29" fill="#2C203C" />
      <circle cx="215" cy="300" r="16" fill="#DFD6E8" />
      <circle cx="215" cy="300" r="7" fill="#A288B8" />
      <circle cx="372" cy="300" r="29" fill="#2C203C" />
      <circle cx="372" cy="300" r="16" fill="#DFD6E8" />
      <circle cx="372" cy="300" r="7" fill="#A288B8" />
      <path
        d="m243 170 30 17v36l-30 17-30-17v-36l30-17Z"
        fill="white"
        opacity=".95"
      />
      <path
        d="m215 188 28 16 28-16M243 204v34"
        stroke="#8650BC"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="m231 177 29 17v14l-11 6v-14l-30-17" fill="#BFEA80" />
      <path d="m109 97 49-25 50 25-50 26-49-26Z" fill="#F0D5BD" />
      <path d="m109 97 49 26v60l-49-27V97Z" fill={`url(#${id}box)`} />
      <path d="m158 123 50-26v60l-50 26v-60Z" fill="#BF926B" />
      <path d="m129 87 51 26v19l17-9v-19l-51-26-17 9Z" fill="#7135B8" />
      <path d="m123 126 21 11v17l-21-11v-17Z" fill="#FFF8EE" />
      <path d="m129 136 9 5M129 141l6 3" stroke="#C29471" strokeWidth="2" />
      <g transform="translate(422 67)">
        <circle cx="27" cy="27" r="27" fill="white" stroke="#E1D0F2" />
        <path
          d="M38 23c0 9-11 18-11 18S16 32 16 23a11 11 0 0 1 22 0Z"
          fill="#7135B8"
        />
        <circle cx="27" cy="23" r="4" fill="#D4EFA9" />
      </g>
      <g transform="translate(80 220)">
        <circle cx="22" cy="22" r="22" fill="#FDFBFF" stroke="#E1D0F2" />
        <path
          d="m14 22 6 6 11-13"
          stroke="#7135B8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M344 89h27M358 75v28M84 176h15M92 168v16"
        stroke="#B399CE"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="472" cy="272" r="4" fill="#BFEA80" />
      <circle cx="253" cy="87" r="5" fill="#BFA1DE" />
    </svg>
  );
}
