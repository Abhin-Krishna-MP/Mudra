export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const recordUrl = (id: string) => `${siteUrl()}/r/${id}`;
