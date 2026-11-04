import CheckClient from './CheckClient';
export const metadata = { title: 'Check an image' };
export default function Check() {
  return (<><h1>Check an image</h1><p className="muted">Found an image and want to know if Mudra has a record for it? Drop it here. The file is compared and not stored. A match is only a pointer for human review, never a finding about anyone.</p><CheckClient /></>);
}
