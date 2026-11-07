import { PageSheet } from '@/components/PageSheet';
import LoginClient from './LoginClient';
import '../reuse/reuse.css';
import '../review/signin.css';

export const metadata = { title: 'Sign In / Register' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; msg?: string; redirect?: string }>;
}) {
  const sp = await searchParams;
  const error = sp.error || sp.msg;

  return (
    <div className="wrap page reuse-page signin-page">
      <PageSheet
        eyebrow="Authentication"
        title="Account Access"
        lede="Sign in to your author, steward, or reviewer account, or create an author profile."
      >
        <LoginClient error={error} redirect={sp.redirect} />
      </PageSheet>
    </div>
  );
}
