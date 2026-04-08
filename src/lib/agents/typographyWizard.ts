/**
 * Typography Wizard (폰트김)
 * 전문 분야: 글자 수 기반 포매팅, 줄바꿈(Word Wrap), 크기 최적화(Auto Scaling)
 */

export class TypographyWizard {
  /**
   * 지정된 최대 가로 너비(Pixel)를 넘지 않도록 문장을 줄바꿈 처리합니다.
   * 추후 PDF-lib 또는 Canvas에서 폰트 너비를 정확히 계산할 때 확장됩니다.
   */
  static applyWordWrap(text: string, maxWidthPx: number, fontSize: number): string[] {
    // 임시 더미 로직: 대략적인 한 글자당 픽셀(fontSize * 0.8)을 기준으로 글자를 자름
    const avgCharWidth = fontSize * 0.8;
    const maxCharsPerLine = Math.floor(maxWidthPx / avgCharWidth);

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      if ((currentLine + word).length > maxCharsPerLine) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    
    if (currentLine) lines.push(currentLine.trim());

    return lines;
  }

  /**
   * 텍스트 양이 많을 경우 Bounding Box에 안전하게 들어가도록 폰트 사이즈를 동적으로 스케일다운합니다.
   */
  static getOptimalFontSize(text: string, boxWidth: number, boxHeight: number, defaultFontSize: number = 24): number {
    // TODO: 고도화된 계산 알고리즘 배치
    if (text.length > 50) return defaultFontSize * 0.75;
    if (text.length > 100) return defaultFontSize * 0.5;
    return defaultFontSize;
  }
}
