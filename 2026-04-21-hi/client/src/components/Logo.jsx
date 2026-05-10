export default function Logo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="solenneGrad" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="40%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <mask id="cutout">
          <rect width="100" height="100" fill="white" />
          <circle cx="42" cy="50" r="21" fill="black" />
          <line x1="42" y1="50" x2="78" y2="86" stroke="black" strokeWidth="24" strokeLinecap="round" />
        </mask>
      </defs>
      
      <path d="M 12 22 Q 12 8 25 14 L 90 44 Q 102 49.5 90 55 L 25 85 Q 12 91 12 77 Z" fill="url(#solenneGrad)" mask="url(#cutout)" />
      
      <line x1="53" y1="61" x2="73" y2="81" stroke="url(#solenneGrad)" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}
