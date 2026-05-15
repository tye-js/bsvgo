type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "h-9 w-9" }: BrandLogoProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#A7F3D0" />
      <path
        d="M14 40.5V23.5L28 15.5L42 23.5V40.5L28 48.5L14 40.5Z"
        fill="#F8FAFC"
        stroke="#047857"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M28 15.5V31.8M14 23.5L28 31.8M42 23.5L28 31.8"
        stroke="#0F766E"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M29.5 25.5H35.5C40 25.5 43 28.5 43 32.5C43 36.5 40 39.5 35.5 39.5H27"
        stroke="#020617"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35.5 19.5L43 25.5L35.5 31.5"
        stroke="#020617"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18.5" cy="42.5" r="3.5" fill="#14B8A6" />
      <circle cx="28" cy="31.8" r="3.2" fill="#34D399" />
      <circle cx="44.5" cy="41.5" r="3.5" fill="#22C55E" />
    </svg>
  );
}
