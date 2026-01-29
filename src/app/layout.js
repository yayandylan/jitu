import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: 'swap',
});

export const metadata = {
  title: {
    default: "Jitu Digital | AI Marketing Intelligence Platform",
    template: "%s | Jitu Digital"
  },
  description: "Platform intelijen digital no.1 di Indonesia. Riset produk, validasi market, dan audit iklan otomatis dengan AI.",
  keywords: ["AI Marketing", "Riset Produk", "Copywriting AI", "Digital Marketing Indonesia", "Jitu Digital", "Cek Iklan"],
  authors: [{ name: "Jitu Team" }],
  creator: "Jitu Digital HQ",
  metadataBase: new URL('https://jitudigital.com'), // Ganti domain asli nanti
  openGraph: {
    title: "Jitu Digital | Iklan Profit Adalah Jitu",
    description: "Validasi market & riset produk dalam hitungan detik. Berhenti boncos sekarang.",
    siteName: "Jitu Digital",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jitu Digital AI",
    description: "Senjata rahasia advertiser Indonesia.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${poppins.variable} font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}