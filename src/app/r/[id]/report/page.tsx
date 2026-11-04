import ReportForm from './ReportForm';
export default async function Report({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { id } = await params; const sp = await searchParams;
  if (sp.sent) return (<div className="panel" role="status"><h1>Thank you</h1><p>Your report was sent to the reviewers. It is stored privately; your contact details are never shown publicly.</p><a href={`/r/${id}`}>Back to the record</a></div>);
  return (<><h1>Report a problem with {id}</h1><p className="muted">Missing credit, a suspected reuse, or a correction to the record. Reviewers will look at it.</p><ReportForm recordId={id} /></>);
}
