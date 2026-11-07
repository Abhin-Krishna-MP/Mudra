/** Roles allowed to submit drafts. Widen this one list if reviewers/admins should be able to submit too. Edge-safe (no imports). */
export const SUBMIT_ROLES = ['author'] as const;
export const canSubmit = (role: string | null | undefined): boolean => !!role && (SUBMIT_ROLES as readonly string[]).includes(role);
