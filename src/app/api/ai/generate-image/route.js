import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';

// --- KONFIGURASI BIAYA ---
const CREDIT_COST = 50;

// --- HELPER: GET USER ID ---
const getUserId = () => {
    const token = cookies().get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
        return decoded.userId;
    } catch (error) { return null; }
};

// --- HELPER: WRAP TEXT ---
function wrapText(ctx, text, x, y, maxWidth, lineHeight, align = 'left', maxLines = 10) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            if (lineCount >= maxLines - 1) { line += "..."; break; }
            if (align === 'center') ctx.fillText(line, x + (maxWidth - ctx.measureText(line).width) / 2, currentY);
            else if (align === 'right') ctx.fillText(line, x + maxWidth - ctx.measureText(line).width, currentY);
            else ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
            lineCount++;
        } else {
            line = testLine;
        }
    }
    if (align === 'center') ctx.fillText(line, x + (maxWidth - ctx.measureText(line).width) / 2, currentY);
    else if (align === 'right') ctx.fillText(line, x + maxWidth - ctx.measureText(line).width, currentY);
    else ctx.fillText(line, x, currentY);
    return currentY + lineHeight - y; 
}

// --- HELPER: HITUNG BARIS ---
function getWrappedTextLines(ctx, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const width = ctx.measureText(currentLine + " " + words[i]).width;
        if (width < maxWidth) { currentLine += " " + words[i]; } 
        else { lines.push(currentLine); currentLine = words[i]; }
    }
    lines.push(currentLine);
    return lines;
}

