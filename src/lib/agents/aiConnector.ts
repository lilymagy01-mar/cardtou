/**
 * AI Connector (샘플리 연동 모듈)
 * 전문 분야: 프롬프트 엔지니어링, 이미지 생성 API 통신, 배경 최적화
 */

export interface AIGenerationResponse {
  imageUrl: string;
  revisedPrompt: string;
  theme: string;
}

export class AIConnector {
  /**
   * 테마별 최적화된 프롬프트를 생성합니다.
   */
  private static getThemePrompt(theme: string): string {
    const basePrompt = "Professional high-quality card background, aesthetic, clean, minimalistic, no text, 4k resolution.";
    
    switch (theme) {
      case 'romantic':
        return `${basePrompt} soft pink and gold colors, floral patterns, heart motifs, elegant style.`;
      case 'modern':
        return `${basePrompt} abstract geometric shapes, blue and silver accents, sleek architecture inspiration.`;
      case 'vintage':
        return `${basePrompt} sepia tones, aged paper texture, botanical illustrations, traditional craft feel.`;
      case 'calm':
        return `${basePrompt} serene landscape, watercolors, pastel blue and green, foggy mountains or ocean.`;
      default:
        return basePrompt;
    }
  }

  /**
   * AI 이미지 생성을 요청합니다. (프록시 API 호출)
   */
  static async generateBackground(theme: string): Promise<AIGenerationResponse> {
    const prompt = this.getThemePrompt(theme);
    
    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, prompt }),
      });

      if (!response.ok) throw new Error('AI generation failed');
      
      return await response.json();
    } catch (error) {
      console.error('AIConnector Error:', error);
      throw error;
    }
  }
}
