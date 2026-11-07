import './submit.css';
import SubmitForm from './SubmitForm';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';
import { redirect } from 'next/navigation';
import { getSubmitter, UNAUTHORIZED_URL } from '@/lib/authz';
import { logoutAction } from '@/app/actions';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Submit a work' };

const POINTS = [
  { icon: 'file', title: 'Your Contribution', text: 'Add a cultural work, media and trusted references.' },
  { icon: 'shield', title: 'Be Original', text: 'Write in your own words and cite sources.' },
  { icon: 'users', title: 'Keep it Accurate', text: 'Leave anything you are unsure about as “not stated”.' },
] as const;

export default async function Submit({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const submitter = await getSubmitter();
  if (!submitter) redirect(UNAUTHORIZED_URL);
  const sp = await searchParams;
  const signOut = (
    <form action={logoutAction} className="sheet-action">
      <input type="hidden" name="next" value="/login" />
      <button className="secondary">Sign out ({submitter.name})</button>
    </form>
  );
  if (sp.done) return (
    <div className="wrap page submit-page">
      <PageSheet eyebrow="Submit a record" title="Record submitted" headExtra={signOut}>
        <div role="status" className="sb-done">
          <span className="sb-done-ico" aria-hidden="true"><Icon name="check" size={30} /></span>
          <p>
            Your record was registered as <strong>{sp.done}</strong>. It is <strong>pending review</strong>:
            reviewers will check the entry before it appears in the public catalogue. Keep this ID for your reference.
          </p>
          <p><a className="btn secondary" href="/catalogue">Back to the catalogue</a></p>
        </div>
      </PageSheet>
    </div>
  );
  return (
    <div className="wrap page submit-page">
      <PageSheet
        eyebrow="Submit a record"
        title="Submit a Record"
        lede="Contribute a cultural work to the catalogue."
        headExtra={signOut}
      >
        <ul className="sb-points">
          {POINTS.map((p) => (
            <li key={p.title}>
              <span className="sb-point-ico" aria-hidden="true"><Icon name={p.icon} size={26} /></span>
              <div><h2>{p.title}</h2><p>{p.text}</p></div>
            </li>
          ))}
        </ul>
        <SubmitForm />
      </PageSheet>
    </div>
  );
}
