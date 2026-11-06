import type { ReactNode } from 'react';

/** Line icons (24px grid, 1.7 stroke) used across Mudra. Decorative by default (aria-hidden). */
const P: Record<string, ReactNode> = {
  book: <><path d="M12 6.5C10.2 5 7.6 4.5 4 4.5v13c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2v-13c-3.6 0-6.2.5-8 2Z" /><path d="M12 6.5v13" /></>,
  layers: <><path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8 12 3.5Z" /><path d="m3.5 12 8.5 4.5 8.5-4.5" /><path d="m3.5 16 8.5 4.5 8.5-4.5" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m8.8 12.2 2.3 2.3 4.2-4.6" /></>,
  scan: <><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><circle cx="12" cy="10.5" r="2.6" /><path d="M7.5 17c.6-2 2.4-3.2 4.5-3.2s3.9 1.2 4.5 3.2" /></>,
  upload: <><path d="M7 17.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.9 8.6 4.5 4.5 0 0 1 17 17.5" /><path d="M12 20.5v-8" /><path d="m8.8 15.2 3.2-3.2 3.2 3.2" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></>,
  filter: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  user: <><circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 20c.8-3.6 3.6-5.6 7.2-5.6s6.4 2 7.2 5.6" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
  moon: <path d="M20 14.2A8 8 0 0 1 9.8 4a8 8 0 1 0 10.2 10.2Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5" />,
  chevL: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  chevR: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  download: <><path d="M12 4v11" /><path d="m7.5 11 4.5 4.5 4.5-4.5" /><path d="M5 19.5h14" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m7.8 12.4 2.9 2.9 5.5-5.8" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.6 2.6 0 0 1 4.9 1c0 1.7-2.5 2-2.5 3.6" /><path d="M12 17.2h.01" /></>,
  cross: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  pin: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
  users: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><path d="M16 5.8a3.2 3.2 0 0 1 0 5.4M17.5 14.8c1.7.5 2.8 2 3.2 4.7" /></>,
  tag: <><path d="M3.5 12.2V4.5h7.7l9.3 9.3a1.6 1.6 0 0 1 0 2.3l-5.4 5.4a1.6 1.6 0 0 1-2.3 0L3.5 12.2Z" /><circle cx="8" cy="9" r="1.3" /></>,
  scale: <><path d="M12 4v16M7 20h10M5 7h14" /><path d="m5 7-2.6 6a3 3 0 0 0 5.2 0L5 7ZM19 7l-2.6 6a3 3 0 0 0 5.2 0L19 7Z" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r=".8" /></>,
  heart: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.8h.01" /></>,
  copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" /></>,
  more: <><circle cx="5.5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18.5" cy="12" r="1.4" /></>,
  home: <><path d="m3.5 11.2 8.5-7 8.5 7" /><path d="M5.8 9.6V20h12.4V9.6" /><path d="M10 20v-5.5h4V20" /></>,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17.5 5-4.5 3.5 3 3-2.5 4.5 4" /></>,
  file: <><path d="M6.5 3.5h7l4.5 4.5v12a1 1 0 0 1-1 1h-10.5a1 1 0 0 1-1-1v-15.5a1 1 0 0 1 1-1Z" /><path d="M13.5 3.5V8H18" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  chevDown: <path d="m6 9 6 6 6-6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  tools: <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.1l-5.8 5.8a1.6 1.6 0 0 0 2.3 2.3l5.8-5.8a4 4 0 0 0 5.1-5.4l-2.4 2.4-2.1-.5-.5-2.1 2.4-2.4Z" /></>,
  leaf: <><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" /><path d="M5 19c3-4 6-7 10-9" /></>,
  lotus: <><path d="M12 4.5c-1.9 2.5-2.7 5.1-2.7 7.5 0 2.4 1 4.2 2.7 5.6 1.7-1.4 2.7-3.2 2.7-5.6 0-2.4-.8-5-2.7-7.5Z" /><path d="M12 17.6c-3.6-.2-6.7-2.2-8-6.4 2.5.5 4.4 1.3 5.6 2.6M12 17.6c3.6-.2 6.7-2.2 8-6.4-2.5.5-4.4 1.3-5.6 2.6" /><path d="M7 19.5c3.2-1.2 6.8-1.2 10 0" /></>,
  swords: <><path d="m5 4.5 9.5 9.5M4.5 5v3.2L6 9.7M9.7 6 8.2 4.5H5" /><path d="m19 4.5-9.5 9.5M19.5 5v3.2L18 9.7" /><path d="m13 15.5 3 3M15.5 13l3 3M9 15.5l-3 3M8.5 13.5l-2.5 2.5" /></>,
  drum: <><ellipse cx="12" cy="8.5" rx="7.5" ry="3" /><path d="M4.5 8.5v6.5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V8.5" /><path d="m7 11.2 3 6.4M17 11.2l-3 6.4M12 11.5v6.8" /></>,
  mask: <><path d="M5 5.5c4.7-1.2 9.3-1.2 14 0 .4 6.2-1.6 12-7 13.5C6.6 17.5 4.6 11.7 5 5.5Z" /><path d="M8.4 10c.9-.6 1.9-.6 2.7 0M12.9 10c.8-.6 1.8-.6 2.7 0" /><path d="M9.5 14.2c1.5 1.2 3.5 1.2 5 0" /></>,
  palette: <><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 1.5-2.1-.5-1.2.2-2.4 1.6-2.4H17a3.5 3.5 0 0 0 3.5-3.5C20.5 7 16.8 3.5 12 3.5Z" /><circle cx="7.8" cy="11.2" r="1" /><circle cx="10.2" cy="7.6" r="1" /><circle cx="14.6" cy="7.8" r="1" /></>,
  quote: <><path d="M9.5 7.5C6.8 8 5 10 5 13v3.5h5V12H7.4c.1-1.6 1-2.6 2.1-3Z" /><path d="M18.5 7.5C15.8 8 14 10 14 13v3.5h5V12h-2.6c.1-1.6 1-2.6 2.1-3Z" /></>,
  share: <><circle cx="6.5" cy="12" r="2.3" /><circle cx="17" cy="6" r="2.3" /><circle cx="17" cy="18" r="2.3" /><path d="m8.6 10.9 6.3-3.7M8.6 13.1l6.3 3.7" /></>,
  bookmark: <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" />,
  expand: <path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" /></>,
  refresh: <><path d="M19.5 12a7.5 7.5 0 0 1-13 5" /><path d="M4.5 12a7.5 7.5 0 0 1 13-5" /><path d="M17.5 3.5V7H14M6.5 20.5V17H10" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></>,
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 22, className, label }: { name: IconName; size?: number; className?: string; label?: string }) {
  return (
    <svg
      className={`icon${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {P[name]}
    </svg>
  );
}
