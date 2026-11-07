'use client';
import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
import { createRecordAction } from '@/app/actions';
import { Field } from '@/components/Field';
import { Icon } from '@/components/Icons';
import { LotusLoader } from '@/components/LotusLoader';
import { LICENCES, LICENCE_IDS } from '@/lib/permissions';
import type { ActionResult } from '@/lib/contracts';

const PERMS = [['share', 'Sharing'], ['commercial', 'Commercial use'], ['adapt', 'Adaptation'], ['ai_training', 'Use for AI training']] as const;
const STEPS = ['Details', 'Media', 'Sources'] as const;
const GUIDE = [
  'Write the details in your own words.',
  'Add clear and relevant media (photos, audio or video).',
  'Include reliable sources (books, articles, links, etc.).',
  'If unsure, mark the information as “not stated”.',
];
const WORK_TYPES: [string, string][] = [['ritual', 'Ritual art'], ['performing', 'Performing art'], ['craft', 'Craft'], ['textile', 'Textile'], ['visual', 'Visual art'], ['other', 'Folk art / other']];
const REGIONS = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod', 'North Malabar', 'Kuttanad'];

/** Which step each server field error belongs to, so the form can jump to the first problem. */
const STEP_OF: Record<string, number> = {
  title: 0, workType: 0, region: 0, language: 0, culturalContext: 0, submissionBasis: 0, sensitivity: 0,
  asset: 1, image: 1, alt: 1, licence: 1, licenceSourceNote: 1, imageSourceNote: 1,
};
const stepOf = (k: string) => STEP_OF[k] ?? 2;
const targetId = (k: string) => (k === 'asset' ? 'image' : k === 'credits' ? 'credit_name_0' : k);

/** Line-art mandala that sits in the corner of each step card. */
function Mandala() {
  return (
    <svg className="sb-mandala" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="100" cy="54" rx="9" ry="30" transform={`rotate(${i * 30} 100 100)`} />)}
      {Array.from({ length: 12 }, (_, i) => <ellipse key={`s${i}`} cx="100" cy="30" rx="4" ry="14" transform={`rotate(${i * 30 + 15} 100 100)`} />)}
      <circle cx="100" cy="100" r="96" /><circle cx="100" cy="100" r="40" /><circle cx="100" cy="100" r="24" /><circle cx="100" cy="100" r="8" />
    </svg>
  );
}

function GuideWaves() {
  const d = (y: number) => `M0 ${y} Q 20 ${y - 16} 40 ${y} T 80 ${y} T 120 ${y} T 160 ${y} T 200 ${y} T 240 ${y} T 280 ${y} T 320 ${y} T 360 ${y} T 400 ${y}`;
  return (
    <svg className="sb-waves" viewBox="0 0 400 70" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      {[20, 32, 44, 56].map((y) => <path key={y} d={d(y)} opacity={1 - (y - 20) / 60} />)}
    </svg>
  );
}

/**
 * Three-step form. Every step stays in the DOM inside ONE <form>, so all field names and the
 * createRecordAction contract are unchanged; steps are only shown or hidden.
 * The action is dispatched from onSubmit (not the form's `action`), because React resets
 * uncontrolled fields after a form action finishes, which would wipe everything the person typed
 * the moment a validation error comes back.
 */
