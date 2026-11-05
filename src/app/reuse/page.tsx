import { getDb } from '@/lib/db';
import { listRecords, getRecordView } from '@/lib/repo';
import { USE_IDS, type Use } from '@/lib/permissions';
import { allFormats } from '@/lib/credit';
import { recordUrl } from '@/lib/site';
import { PageSheet } from '@/components/PageSheet';
import ReuseStudio, { type Work } from './ReuseStudio';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reuse Studio' };

export default async function Reuse({ searchParams }: { searchParams: Promise<{ work?: string; use?: string }> }) {
  const sp = await searchParams;
  const db = await getDb();
  const list = await listRecords(db);
  const views = (await Promise.all(list.map((r) => getRecordView(db, r.id)))).filter((v): v is NonNullable<typeof v> => !!v);
  const works: Work[] = views.map((v) => ({
    id: v.id, title: v.title, licence: v.licence, attributionRequired: v.attributionRequired, sensitivity: v.sensitivity, permissions: v.permissions,
    credit: allFormats({ title: v.title, credits: v.credits, licence: v.licence, attributionRequired: v.attributionRequired, recordUrl: recordUrl(v.id), recordId: v.id }).plain,
  }));
  const initialId = works.some((w) => w.id === sp.work) ? (sp.work as string) : works[0]?.id ?? '';
  const initialUse = (USE_IDS.includes(sp.use as Use) ? sp.use : 'teach') as Use;
  return (
    <div className="wrap page">
      <PageSheet title="Reuse Studio" lede="Check how you may use a cultural work for your project.">
        <ReuseStudio works={works} initialId={initialId} initialUse={initialUse} />
      </PageSheet>
    </div>
  );
}
