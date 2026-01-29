import { ImageResponse } from 'next/og';

// Konfigurasi Gambar
export const runtime = 'edge';
export const alt = 'Jitu Digital - AI Marketing Intelligence Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  // Kita fetch font Poppins biar desainnya senada dengan website
  // (Menggunakan fetch standard ke Google Fonts)
  const fontSemiBold = await fetch(
    new URL('https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const fontBlack = await fetch(
    new URL('https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLBT5Z1xlFQ.woff2', import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      // --- DESAIN GAMBAR (CSS-in-JS) ---
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A', // Slate-900
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          position: 'relative',
        }}
      >
        {/* Ambient Glow Effects */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'rgba(37, 99, 235, 0.2)', // Blue-600 with opacity
            filter: 'blur(100px)',
            borderRadius: '100%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'rgba(79, 70, 229, 0.2)', // Indigo-600 with opacity
            filter: 'blur(100px)',
            borderRadius: '100%',
          }}
        />

        {/* Logo Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px',
            zIndex: 10,
          }}
        >
          {/* Icon Petir (SVG simulated with div for simplicity in OG) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              backgroundColor: '#2563EB', // Blue-600
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(37, 99, 235, 0.5)',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="white"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 60,
                fontFamily: 'PoppinsBlack',
                color: 'white',
                lineHeight: 1,
                letterSpacing: '-2px',
                fontStyle: 'italic',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              JITU <span style={{ color: '#3B82F6', marginLeft: '10px', fontStyle: 'normal' }}>DIGITAL</span>
            </div>
          </div>
        </div>

        {/* Main Headline */}
        <div
          style={{
            fontSize: 70,
            fontFamily: 'PoppinsBlack',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            textTransform: 'uppercase',
            maxWidth: '900px',
            zIndex: 10,
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>Iklan Profit</span>
          <span
            style={{
              backgroundImage: 'linear-gradient(90deg, #60A5FA, #A78BFA)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Adalah Jitu.
          </span>
        </div>

        {/* Subtitle / Tagline */}
        <div
          style={{
            fontSize: 24,
            fontFamily: 'PoppinsSemiBold',
            color: '#94A3B8', // Slate-400
            textAlign: 'center',
            marginTop: '30px',
            maxWidth: '800px',
            zIndex: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          AI Marketing Intelligence Platform
        </div>

        {/* Features Pills */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '50px',
            zIndex: 10,
          }}
        >
          {['Riset Produk', 'Validasi Market', 'Audit Iklan', 'Copywriting'].map((item) => (
            <div
              key={item}
              style={{
                padding: '10px 20px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50px',
                fontSize: 16,
                fontFamily: 'PoppinsSemiBold',
                color: '#E2E8F0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    // Options
    {
      ...size,
      fonts: [
        {
          name: 'PoppinsSemiBold',
          data: fontSemiBold,
          style: 'normal',
          weight: 600,
        },
        {
          name: 'PoppinsBlack',
          data: fontBlack,
          style: 'normal',
          weight: 900,
        },
      ],
    }
  );
}