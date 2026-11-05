import type { ReactNode } from 'react';

/** Inner-page frame: banner header (photo from /public/mudra when supplied, otherwise a drawn scene) over a content sheet. */
export function PageSheet({ title, lede, eyebrow, children, wide, headExtra }: { title: ReactNode; lede?: ReactNode; eyebrow?: ReactNode; children: ReactNode; wide?: boolean; headExtra?: ReactNode }) {
  return (
    <section className={`sheet${wide ? ' sheet-wide' : ''}`}>
      <header className="sheet-head has-depth">
        {/* Same layered depth as the home hero: Kathakali in light, Theyyam in dark. CSS backgrounds, so only the active theme's art is downloaded. */}
        <div className="hero-stage depth-stage" aria-hidden="true" suppressHydrationWarning>
          <div className="stage-3d" suppressHydrationWarning>
            <div className="layer l-bg lt" />
            <div className="mist" />
            <div className="layer l-fig lt" />
            <div className="layer d-bg dk" />
            <div className="layer d-fig dk" />
          </div>
        </div>
        <div className="sheet-head-text">
          {eyebrow && <p className="eyebrow-sm">{eyebrow}</p>}
          <h1>{title}</h1>
          {lede && <p className="lede-sm">{lede}</p>}
        </div>
        {headExtra}
      </header>
      <div className="sheet-body">{children}</div>
    </section>
  );
}
