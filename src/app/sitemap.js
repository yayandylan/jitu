export default async function sitemap() {
  const baseUrl = 'https://jitudigital.com'; // Ganti domain asli

  const routes = [
    '',
    '/login',
    '/register',
    '/site/tools/riset-produk',
    '/site/tools/validasi-market',
    '/site/tools/magic-ad-script',
    '/site/tools/analisis-iklan',
    '/site/tools/landing-page',
    '/site/tools/generate-image',
    '/site/tools/kalkulator-ads',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}