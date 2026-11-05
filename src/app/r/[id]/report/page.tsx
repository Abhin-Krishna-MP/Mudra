import ReportForm from './ReportForm';
import { PageSheet } from '@/components/PageSheet';
export default async function Report({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { id } = await params; const sp = await searchParams;
  if (sp.sent) return (<div className="wrap page"><PageSheet title="Thank you"><div role="status"><p>Your report was sent to the reviewers. It is stored privately; your contact details are never shown publicly.</p><a className="btn secondary" href={`/r/${id}`}>Back to the record</a></div></PageSheet></div>);
  return (<div className="wrap page"><PageSheet title={`Report a problem with ${id}`} lede="Missing credit, a suspected reuse, or a correction to the record. Reviewers will look at it."><ReportForm recordId={id} /></PageSheet></div>);
}
