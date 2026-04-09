import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const theme = body.theme || 'modern';
    const description = body.description || '';

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const uiPrompt = `
      You are a professional abstract card designer. 
      Generate a premium aesthetic design configuration for a "${theme}" themed card.
      User request: "${description}"
      
      Response must be ONLY JSON:
      {
        "primaryColor": "hex",
        "secondaryColor": "hex",
        "gradientType": "linear|radial",
        "gradientAngle": number,
        "patternType": "dots|lines|waves|none",
        "patternColor": "hex",
        "textColor": "hex",
        "artworkPath": "svg path data for a beautiful abstract shape",
        "artScale": number
      }
    `;

    const result = await model.generateContent(uiPrompt);
    const design = JSON.parse(result.response.text());

    const svg = `
      <svg width="1200" height="1800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${design.gradientAngle || 45})">
            <stop offset="0%" stop-color="${design.primaryColor}" />
            <stop offset="100%" stop-color="${design.secondaryColor}" />
          </linearGradient>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncR type="linear" slope="0.3"/><feFuncG type="linear" slope="0.3"/><feFuncB type="linear" slope="0.3"/></feComponentTransfer>
          </filter>
          ${renderPattern(design.patternType, design.patternColor)}
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
        <path d="${design.artworkPath}" fill="white" opacity="0.15" transform="translate(600, 900) scale(${design.artScale || 4}) translate(-100,-100)" />
        <rect width="100%" height="100%" fill="url(#pattern)" opacity="0.2" />
        <rect width="100%" height="100%" fill="transparent" filter="url(#noise)" opacity="0.1" style="mix-blend-mode: overlay" />
      </svg>
    `;

    return NextResponse.json({
      imageUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      textColor: design.textColor || '#1E293B'
    });

  } catch (error: any) {
    console.error('AI Image Generation Failed:', error);
    return NextResponse.json({ 
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSIxODAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOGZhZmMiLz48L3N2Zz4=',
      error: 'Design engine fallback'
    });
  }
}

function renderPattern(type: string, color: string): string {
  switch (type) {
    case 'dots': return `<pattern id="pattern" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="${color}"/></pattern>`;
    case 'lines': return `<pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1" height="40" fill="${color}"/></pattern>`;
    case 'waves': return `<pattern id="pattern" width="100" height="40" patternUnits="userSpaceOnUse"><path d="M0 20 Q 25 30 50 20 T 100 20" stroke="${color}" stroke-width="2" fill="none"/></pattern>`;
    default: return `<pattern id="pattern" width="1" height="1"></pattern>`;
  }
}
