import { TAGLINE, DISCLAIMER, NOT_FINANCIAL } from '@/lib/copy';
import { LotusMark } from '@/components/Ornaments';
import { Icon, type IconName } from '@/components/Icons';

const COLS: { head: string; icon: IconName; links: { href: string; label: string }[] }[] = [
  { head: 'Explore', icon: 'grid', links: [{ href: '/catalogue', label: 'Cultural Passport' }, { href: '/reuse', label: 'Reuse Studio' }] },
  { head: 'Tools', icon: 'tools', links: [{ href: '/verify', label: 'Verify a Record' }, { href: '/check', label: 'Check an Image' }, { href: '/submit', label: 'Submit a Work' }] },
  { head: 'About', icon: 'info', links: [{ href: '/review', label: 'Reviewers' }, { href: '/about', label: 'About & Guidelines' }] },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      {/* Gold flourish with a lotus at its centre (drawn in the dark theme only) */}
      <svg className="foot-flourish" viewBox="0 0 1200 40" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
        <path d="M0 24C120 10 240 8 340 16s160 14 230 6c14-2 22-8 30-14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M1200 24c-120-14-240-16-340-8s-160 14-230 6c-14-2-22-8-30-14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="foot-crest" aria-hidden="true"><LotusMark size={44} /></span>

      <div className="wrap foot-wrap">
        <div className="foot">
          <div className="foot-col foot-col-about">
            <a className="foot-brand" href="/" aria-label={`Mudra, ${TAGLINE}. Home`}>
              <LotusMark size={52} />
              <span className="fb-text">
                <span className="fb-name">Mudra</span>
                <span className="fb-tag">{TAGLINE}<i aria-hidden="true" /></span>
              </span>
            </a>
            <p className="foot-lede">A digital provenance and attribution platform for Kerala’s cultural heritage, helping creators discover, credit and reuse cultural works responsibly.</p>
            <p className="foot-fine">{DISCLAIMER} {NOT_FINANCIAL}</p>
          </div>
          {COLS.map((c) => (
            <nav key={c.head} aria-label={c.head} className="foot-col foot-nav">
              <p className="foot-nav-head"><Icon name={c.icon} size={26} className="fn-ico" />{c.head}</p>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href}><a href={l.href}><Icon name="chevron" size={16} className="fn-chev" />{l.label}</a></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="foot-legal">
          <span className="fl-copy">© 2026 Mudra Project<b aria-hidden="true">·</b>Kerala Cultural Heritage Registry</span>
          <span className="fl-tag"><Icon name="leaf" size={20} className="fl-leaf" /><em>Preserving Kerala’s living traditions for future generations</em></span>
        </div>
      </div>
      <div className="foot-scallop" aria-hidden="true" />
    </footer>
  );
}
