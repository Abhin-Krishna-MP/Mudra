
import './submit.css';
import { redirect } from 'next/navigation';
import SubmitForm from './SubmitForm';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';
import { getSubmitter, UNAUTHORIZED_URL } from '@/lib/authz';
import { getDb } from '@/lib/db';
import { getDraft } from '@/lib/repo';
import { logoutAction } from '@/app/actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Submit a work' };

const POINTS = [
  {
    icon: 'file',
    title: 'Your Contribution',
    text: 'Add a cultural work, media and trusted references.',
  },
  {
    icon: 'shield',
    title: 'Be Original',
    text: 'Write in your own words and cite sources.',
  },
  {
    icon: 'users',
    title: 'Keep it Accurate',
    text: 'Leave anything you are unsure about as “not stated”.',
  },
] as const;

export default async function Submit({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; edit?: string }>;
}) {
  // Step 1: Verify authenticated user with author role.
  const submitter = await getSubmitter();

  if (!submitter) {
    redirect(UNAUTHORIZED_URL);
  }

  const sp = await searchParams;

  // Header actions.
  const signOut = (
    <div className="sheet-action">
      <a href="/author/dashboard" className="btn secondary">
        Author Dashboard
      </a>

      <form action={logoutAction} style={{ margin: 0 }}>
        <input type="hidden" name="next" value="/login" />

        <button
          type="submit"
          className="btn secondary signout-btn"
        >
          <Icon name="user" size={15} />
          <span>Sign out ({submitter.name})</span>
        </button>
      </form>
    </div>
  );

  // Step 2: Show successful submission state.
  if (sp.done) {
    return (
      <div className="wrap page submit-page">
        <PageSheet
          eyebrow="Submit a record"
          title="Record submitted"
          headExtra={signOut}
        >
          <div role="status" className="sb-done">
            <span className="sb-done-ico" aria-hidden="true">
              <Icon name="check" size={30} />
            </span>

            <p>
              Your record was registered as <strong>{sp.done}</strong>.
              It is <strong>pending review</strong>: reviewers will check
              the entry before it appears in the public catalogue.
              Keep this ID for your reference.
            </p>

            <div className="btn-row" style={{ marginTop: 16 }}>
              <a className="btn" href="/author/dashboard">
                Go to Author Dashboard
              </a>

              <a className="btn secondary" href="/catalogue">
                Back to the catalogue
              </a>
            </div>
          </div>
        </PageSheet>
      </div>
    );
  }

  // Step 3: Load existing draft when editing.
  let initialDraft = null;

  if (sp.edit) {
    const db = await getDb();
    initialDraft = await getDraft(db, sp.edit);
  }

  // Step 4: Render submission form.
  return (
    <div className="wrap page submit-page">
      <PageSheet
        eyebrow={initialDraft ? 'Edit Draft' : 'Submit a record'}
        title={
          initialDraft
            ? 'Edit and Resubmit Draft'
            : 'Submit a Record'
        }
        lede={
          initialDraft
            ? `Updating draft: ${initialDraft.title}`
            : 'Contribute a cultural work to the catalogue.'
        }
        headExtra={signOut}
      >
        {initialDraft &&
          (initialDraft.revision_note || initialDraft.revisionNote) && (
            <div
              className="sb-callout"
              role="alert"
              style={{ marginBottom: 20 }}
            >
              <Icon name="info" size={20} />

              <div>
                <strong>Steward Revision Notes:</strong>
                <p style={{ marginTop: 4 }}>
                  {initialDraft.revision_note ||
                    initialDraft.revisionNote}
                </p>
              </div>
            </div>
          )}

        <ul className="sb-points">
          {POINTS.map((p) => (
            <li key={p.title}>
              <span className="sb-point-ico" aria-hidden="true">
                <Icon name={p.icon} size={26} />
              </span>

              <div>
                <h2>{p.title}</h2>
                <p>{p.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <SubmitForm initialDraft={initialDraft} />
      </PageSheet>
    </div>
  );
}
