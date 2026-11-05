'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { createRecordAction } from '@/app/actions';
import { Field } from '@/components/Field';
import { Lamp } from '@/components/Ornaments';
import { Icon } from '@/components/Icons';
import { LICENCES, LICENCE_IDS } from '@/lib/permissions';
import type { ActionResult } from '@/lib/contracts';

const PERMS = [['share', 'Sharing'], ['commercial', 'Commercial use'], ['adapt', 'Adaptation'], ['ai_training', 'Use for AI training']] as const;
const STEPS = ['Details', 'Media', 'Sources'] as const;
const WORK_TYPES: [string, string][] = [['ritual', 'Ritual art'], ['performing', 'Performing art'], ['craft', 'Craft'], ['textile', 'Textile'], ['visual', 'Visual art'], ['other', 'Folk art / other']];

/** Which step each server field error belongs to, so the form can jump to the first problem. */
const STEP_OF: Record<string, number> = {
  title: 0, workType: 0, region: 0, language: 0, culturalContext: 0, submissionBasis: 0, sensitivity: 0,
  asset: 1, image: 1, alt: 1, licence: 1, licenceSourceNote: 1, imageSourceNote: 1,
};
const stepOf = (k: string) => STEP_OF[k] ?? 2;
const targetId = (k: string) => (k === 'asset' ? 'image' : k === 'credits' ? 'credit_name_0' : k);

/**
 * Three-step form. Every step stays in the DOM inside ONE <form>, so all field names and the
 * createRecordAction contract are unchanged; steps are only shown or hidden.
 */
