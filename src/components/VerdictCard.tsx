import { Icon, type IconName } from './Icons';
import { VERDICT_LABEL, type Verdict } from '@/lib/permissions';

const ICON: Record<Verdict, IconName> = { permitted: 'checkCircle', ask_first: 'help', not_permitted: 'cross' };
const HEADLINE: Record<Verdict, string> = { permitted: 'You may use it.', ask_first: 'Ask first.', not_permitted: 'Not permitted.' };

/** Large verdict card. Colour is always paired with an icon and the written verdict. */
export function VerdictCard({ verdict, useLabel, guidance }: { verdict: Verdict; useLabel: string; guidance: string }) {
  return (
    <div className={`result-card ${verdict}`} role="status">
      <span className="r-ico" aria-hidden="true"><Icon name={ICON[verdict]} size={34} /></span>
      <p className="r-title">{HEADLINE[verdict]}</p>
      <span className="sr">{useLabel}: {VERDICT_LABEL[verdict]}.</span>
      <p>{guidance}</p>
    </div>
  );
}
