import { redirect } from 'next/navigation';

export default function SiteRootPage() {
  // Otomatis lempar ke Dashboard saat user buka /site
  redirect('/site/dashboard');
}