export default function SubmitForm() {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(createRecordAction, null);
  const fe = s?.fieldErrors ?? {};
  const errKeys = Object.keys(fe);
  const [step, setStep] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (errKeys.length) setStep(Math.min(...errKeys.map(stepOf)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    document.getElementById(`step-h-${step}`)?.focus();
  }, [step]);

  const panel = (i: number) => ({ hidden: step !== i });
  return (
    <div className="submit-layout" style={{ marginTop: 18 }}>
      <form action={action} className="ui" noValidate>
        <ol className="stepper" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} className={i < step ? 'done' : undefined} aria-current={i === step ? 'step' : undefined}>
              <span className="n" aria-hidden="true">{i < step ? <Icon name="check" size={16} /> : i + 1}</span>
              <span>{label}<span className="sr">{i < step ? ' (done)' : i === step ? ' (current step)' : ''}</span></span>
            </li>
          ))}
        </ol>

        {s && !s.ok && (
          <div className="errsum" role="alert">
            <strong>{s.error || 'Please fix the highlighted fields.'}</strong>
            {errKeys.length > 0 && <ul>{errKeys.map((k) => <li key={k}><a href={`#${targetId(k)}`} onClick={() => setStep(stepOf(k))}>{fe[k]}</a></li>)}</ul>}
          </div>
        )}
        <div className="hp" aria-hidden="true"><label>Leave empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>

        <fieldset className="panel step-panel" {...panel(0)}>
          <legend><h2 id="step-h-0" tabIndex={-1}>1 · The work</h2></legend>
          <Field name="title" label="Title of the work" error={fe.title} required>{(p) => <input type="text" name="title" placeholder="e.g. Theyyam" {...p} />}</Field>
          <Field name="workType" label="Category" error={fe.workType} required>{(p) => <select name="workType" {...p} defaultValue=""><option value="" disabled>Choose…</option>{WORK_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}</Field>
          <Field name="region" label="Region" error={fe.region} required>{(p) => <input type="text" name="region" {...p} />}</Field>
          <Field name="language" label="Language (optional)">{(p) => <input type="text" name="language" {...p} />}</Field>
          <Field name="culturalContext" label="Cultural context, in your own words" error={fe.culturalContext} required>{(p) => <textarea name="culturalContext" {...p} />}</Field>
          <Field name="submissionBasis" label="How was this record prepared?" error={fe.submissionBasis} required>{(p) => <select name="submissionBasis" {...p} defaultValue=""><option value="" disabled>Choose…</option><option value="creator_submitted">I am a creator or tradition bearer</option><option value="custodian_submitted">I represent a custodian (archive, group, institution)</option><option value="compiled_from_public_sources">Compiled from public sources (community has not reviewed)</option></select>}</Field>
          <Field name="sensitivity" label="Sensitivity" error={fe.sensitivity} hint="Restricted hides the image from the public.">{(p) => <select name="sensitivity" {...p} defaultValue="public"><option value="public">Public</option><option value="handle_with_care">Handle with care</option><option value="restricted">Restricted</option></select>}</Field>
        </fieldset>

        <fieldset className="panel step-panel" {...panel(1)}>
          <legend><h2 id="step-h-1" tabIndex={-1}>2 · The image</h2></legend>
          <Field name="image" label="Image file (JPEG, PNG or WebP, up to 8 MB)" error={fe.asset}>{(p) => <input type="file" name="image" accept="image/jpeg,image/png,image/webp" {...p} />}</Field>
          <Field name="alt" label="Describe the image for people who cannot see it" error={fe.alt}>{(p) => <input type="text" name="alt" {...p} />}</Field>
          <Field name="licence" label="Licence of the image file" error={fe.licence}>{(p) => <select name="licence" {...p} defaultValue=""><option value="" disabled>Choose…</option>{LICENCE_IDS.map((l) => <option key={l} value={l}>{LICENCES[l].label}</option>)}</select>}</Field>
          <Field name="licenceSourceNote" label="Where do the image and its licence come from?" error={fe.licenceSourceNote} hint="Photographer, page URL, date checked.">{(p) => <input type="text" name="licenceSourceNote" {...p} />}</Field>
          <Field name="imageSourceNote" label="Image credit note (optional)">{(p) => <input type="text" name="imageSourceNote" {...p} />}</Field>
          <div className="check-row"><input id="attributionRequired" type="checkbox" name="attributionRequired" defaultChecked /><label htmlFor="attributionRequired">Credit is required when this work is reused</label></div>
        </fieldset>

        <div className="step-panel" {...panel(2)}>
          <fieldset className="panel">
            <legend><h2 id="step-h-2" tabIndex={-1}>3 · Sources and credit</h2></legend>
            <Field name="contextSources" label="Sources for the context (one per line)" error={fe.contextSources} hint="Required if this record is compiled from public sources.">{(p) => <textarea name="contextSources" {...p} />}</Field>
            <Field name="sourceUrl" label="Page the image or record comes from (optional)">{(p) => <input type="url" name="sourceUrl" {...p} />}</Field>
          </fieldset>

          <fieldset className="panel">
            <legend><h2 style={{ margin: 0 }}>Who is credited</h2></legend>
            {fe.credits && <p className="err" role="alert"><span aria-hidden="true">✕ </span>{fe.credits}</p>}
            <p className="hint">Credit the people or community behind the work. A photographer is credited as photographer, never as creator of the work shown.</p>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="field-grid">
                <Field name={`credit_name_${i}`} label={`Name ${i + 1}`}>{(p) => <input type="text" name={`credit_name_${i}`} {...p} />}</Field>
                <Field name={`credit_role_${i}`} label="Role">{(p) => <input type="text" name={`credit_role_${i}`} {...p} />}</Field>
                <div className="check-row" style={{ marginBottom: 8 }}><input id={`credit_collective_${i}`} type="checkbox" name={`credit_collective_${i}`} /><label htmlFor={`credit_collective_${i}`}>Group or community</label></div>
              </div>
            ))}
            <Field name="custodian" label="Custodian to contact (only if real and stated)">{(p) => <input type="text" name="custodian" {...p} />}</Field>
          </fieldset>

          <fieldset className="panel">
            <legend><h2 style={{ margin: 0 }}>What the creators or community have said</h2></legend>
            <p className="hint">If nobody has said, choose “Not stated”. Never guess.</p>
            {PERMS.map(([k, label]) => <Field key={k} name={`perm_${k}`} label={label} error={fe[`perm_${k}`]}>{(p) => <select name={`perm_${k}`} {...p} defaultValue="unspecified"><option value="unspecified">Not stated by the creator or community</option><option value="permitted">Permitted</option><option value="not_permitted">Not permitted</option></select>}</Field>)}
          </fieldset>
        </div>

        <div className="btn-row">
          {step > 0 && <button type="button" className="secondary" onClick={() => setStep(step - 1)}>Back</button>}
          {step < STEPS.length - 1 && <button type="button" onClick={() => setStep(step + 1)}>Next <Icon name="arrow" size={18} /></button>}
          {step === STEPS.length - 1 && <button type="submit" disabled={pending}>{pending ? 'Submitting…' : 'Submit for review'}</button>}
        </div>
        <noscript><style>{'.step-panel[hidden]{display:block!important}'}</style></noscript>
      </form>
      <div className="submit-art" aria-hidden="true"><Lamp className="lamp" /></div>
    </div>
  );
}
