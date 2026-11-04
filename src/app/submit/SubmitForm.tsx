'use client';
import { useActionState } from 'react';
import { createRecordAction } from '@/app/actions';
import { Field } from '@/components/Field';
import { LICENCES, LICENCE_IDS } from '@/lib/permissions';
import type { ActionResult } from '@/lib/contracts';

const PERMS = [['share', 'Sharing'], ['commercial', 'Commercial use'], ['adapt', 'Adaptation'], ['ai_training', 'Use for AI training']] as const;

export default function SubmitForm() {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(createRecordAction, null);
  const fe = s?.fieldErrors ?? {};
  return (
    <form action={action} className="ui" noValidate>
      {s && !s.ok && <div className="panel err" role="alert">{s.error}</div>}
      <div className="hp" aria-hidden="true"><label>Leave empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>

      <fieldset className="panel"><legend><h2 style={{ margin: 0 }}>1 · The work</h2></legend>
        <Field name="title" label="Title" error={fe.title}>{(p) => <input type="text" name="title" {...p} />}</Field>
        <Field name="workType" label="Type of work" error={fe.workType}>{(p) => <select name="workType" {...p} defaultValue=""><option value="" disabled>Choose…</option>{['ritual', 'performing', 'craft', 'textile', 'visual', 'other'].map((o) => <option key={o}>{o}</option>)}</select>}</Field>
        <Field name="region" label="Region" error={fe.region}>{(p) => <input type="text" name="region" {...p} />}</Field>
        <Field name="language" label="Language (optional)">{(p) => <input type="text" name="language" {...p} />}</Field>
        <Field name="culturalContext" label="Cultural context, in your own words" error={fe.culturalContext}>{(p) => <textarea name="culturalContext" {...p} />}</Field>
        <Field name="contextSources" label="Sources for the context (one per line)" error={fe.contextSources} hint="Required if this record is compiled from public sources.">{(p) => <textarea name="contextSources" {...p} />}</Field>
        <Field name="sourceUrl" label="Page the image or record comes from (optional)">{(p) => <input type="url" name="sourceUrl" {...p} />}</Field>
        <Field name="submissionBasis" label="How was this record prepared?" error={fe.submissionBasis}>{(p) => <select name="submissionBasis" {...p} defaultValue=""><option value="" disabled>Choose…</option><option value="creator_submitted">I am a creator or tradition bearer</option><option value="custodian_submitted">I represent a custodian (archive, group, institution)</option><option value="compiled_from_public_sources">Compiled from public sources (community has not reviewed)</option></select>}</Field>
        <Field name="sensitivity" label="Sensitivity" error={fe.sensitivity} hint="Restricted hides the image from the public.">{(p) => <select name="sensitivity" {...p} defaultValue="public"><option value="public">Public</option><option value="handle_with_care">Handle with care</option><option value="restricted">Restricted</option></select>}</Field>
      </fieldset>

      <fieldset className="panel"><legend><h2 style={{ margin: 0 }}>2 · Who is credited</h2></legend>
        {fe.credits && <p className="err" role="alert">{fe.credits}</p>}
        <p className="hint">Credit the people or community behind the work. A photographer is credited as photographer, never as creator of the work shown.</p>
        {[0, 1, 2, 3].map((i) => (<div key={i} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', alignItems: 'end' }}>
          <Field name={`credit_name_${i}`} label={`Name ${i + 1}`}>{(p) => <input type="text" name={`credit_name_${i}`} {...p} />}</Field>
          <Field name={`credit_role_${i}`} label="Role">{(p) => <input type="text" name={`credit_role_${i}`} {...p} />}</Field>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name={`credit_collective_${i}`} /> Group or community</label>
        </div>))}
        <Field name="custodian" label="Custodian to contact (only if real and stated)">{(p) => <input type="text" name="custodian" {...p} />}</Field>
      </fieldset>

      <fieldset className="panel"><legend><h2 style={{ margin: 0 }}>3 · What the creators or community have said</h2></legend>
        <p className="hint">If nobody has said, choose “Not stated”. Never guess.</p>
        {PERMS.map(([k, label]) => <Field key={k} name={`perm_${k}`} label={label} error={fe[`perm_${k}`]}>{(p) => <select name={`perm_${k}`} {...p} defaultValue="unspecified"><option value="unspecified">Not stated by the creator or community</option><option value="permitted">Permitted</option><option value="not_permitted">Not permitted</option></select>}</Field>)}
      </fieldset>

      <fieldset className="panel"><legend><h2 style={{ margin: 0 }}>4 · The image</h2></legend>
        <Field name="image" label="Image file (JPEG, PNG or WebP, up to 8 MB)" error={fe.asset}>{(p) => <input type="file" name="image" accept="image/jpeg,image/png,image/webp" {...p} />}</Field>
        <Field name="alt" label="Describe the image for people who cannot see it" error={fe.alt}>{(p) => <input type="text" name="alt" {...p} />}</Field>
        <Field name="licence" label="Licence of the image file" error={fe.licence}>{(p) => <select name="licence" {...p} defaultValue=""><option value="" disabled>Choose…</option>{LICENCE_IDS.map((l) => <option key={l} value={l}>{LICENCES[l].label}</option>)}</select>}</Field>
        <Field name="licenceSourceNote" label="Where do the image and its licence come from?" error={fe.licenceSourceNote} hint="Photographer, page URL, date checked.">{(p) => <input type="text" name="licenceSourceNote" {...p} />}</Field>
        <Field name="imageSourceNote" label="Image credit note (optional)">{(p) => <input type="text" name="imageSourceNote" {...p} />}</Field>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="attributionRequired" defaultChecked /> Credit is required when this work is reused</label>
      </fieldset>
      <button type="submit" disabled={pending}>{pending ? 'Submitting…' : 'Submit for review'}</button>
    </form>
  );
}
