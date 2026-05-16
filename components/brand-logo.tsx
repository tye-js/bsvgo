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
      <rect width="64" height="64" rx="16" fill="#ECFDF5" />
      <rect x="7" y="7" width="50" height="50" rx="13" fill="#D1FAE5" />
      <path
        d="M16 18H27.8C34.3 18 38 21.2 38 26.1C38 29.1 36.4 31.5 33.6 32.8C37 34.1 39 37 39 40.8C39 46.4 34.8 49.6 27.8 49.6H16V18Z"
        fill="#F8FAFC"
        stroke="#047857"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M24 25H30.2C33.1 25 35 26.5 35 29C35 31.4 33.2 33 30.2 33H24V25ZM24 35.2H31.1C34.4 35.2 36.4 36.9 36.4 39.7C36.4 42.5 34.4 44.2 31.1 44.2H24V35.2Z"
        fill="#10B981"
      />
      <path
        d="M40.5 18L48 25.5L40.5 33"
        stroke="#0F766E"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M47 25.5H55"
        stroke="#0F766E"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
