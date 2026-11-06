import React from 'react';

/** Icons used by the v2 top section (24px grid, stroke). The site-wide <Icon/> in Icons.tsx is still used elsewhere. */
const P = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></>,
  user: <><circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 20c.8-3.6 3.6-5.6 7.2-5.6s6.4 2 7.2 5.6" /></>,
  arrow: <path d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  book: <><path d="M12 6.5C10.2 5 7.6 4.5 4 4.5v13c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2v-13c-3.6 0-6.2.5-8 2Z" /><path d="M12 6.5v13" /></>,
  layers: <><path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8 12 3.5Z" /><path d="m3.5 12 8.5 4.5 8.5-4.5" /><path d="m3.5 16 8.5 4.5 8.5-4.5" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m8.8 12.2 2.3 2.3 4.2-4.6" /></>,
  scan: <><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><circle cx="12" cy="10.5" r="2.6" /><path d="M7.5 17c.6-2 2.4-3.2 4.5-3.2s3.9 1.2 4.5 3.2" /></>,
  upload: <><path d="M7 17.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.9 8.6 4.5 4.5 0 0 1 17 17.5" /><path d="M12 20.5v-8" /><path d="m8.8 15.2 3.2-3.2 3.2 3.2" /></>,
  flame: <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.3 1.6 1 2.3 2 2.7C11 8.5 11 5.5 12 3Z" />,
  mask: <><path d="M6 6h12v6.5a6 6.5 0 0 1-12 0V6Z" /><path d="M8 3.5 10 5.5 12 3.5 14 5.5 16 3.5" /><path d="M9.2 10.5h.01M14.8 10.5h.01M9.5 14.8c1.5 1.2 3.5 1.2 5 0" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.2-1-1.4-1-2.5 0-1 .8-1.7 1.9-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z" /><path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01" /></>,
  sword: <path d="M20 4 10 14M20 4h-5M20 4v5M7 13l4 4M5 19l3-3" />,
};
export type MxIconName = keyof typeof P;

export function MxIcon({ name, size }: { name: MxIconName; size?: number }) {
  return (
    <svg className="mx-ico" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      {P[name]}
    </svg>
  );
}

/** The Mudra brand mark (64px grid, gold line art). */
export function MxMark({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="32" cy="10" r="3.4" />
      <path d="M32 18c-9 3-17 9-17 19 0 6 4 10 9 10 3.4 0 6.4-2.2 8-5.2 1.6 3 4.6 5.2 8 5.2 5 0 9-4 9-10 0-10-8-16-17-19Z" />
      <path d="M32 24c-4 3-7 7-7 12M32 24c4 3 7 7 7 12" />
    </svg>
  );
}
