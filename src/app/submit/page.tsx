import SubmitForm from './SubmitForm';
export const metadata = { title: 'Submit a work' };
export default async function Submit({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const sp = await searchParams;
  if (sp.done) return (
    <div className="panel" role="status"><h1>Submitted for review</h1><p>Your record was created as <strong>{sp.done}</strong>. It is <strong>pending</strong>: reviewers will check it before it appears in the catalogue. Keep this ID.</p><p><a href="/">Back to the catalogue</a></p></div>
  );
  return (<><h1>Submit a work</h1><p className="muted">Everything here is written by you. Do not copy text from elsewhere unless you cite it. Anything you are unsure about should be left as “not stated”.</p><SubmitForm /></>);
}
