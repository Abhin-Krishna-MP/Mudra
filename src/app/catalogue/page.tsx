import './catalogue.css';
import { getDb } from '@/lib/db';
import { listRecords } from '@/lib/repo';
import { PageSheet } from '@/components/PageSheet';
import { WORK_TYPE_ORDER } from '@/lib/ui';
import { CatalogueClient } from './CatalogueClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Catalogue' };

type SP = { q?: string; region?: string; type?: string; sort?: string; view?: string };

export default async function Catalogue({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = await listRecords(await getDb());
  const regions = [...new Set(all.map((r) => r.region))].sort();
  const present = new Set(all.map((r) => r.workType));
  const types = [...WORK_TYPE_ORDER.filter((t) => present.has(t)), ...[...present].filter((t) => !WORK_TYPE_ORDER.includes(t)).sort()];

  return (
    <div className="wrap page cat-page">
      <PageSheet eyebrow="Catalogue" title="Catalogue" lede="Explore Kerala’s cultural expressions">
        <CatalogueClient
          all={all}
          regions={regions}
          types={types}
          initialQ={sp.q ?? ''}
          initialRegion={sp.region ?? ''}
          initialType={sp.type ?? ''}
          initialSort={sp.sort ?? 'recent'}
          initialView={sp.view === 'list' ? 'list' : 'grid'}
        />
      </PageSheet>
    </div>
  );
}
