/**
 * Utility untuk mengambil berita Real-Time dari Google News RSS
 * Target: Berita Indonesia (ID)
 */

export async function getRealTimeNews(query) {
  try {
    if (!query) return null;

    // 1. Setup URL Google News RSS (Region Indonesia)
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=id-ID&gl=ID&ceid=ID:id`;

    // 2. Fetch Data
    const response = await fetch(rssUrl, {
      method: 'GET',
      headers: {
        // User Agent agar tidak diblokir Google
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 300 } // Cache data selama 5 menit (Next.js Feature)
    });

    if (!response.ok) {
      console.error(`News Fetch Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const xmlText = await response.text();

    // 3. Parsing XML Manual (Regex) - Lebih ringan daripada install library XML parser
    // Ambil tag <item>...</item> (Batasi 5 berita teratas)
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g)?.slice(0, 5) || [];

    if (items.length === 0) return null;

    // 4. Format Data
    const newsList = items.map(item => {
        // Ambil Title
        let title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
        
        // Bersihkan Nama Media (misal: "Judul Berita - Detik.com" -> "Judul Berita")
        title = title.split(' - ')[0]; 
        
        // Decode HTML Entities sederhana
        title = title
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'");

        // Ambil Tanggal Publish
        const pubDateRaw = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
        let dateStr = "";
        
        if (pubDateRaw) {
            try {
                const dateObj = new Date(pubDateRaw);
                // Format: "2 Feb 2024"
                dateStr = dateObj.toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                });
            } catch (e) {}
        }

        return dateStr ? `- ${title} (${dateStr})` : `- ${title}`;
    });

    // Gabungkan jadi satu string text
    return newsList.join("\n");

  } catch (error) {
    console.error("News Scraper Fatal Error:", error);
    return null;
  }
}