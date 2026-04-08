/**
 * The Layout Architect (각도기)
 * 전문 분야: 인쇄 규격 변환 및 접선(Folding) 좌표 설계 전문가
 */

export interface DimensionOptions {
  widthMm: number;
  heightMm: number;
  dpi?: number;
}

export class LayoutArchitect {
  private static MM_IN_INCH = 25.4;

  /**
   * mm 단위를 지정된 DPI 기반의 Pixel 단위로 변환합니다.
   * @param mm 밀리미터 물리적 길이
   * @param dpi 해상도 (기본 300)
   */
  static mmToPx(mm: number, dpi: number = 300): number {
    return (mm * dpi) / this.MM_IN_INCH;
  }

  /**
   * 주어진 용지 크기에 맞추어, 접었을 때 특정 영역이 중앙/우측에 오도록 좌표를 산출합니다.
   * @param dimension 용지 전체 규격
   * @param isFolded 반으로 접는 형태의 카드인지 여부
   */
  static calculateCoordinates(dimension: DimensionOptions, isFolded: boolean) {
    const dpi = dimension.dpi || 300;
    const fullWidthPx = this.mmToPx(dimension.widthMm, dpi);
    const fullHeightPx = this.mmToPx(dimension.heightMm, dpi);

    if (isFolded) {
      // 예를 들어 가로로 긴 형태를 반으로 접는 경우
      return {
        safeZoneX: fullWidthPx / 2, // 접은 후 우측면 시작점
        safeZoneY: 0,
        safeWidth: fullWidthPx / 2,
        safeHeight: fullHeightPx,
        foldingLineX: fullWidthPx / 2,
      };
    }

    return {
      safeZoneX: 0,
      safeZoneY: 0,
      safeWidth: fullWidthPx,
      safeHeight: fullHeightPx,
      foldingLineX: null,
    };
  }
}
