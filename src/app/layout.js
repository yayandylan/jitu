import { Poppins } from "next/font/google";
import "./globals.css";

// Konfigurasi Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins", // CSS Variable
});

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      {/* Kita pasang class font-poppins di body */}
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}