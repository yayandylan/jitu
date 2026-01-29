export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/site/'], // Halaman privat jangan diindeks
    },
    sitemap: 'https://jitudigital.com/sitemap.xml', // Ganti domain asli
  }
}