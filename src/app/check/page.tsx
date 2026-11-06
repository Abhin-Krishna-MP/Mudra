import './check.css';
import CheckClient from './CheckClient';
import { PageSheet } from '@/components/PageSheet';
export const metadata = { title: 'Check an image' };
export default function Check() {
  return (
    <div className="wrap page check-page">
      <PageSheet eyebrow="Check an image" title="Check an Image" lede="Find possible matches with existing records.">
        <CheckClient />
      </PageSheet>
    </div>
  );
}
