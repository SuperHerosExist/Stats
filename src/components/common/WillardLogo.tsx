export function WillardLogo({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle background */}
      <circle cx="50" cy="50" r="48" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />

      {/* W letter */}
      <path
        d="M20 30 L26 55 L32 35 L38 55 L44 30"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Tiger stripes - stylized */}
      <path
        d="M56 35 L70 35"
        stroke="#808080"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M58 42 L72 42"
        stroke="#808080"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M56 49 L70 49"
        stroke="#808080"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Bottom text area - simplified */}
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        TIGERS
      </text>
    </svg>
  );
}
