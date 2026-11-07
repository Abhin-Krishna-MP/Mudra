import { LotusLoader } from '@/components/LotusLoader';

export default function Loading() {
  return (
    <div className="wrap page loading-page-wrap">
      <LotusLoader size="lg" label="Loading Mudra…" fullPage />
    </div>
  );
}