export default function SubmitForm() {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(createRecordAction, null);
  const [, startTransition] = useTransition();
  const fe = s?.fieldErrors ?? {};
  const errKeys = Object.keys(fe);
  const [step, setStep] = useState(0);
  const [descLen, setDescLen] = useState(0);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const first = useRef(true);
  const sumRef = useRef<HTMLDivElement>(null);

  const perStep = [0, 0, 0];
  errKeys.forEach((k) => { perStep[stepOf(k)] += 1; });
  const grouped = STEPS.map((label, i) => ({ label, i, keys: errKeys.filter((k) => stepOf(k) === i) })).filter((g) => g.keys.length);

  useEffect(() => {
    if (errKeys.length) setStep(Math.min(...errKeys.map(stepOf)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    document.getElementById(`step-h-${step}`)?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => {
    if (s && !s.ok) sumRef.current?.focus();
  }, [s]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  const panel = (i: number) => ({ hidden: step !== i });
  const goTo = (k: string) => {
    setStep(stepOf(k));
    setTimeout(() => {
      const el = document.getElementById(targetId(k));
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.focus({ preventScroll: true });
    }, 60);
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
  const onFile = (f: File | undefined) => setPreview(f ? { url: URL.createObjectURL(f), name: f.name } : null);

  return (
    <>
      <ol className="stepper" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className={[i < step ? 'done' : '', perStep[i] ? 'has-err' : ''].filter(Boolean).join(' ') || undefined} aria-current={i === step ? 'step' : undefined}>
            <span className="n" aria-hidden="true">{perStep[i] ? '!' : i < step ? <Icon name="check" size={16} /> : i + 1}</span>
            <span className="lbl">{label}<span className="sr">{perStep[i] ? ` (${perStep[i]} to fix)` : i < step ? ' (done)' : i === step ? ' (current step)' : ''}</span></span>
          </li>
        ))}
      </ol>

      <div className="sb-grid">
        <form onSubmit={onSubmit} className="ui sb-form" noValidate>
          {s && !s.ok && (
            <div className="errsum" role="alert" tabIndex={-1} ref={sumRef}>
              <div className="errsum-head">
                <span className="errsum-ico" aria-hidden="true"><Icon name="info" size={24} /></span>
                <div>
                  <strong>{errKeys.length ? `${errKeys.length} ${errKeys.length === 1 ? 'thing needs' : 'things need'} your attention` : (s.error || 'We could not submit this record')}</strong>
                  <p>{errKeys.length ? 'Fix these to submit your record. Select an item to jump to it.' : 'Please try again in a moment.'}</p>
                </div>
              </div>
              {grouped.length > 0 && (
                <div className="errsum-groups">
                  {grouped.map((g) => (
                    <section key={g.label} className="errsum-group">
                      <h3><span className="errsum-step">{g.i + 1}</span>{g.label}</h3>
                      <ul>{g.keys.map((k) => <li key={k}><a href={`#${targetId(k)}`} onClick={(e) => { e.preventDefault(); goTo(k); }}>{fe[k]}</a></li>)}</ul>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="hp" aria-hidden="true"><label>Leave empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>

          <fieldset className="panel step-panel" {...panel(0)}>
            <Mandala />
            <legend><h2 id="step-h-0" tabIndex={-1}>1. The Work</h2></legend>
            <Field name="title" label="Title of the work" error={fe.title} required icon={<Icon name="book" size={20} />}>{(p) => <input type="text" name="title" placeholder="e.g. Theyyam" maxLength={160} {...p} />}</Field>
            <div className="sb-two">
              <Field name="workType" label="Category" error={fe.workType} required icon={<Icon name="layers" size={20} />}>{(p) => <select name="workType" {...p} defaultValue=""><option value="" disabled>Choose a category</option>{WORK_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}</Field>
              <Field name="region" label="Region" error={fe.region} required icon={<Icon name="pin" size={20} />}>{(p) => <><input type="text" name="region" list="sb-regions" placeholder="e.g. Kannur, Kerala" autoComplete="off" {...p} /><datalist id="sb-regions">{REGIONS.map((r) => <option key={r} value={r} />)}</datalist></>}</Field>
            </div>
            <Field name="culturalContext" label="Brief description" error={fe.culturalContext} required>{(p) => <div className="fi fi-area"><span className="fi-ico" aria-hidden="true"><Icon name="file" size={20} /></span><textarea name="culturalContext" placeholder="Describe the work in your own words…" maxLength={500} onChange={(e) => setDescLen(e.target.value.length)} {...p} /></div>}</Field>
            <p className="sb-count" aria-hidden="true">{descLen} / 500</p>
            <div className="sb-two">
              <Field name="language" label="Language or dialect (optional)">{(p) => <input type="text" name="language" placeholder="e.g. Malayalam" {...p} />}</Field>
              <Field name="sensitivity" label="Sensitivity" error={fe.sensitivity}>{(p) => <select name="sensitivity" {...p} defaultValue="public"><option value="public">Public</option><option value="handle_with_care">Handle with care (sacred or ceremonial)</option><option value="restricted">Restricted (hidden from the public)</option></select>}</Field>
            </div>
            <Field name="submissionBasis" label="How was this record prepared?" error={fe.submissionBasis} required>{(p) => <select name="submissionBasis" {...p} defaultValue=""><option value="" disabled>Choose an option</option><option value="creator_submitted">I am a creator or tradition bearer</option><option value="custodian_submitted">I represent an archive, temple committee or collective</option><option value="compiled_from_public_sources">I compiled it from public references</option></select>}</Field>
          </fieldset>

          <fieldset className="panel step-panel" {...panel(1)}>
            <Mandala />
            <legend><h2 id="step-h-1" tabIndex={-1}>2. Image and licence</h2></legend>
            <Field name="image" label="Image (JPEG, PNG or WebP, up to 8 MB)" required error={fe.asset}>{(p) => (
              <div className={`sb-drop${fe.asset ? ' bad' : ''}`}>
                <input type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFile(e.target.files?.[0])} {...p} />
                {preview && <div className="sb-thumb"><img src={preview.url} alt="" /><span>{preview.name}</span></div>}
              </div>
            )}</Field>
            <Field name="alt" label="Describe the image (alt text)" error={fe.alt} hint="Say what a person who cannot see it would need to know.">{(p) => <input type="text" name="alt" placeholder="e.g. Performer in a red headdress and face paint" {...p} />}</Field>
            <Field name="licence" label="Licence for the image" required error={fe.licence}>{(p) => <select name="licence" {...p} defaultValue=""><option value="" disabled>Choose a licence</option>{LICENCE_IDS.map((l) => <option key={l} value={l}>{LICENCES[l].label}</option>)}</select>}</Field>
            <Field name="licenceSourceNote" label="Where the image and its licence come from" required error={fe.licenceSourceNote} hint="Photographer, website or publication, and the date you checked.">{(p) => <input type="text" name="licenceSourceNote" placeholder="e.g. Photo by Sarah Welch, Wikimedia Commons, checked Nov 2026" {...p} />}</Field>
            <Field name="imageSourceNote" label="Photo credit (optional)">{(p) => <input type="text" name="imageSourceNote" placeholder="e.g. Courtesy of Kerala Kalamandalam Archives" {...p} />}</Field>
            <div className="check-row"><input id="attributionRequired" type="checkbox" name="attributionRequired" defaultChecked /><label htmlFor="attributionRequired">Ask for credit whenever this image is reused</label></div>
          </fieldset>

          <div className="step-panel" {...panel(2)}>
            <fieldset className="panel">
              <Mandala />
              <legend><h2 id="step-h-2" tabIndex={-1}>3. Sources</h2></legend>
              <Field name="contextSources" label="Sources (one per line)" error={fe.contextSources} hint="Required if you compiled this from public references.">{(p) => <textarea name="contextSources" placeholder="e.g. Kurup, K.K.N. (1986). The Cult of Theyyam and Folk Miracles." {...p} />}</Field>
              <Field name="sourceUrl" label="Link to a reference (optional)">{(p) => <input type="url" name="sourceUrl" placeholder="https://" {...p} />}</Field>
            </fieldset>

            <fieldset className="panel">
              <legend><h2>Credits</h2></legend>
              {fe.credits && <p className="sb-callout" id="credits-err" role="alert"><Icon name="info" size={18} /><span>{fe.credits}</span></p>}
              <p className="hint">Credit the people, groups or communities behind the work. Photographers are credited as photographers, not as the cultural source.</p>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="field-grid sb-credit">
                  <Field name={`credit_name_${i}`} label={`Person or group ${i + 1}`}>{(p) => <input type="text" name={`credit_name_${i}`} placeholder="e.g. Balaramapuram Weavers Collective" {...p} />}</Field>
                  <Field name={`credit_role_${i}`} label="Role">{(p) => <input type="text" name={`credit_role_${i}`} placeholder="e.g. Master artisan, Performer" {...p} />}</Field>
                  <div className="check-row"><input id={`credit_collective_${i}`} type="checkbox" name={`credit_collective_${i}`} /><label htmlFor={`credit_collective_${i}`}>This is a group or community</label></div>
                </div>
              ))}
              <Field name="custodian" label="Community contact (optional)" hint="A body or trust to contact for cultural guidance or permissions.">{(p) => <input type="text" name="custodian" placeholder="e.g. Kerala Folklore Akademi" {...p} />}</Field>
            </fieldset>

            <fieldset className="panel">
              <legend><h2>Reuse permissions</h2></legend>
              <p className="hint">Record what the creator or community has said about reuse. If nothing has been said, leave it as “Not stated”. Never guess.</p>
              <div className="sb-two">
                {PERMS.map(([k, label]) => <Field key={k} name={`perm_${k}`} label={label} error={fe[`perm_${k}`]}>{(p) => <select name={`perm_${k}`} {...p} defaultValue="unspecified"><option value="unspecified">Not stated</option><option value="permitted">Permitted</option><option value="not_permitted">Not permitted</option></select>}</Field>)}
              </div>
            </fieldset>
          </div>

          <div className="btn-row sb-actions">
            <span className="sb-progress" aria-hidden="true">Step {step + 1} of {STEPS.length}</span>
            {step > 0 && <button type="button" className="secondary" onClick={() => setStep(step - 1)}>Back</button>}
            {step < STEPS.length - 1 && <button type="button" onClick={() => setStep(step + 1)}>Next: {STEPS[step + 1]} <Icon name="arrow" size={18} /></button>}
            {step === STEPS.length - 1 && (
              <button type="submit" disabled={pending}>
                {pending ? <LotusLoader size="xs" inline /> : null}
                {pending ? 'Submitting…' : 'Submit for review'}
              </button>
            )}
          </div>
          <noscript><style>{'.step-panel[hidden]{display:block!important}'}</style></noscript>
        </form>

        <aside className="sb-guide" aria-labelledby="sb-guide-h">
          <div className="sb-guide-head"><Icon name="file" size={28} /><h2 id="sb-guide-h">Submission Guidelines</h2></div>
          <ul>
            {GUIDE.map((g) => <li key={g}><span className="sb-tick" aria-hidden="true"><Icon name="check" size={16} /></span>{g}</li>)}
          </ul>
          <GuideWaves />
        </aside>
      </div>
    </>
  );
}
