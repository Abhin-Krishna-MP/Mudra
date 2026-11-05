import CheckClient from './CheckClient';
import { PageSheet } from '@/components/PageSheet';
export const metadata = { title: 'Check an image' };
export default function Check() {
  return (
    <div className="wrap page">
      <PageSheet title="Check an Image" lede="Find possible matches with existing records.">
        <p className="muted" style={{ maxWidth: '68ch' }}>Found an image and want to know if Mudra has a record for it? Drop it here. The file is compared and not stored. A match is only a pointer for human review, never a finding about anyone.</p>
        <CheckClient />
      </PageSheet>
    </div>
  );
}
