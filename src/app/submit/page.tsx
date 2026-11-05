import SubmitForm from './SubmitForm';
import { PageSheet } from '@/components/PageSheet';
export const metadata = { title: 'Submit a work' };
export default async function Submit({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const sp = await searchParams;
  if (sp.done) return (
    <div className="wrap page"><PageSheet title="Submitted for review"><div role="status"><p>Your record was created as <strong>{sp.done}</strong>. It is <strong>pending</strong>: reviewers will check it before it appears in the catalogue. Keep this ID.</p><p><a className="btn secondary" href="/catalogue">Back to the catalogue</a></p></div></PageSheet></div>
  );
  return (
    <div className="wrap page">
      <PageSheet title="Submit a Record" lede="Contribute a cultural work to the catalogue.">
        <p className="muted" style={{ maxWidth: '68ch' }}>Everything here is written by you. Do not copy text from elsewhere unless you cite it. Anything you are unsure about should be left as “not stated”.</p>
        <SubmitForm />
      </PageSheet>
    </div>
  );
}
