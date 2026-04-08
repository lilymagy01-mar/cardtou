import { NextResponse } from 'next/server';

/**
 * AI 이미지 생성 API 라우트
 * 현재는 시뮬레이션 모드로 작동하며, 추후 실제 AI 서비스(Google Gemini, Stability AI 등)와 연결 가능합니다.
 */
export async function POST(request: Request) {
  try {
    const { theme, prompt } = await request.json();

    // [SIMULATION] 실제 API 연동 시 이 부분을 서비스 호출 로직으로 교체하세요.
    // 예: const imageUrl = await stabilityAI.generate(prompt);
    
    // 시뮬레이션용 더미 이미지 URL (Unsplash 활용)
    const themeToKeyword: Record<string, string> = {
      romantic: 'flower-pink',
      modern: 'abstract-blue',
      vintage: 'paper-texture',
      calm: 'nature-serene'
    };

    const keyword = themeToKeyword[theme] || 'background';
    const mockImageUrl = `https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop`; // 예시용
    
    // 실제 운영 시에는 서브 에이전트나 외부 API를 통해 생성된 이미지 URL을 반환합니다.
    await new Promise(resolve => setTimeout(resolve, 1500)); // 생성 중인 느낌을 위한 딜레이

    return NextResponse.json({
      imageUrl: mockImageUrl,
      revisedPrompt: prompt,
      theme: theme
    });

  } catch (error) {
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
