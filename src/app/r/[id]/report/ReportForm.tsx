'use client';
import { useActionState } from 'react';
import { submitFlagAction } from '@/app/actions';
import { Field } from '@/components/Field';
import type { ActionResult } from '@/lib/contracts';

export default function ReportForm({ recordId }: { recordId: string }) {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(submitFlagAction, null);
  const fe = s?.fieldErrors ?? {};
  return (
    <form action={action} className="panel" noValidate>
      {s?.error && !s.fieldErrors && <p className="err" role="alert">{s.error}</p>}
      <input type="hidden" name="recordId" value={recordId} />
      <div className="hp" aria-hidden="true"><label>Leave empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <Field name="type" label="What kind of report is this?" error={fe.type}>{(p) => (
        <select name="type" {...p} defaultValue=""><option value="" disabled>Choose…</option><option value="missing_attribution">Credit is missing or wrong</option><option value="suspected_reuse">Suspected reuse without credit or permission</option><option value="correction_request">Correction request</option></select>)}</Field>
      <Field name="text" label="What did you notice?" error={fe.text} hint="Describe it, and say where you saw it if relevant.">{(p) => <textarea name="text" {...p} />}</Field>
      <Field name="contact" label="Your email (optional, kept private)" hint="Only reviewers can see this.">{(p) => <input type="email" name="contact" {...p} autoComplete="email" />}</Field>
      <p><button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send report'}</button></p>
    </form>
  );
}
