export const siteUrl = () =>
  (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://mudra-one-ivory.vercel.app')
  ).replace(/\/$/, '');
export const siteOrigin = siteUrl;
export const recordUrl = (id: string) => `${siteUrl()}/r/${id}`;