export async function POST(req) {
  try {
    // 1. CEK AUTH & SALDO
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId);
    if (!user || user.credits < CREDIT_COST) {
        return NextResponse.json({ message: "Poin tidak cukup. Silakan Top Up." }, { status: 402 });
    }

    // 2. TERIMA DATA
    const body = await req.json();
    const { prompt, title, slideTitle, slideBody, theme, ratio = "1:1", slideIndex = 0, customVisual, themeColor, artStyle } = body; 

    if (!prompt) return NextResponse.json({ message: "Prompt kosong" }, { status: 400 });

    // 3. SETUP API KEY (Opsional, agar tidak error jika env kosong)
    const apiKey = process.env.POLLINATIONS_API_KEY || ""; 

    // 4. SETUP DIMENSI
    let width = 1024, height = 1024;
    let orientationPrompt = "centered composition";
    if (ratio === "4:5") { width = 1080; height = 1350; orientationPrompt = "vertical portrait"; } 
    else if (ratio === "9:16") { width = 720; height = 1280; orientationPrompt = "tall vertical mobile wallpaper"; } 

    const displayTitle = title || "UPDATE TERKINI";
    const brandText = theme ? theme.toUpperCase() : "BERITA TERKINI"; 
    const isFirstSlide = slideIndex === 0;

    console.log(`📸 Generating Slide ${slideIndex+1} | Style: ${artStyle || 'Default'}`);

    // 5. GENERATE GAMBAR
    const styleKeyword = artStyle || "cinematic lighting, highly detailed, photorealistic, sharp focus";
    let visualObject = customVisual || prompt;
    if (isFirstSlide && !customVisual) {
        visualObject = `${prompt}, emotional expressive face, dramatic angle, visual storytelling`; 
    }

    // Gunakan Model FLUX (Terbaik saat ini)
    const fullPrompt = `${visualObject}, ${styleKeyword}, ${orientationPrompt}, 8k resolution, masterpiece`;
    const randomSeed = Math.floor(Math.random() * 1000000) + slideIndex;
    
    // URL Endpoint Pollinations
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${randomSeed}&model=flux&nologo=true&enhance=true`;

    // Fetch dengan Header Auth (Hanya Jika Key Ada)
    const fetchOptions = { method: 'GET' };
    if (apiKey) {
        fetchOptions.headers = { 'Authorization': `Bearer ${apiKey}` };
    }

    const response = await fetch(apiUrl, fetchOptions);
    if (!response.ok) {
        console.error("Pollinations Error:", response.statusText);
        throw new Error("Gagal mengambil gambar dari AI Server.");
    }
    const imageBuffer = await response.arrayBuffer();

    // 6. CANVAS DRAWING
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const bgImage = await loadImage(Buffer.from(imageBuffer));
    
    ctx.drawImage(bgImage, 0, 0, width, height);

    const scale = width / 1024; 
    const margin = Math.floor(60 * scale);
    const accentColor = themeColor || '#FFD700'; 

    if (isFirstSlide) {
        // SLIDE 1: COVER
        const gradient = ctx.createLinearGradient(0, height - (height * 0.7), 0, height);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.5, "rgba(0,0,0,0.6)");
        gradient.addColorStop(1, "rgba(0,0,0,0.95)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height - (height * 0.7), width, height * 0.7);

        let fontSize = Math.floor(64 * scale);
        ctx.font = `bold ${fontSize}px Arial`;
        const boxWidth = width - (margin * 2);
        
        let lines = getWrappedTextLines(ctx, displayTitle, boxWidth - margin);
        while (lines.length > 3 && fontSize > 30) { 
            fontSize -= 4; ctx.font = `bold ${fontSize}px Arial`; 
            lines = getWrappedTextLines(ctx, displayTitle, boxWidth - margin); 
        }

        const textBlockHeight = lines.length * (fontSize * 1.2);
        const startY = height - margin - textBlockHeight - (100 * scale);

        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor; ctx.shadowBlur = 15;
        ctx.fillRect(margin, startY, 10 * scale, textBlockHeight + (20*scale));
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10;
        
        let cursorY = startY + (fontSize * 0.8);
        lines.forEach(line => {
            ctx.fillText(line, margin + (30*scale), cursorY);
            cursorY += fontSize * 1.2;
        });
        ctx.shadowColor = 'transparent';

        ctx.font = `bold ${Math.floor(24*scale)}px Arial`;
        ctx.fillStyle = accentColor; 
        ctx.fillText(brandText + "  •  Geser 👉", margin + (30*scale), startY - (20*scale));

    } else {
        // SLIDE 2+: CONTENT
        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(margin/2, margin/2, width - margin, height - margin);

        const centerX = width / 2;
        const centerY = (ratio === "9:16") ? height * 0.4 : height * 0.5;

        const textTitle = slideTitle ? slideTitle.toUpperCase() : displayTitle.toUpperCase();
        let titleSize = Math.floor(72 * scale);
        ctx.font = `bold ${titleSize}px Arial`;
        
        let titleLines = getWrappedTextLines(ctx, textTitle, width - (margin * 3));
        while (titleLines.length > 3 && titleSize > 30) { 
            titleSize -= 4; ctx.font = `bold ${titleSize}px Arial`; 
            titleLines = getWrappedTextLines(ctx, textTitle, width - (margin * 3)); 
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF'; 
        ctx.shadowColor = accentColor; ctx.shadowBlur = 20; 
        
        let cursorY = centerY - ((titleLines.length * titleSize * 1.2) / 2) - (60 * scale);
        titleLines.forEach(l => { ctx.fillText(l, centerX, cursorY); cursorY += titleSize * 1.2; });
        
        ctx.shadowBlur = 0; 
        ctx.fillStyle = accentColor;
        ctx.fillRect(centerX - (40*scale), cursorY + (10*scale), 80*scale, 4*scale);
        cursorY += 70 * scale;

        if (slideBody) {
            let bodySize = Math.floor(36 * scale);
            ctx.font = `normal ${bodySize}px Arial`;
            let bodyLines = getWrappedTextLines(ctx, slideBody, width - (margin * 3));
            while (bodyLines.length > 7 && bodySize > 20) {
                 bodySize -= 2; ctx.font = `normal ${bodySize}px Arial`;
                 bodyLines = getWrappedTextLines(ctx, slideBody, width - (margin * 3));
            }
            ctx.fillStyle = '#EEEEEE'; 
            bodyLines.forEach(l => { 
                ctx.fillText(l, centerX, cursorY); 
                cursorY += bodySize * 1.5; 
            });
        }
        ctx.fillStyle = accentColor;
        ctx.font = `bold ${Math.floor(20*scale)}px Arial`;
        ctx.fillText(brandText, centerX, height - (margin));
    }

    // 7. POTONG POIN SETELAH SUKSES
    await User.findByIdAndUpdate(userId, { $inc: { credits: -CREDIT_COST } });

    return NextResponse.json({ success: true, imageUrl: canvas.toDataURL('image/jpeg', 0.95) });

  } catch (error) {
    console.error("🔥 Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}