import { redirect } from 'next/navigation';
import '../reuse/reuse.css';
import '../review/signin.css';
import AuthForm from './AuthForm';
import { PageSheet } from '@/components/PageSheet';
import { getSubmitter } from '@/lib/authz';
import { safeNext } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Author sign-in / sign-up' };

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string; error?: string; next?: string; redirect?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const nextTarget = sp.next || sp.redirect ? safeNext(sp.next || sp.redirect, '') : '';
  if (await getSubmitter()) redirect(nextTarget || '/author/dashboard');

  const mode = sp.mode === 'signup' ? 'signup' : 'login';
  const notice =
    sp.msg === 'Unauthorized' || sp.error === 'Unauthorized'
      ? 'Unauthorized. Please sign in with an author account to submit a work.'
      : (sp.msg || sp.error || null);

  return (
    <div className="wrap page reuse-page signin-page">
      <PageSheet
        eyebrow="Author access"
        title={mode === 'signup' ? 'Create an Author Account' : 'Author Sign-In'}
        lede="Sign in or register as an author to contribute cultural works to the registry."
      >
        <AuthForm mode={mode} next={nextTarget} notice={notice} />
      </PageSheet>
    </div>
  );
}
