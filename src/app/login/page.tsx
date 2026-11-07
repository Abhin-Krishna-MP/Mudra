import { redirect } from 'next/navigation';
import '../reuse/reuse.css';
import '../review/signin.css';
import AuthForm from './AuthForm';
import { PageSheet } from '@/components/PageSheet';
import { getSubmitter } from '@/lib/authz';
import { safeNext } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Author sign-in' };

export default async function Login({ searchParams }: { searchParams: Promise<{ msg?: string; next?: string; mode?: string }> }) {
  const sp = await searchParams;
  const next = sp.next ? safeNext(sp.next, '') : '';
  if (await getSubmitter()) redirect(next || '/submit');
  const mode = sp.mode === 'signup' ? 'signup' : 'login';
  const notice = sp.msg === 'Unauthorized' ? 'Unauthorized. Please sign in with an author account to submit a work.' : null;
  return (
    <div className="wrap page reuse-page signin-page">
      <PageSheet eyebrow="Author access" title={mode === 'signup' ? 'Create an author account' : 'Author Sign-In'} lede="Only registered authors can submit drafts to the catalogue.">
        <AuthForm mode={mode} next={next} notice={notice} />
      </PageSheet>
    </div>
  );
}
