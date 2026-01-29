import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Tarik Data dari OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
        // Menggunakan env variable atau fallback ke localhost
        "Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Jitu Digital Admin", 
      }
    });
    
    const data = await response.json();
    
    if (!data.data) {
      throw new Error("Data model tidak ditemukan dari OpenRouter");
    }

    // 2. Setting Konstanta
    const KURS_DOLLAR = 16000; 
    const AVG_TOKENS_PER_GEN = 2500; // Estimasi rata-rata token per klik

    // 3. Mapping Data
    const models = data.data.map(model => {
      // Harga raw per 1 token (USD)
      const promptPriceUSD = parseFloat(model.pricing.prompt);
      const completionPriceUSD = parseFloat(model.pricing.completion);

      // --- LOGIC DISPLAY (Untuk Label Dropdown) ---
      // Kita hitung rata-rata harga per 1 Juta Token dalam Rupiah
      const avgPricePerTokenUSD = (promptPriceUSD + completionPriceUSD) / 2;
      const costPer1M_IDR = avgPricePerTokenUSD * 1000000 * KURS_DOLLAR;
      
      // Estimasi HPP per 1x Generate (2500 token) dalam Rupiah
      const hppEstimasi = (avgPricePerTokenUSD * AVG_TOKENS_PER_GEN) * KURS_DOLLAR;

      return {
        id: model.id,
        name: model.name,
        
        // DATA DISPLAY (User Friendly)
        priceLabel: `Rp ${Math.round(costPer1M_IDR).toLocaleString('id-ID')} / 1M Token`, 
        
        // DATA KALKULATOR (PENTING UNTUK FRONTEND)
        // Kita kirim harga raw per token agar kalkulator margin di frontend tetap presisi
        perTokenPrompt: promptPriceUSD,
        perTokenCompletion: completionPriceUSD,
        
        // Info tambahan (Opsional)
        estimatedHpp: hppEstimasi 
      };
    });

    // 4. Urutkan A-Z
    models.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(models);

  } catch (error) {
    console.error("Gagal sinkron harga model:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}