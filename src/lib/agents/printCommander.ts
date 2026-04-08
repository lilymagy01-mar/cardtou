import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface PrintPageData {
  backgroundUrl: string | null;
  frontBackgroundUrl?: string | null;
  backBackgroundUrl?: string | null;
  textBlocks: { 
    text: string, 
    x: number, 
    y: number, 
    size: number, 
    colorHex: string, 
    fontFamily?: string,
    textAlign?: 'left' | 'center' | 'right'
  }[];
  imageBlocks?: {
    url: string | null,
    x: number,
    y: number,
    width: number,
    height: number,
    isPrintable: boolean
  }[];
}

export interface PrintJobData {
  paperSizeMm: { width: number, height: number };
  pages?: PrintPageData[]; // 신규 멀티페이지 포맷
  backgroundUrl?: string | null; // 레거시 지원
  textBlocks?: any[];           // 레거시 지원
  labelType?: string;
}

const LABEL_CONFIGS: Record<string, {
  cells: number;
  cols: number;
  widthMm: number;
  heightMm: number;
  marginTopMm: number;
  marginLeftMm: number;
  hGapMm: number;
  vGapMm: number;
}> = {
  'formtec-3101': { cells: 1, cols: 1, widthMm: 210, heightMm: 297, marginTopMm: 0, marginLeftMm: 0, hGapMm: 0, vGapMm: 0 },
  'formtec-3102': { cells: 2, cols: 1, widthMm: 199.6, heightMm: 143.5, marginTopMm: 5, marginLeftMm: 5.2, hGapMm: 0, vGapMm: 0 },
  'formtec-3104': { cells: 4, cols: 2, widthMm: 99.1, heightMm: 143.5, marginTopMm: 5, marginLeftMm: 5, hGapMm: 2, vGapMm: 0 },
  'formtec-3107': { cells: 6, cols: 2, widthMm: 99.1, heightMm: 93.1, marginTopMm: 8.5, marginLeftMm: 5, hGapMm: 2, vGapMm: 0 },
  'formtec-3108': { cells: 8, cols: 2, widthMm: 99.1, heightMm: 67.7, marginTopMm: 13, marginLeftMm: 5, hGapMm: 2, vGapMm: 0 },
  'formtec-3109': { cells: 12, cols: 2, widthMm: 99.1, heightMm: 45.0, marginTopMm: 11, marginLeftMm: 5, hGapMm: 2, vGapMm: 0 }
};

export class PrintCommander {
  
  static hexToRgb(hex: string) {
    const defaultColor = { r: 0, g: 0, b: 0 };
    if (!hex) return defaultColor;
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return defaultColor;
    return {
      r: parseInt(cleanHex.substring(0, 2), 16) / 255,
      g: parseInt(cleanHex.substring(2, 4), 16) / 255,
      b: parseInt(cleanHex.substring(4, 6), 16) / 255,
    };
  }

  static async generatePdf(jobData: PrintJobData): Promise<Uint8Array | null> {
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // 폰트 리소스 맵핑 (로컬 에셋 전략)
      const FONT_URLS: Record<string, string> = {
        'Jua': '/fonts/Jua-Regular.ttf',
        'Gugi': '/fonts/Gugi-Regular.ttf',
        'Pen': '/fonts/NanumPenScript-Regular.ttf',
        'Noto': '/fonts/Pretendard-Regular.otf',
        'default': '/fonts/Pretendard-Regular.otf'
      };

      const embeddedFonts: Record<string, any> = {};
      
      // 최중요: 어떤 상황에서도 인쇄가 가능하도록 표준 폰트(Helvetica)를 기본값으로 로드
      const standardFont = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
      embeddedFonts['fallback'] = standardFont;

      const loadFont = async (name: string, url: string) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const bytes = await response.arrayBuffer();
          embeddedFonts[name] = await pdfDoc.embedFont(bytes);
        } catch (e) {
          console.error(`Font load failed: ${name} (${url}). Using fallback.`, e);
          // 실패 시 표준 폰트로 대체하여 프로세스 중단 방지
          embeddedFonts[name] = standardFont;
        }
      };

      // 병렬로 폰트 로드
      await Promise.all([
        loadFont('Jua', FONT_URLS['Jua']),
        loadFont('Gugi', FONT_URLS['Gugi']),
        loadFont('Pen', FONT_URLS['Pen']),
        loadFont('default', FONT_URLS['default'])
      ]);

      const getFont = (family?: string) => {
        if (!family) return embeddedFonts['default'] || embeddedFonts['fallback'];
        if (family.includes('Jua')) return embeddedFonts['Jua'] || embeddedFonts['fallback'];
        if (family.includes('Gugi')) return embeddedFonts['Gugi'] || embeddedFonts['fallback'];
        if (family.includes('Pen')) return embeddedFonts['Pen'] || embeddedFonts['fallback'];
        return embeddedFonts['default'] || embeddedFonts['fallback'];
      };

      // 페이지 리스트 구성
      const renderPages: PrintPageData[] = jobData.pages || [
        { backgroundUrl: jobData.backgroundUrl || null, textBlocks: jobData.textBlocks || [] }
      ];

      for (const renderData of renderPages) {
        const config = jobData.labelType ? LABEL_CONFIGS[jobData.labelType] : null;
        const isGrid = !!config;
        
        const finalPaperWidthMm = isGrid ? 210 : jobData.paperSizeMm.width;
        const finalPaperHeightMm = isGrid ? 297 : jobData.paperSizeMm.height;

        const ptWidth = finalPaperWidthMm * 2.83465;
        const ptHeight = finalPaperHeightMm * 2.83465;
        
        const page = pdfDoc.addPage([ptWidth, ptHeight]);

        const embedImage = async (url: string) => {
          try {
            let imgBytes;
            if (url.startsWith('data:image')) {
              const base64Str = url.split(',')[1];
              imgBytes = Uint8Array.from(atob(base64Str), c => c.charCodeAt(0)).buffer;
            } else {
              imgBytes = await fetch(url).then(res => res.arrayBuffer());
            }
            return url.toLowerCase().includes('.png') || url.startsWith('data:image/png') 
              ? await pdfDoc.embedPng(imgBytes) 
              : await pdfDoc.embedJpg(imgBytes);
          } catch (e) {
            console.warn('Embed Error', url, e);
            return null;
          }
        };

        let bgImage, frontBgImage, backBgImage;
        if (renderData.backgroundUrl) bgImage = await embedImage(renderData.backgroundUrl);
        if (renderData.frontBackgroundUrl) frontBgImage = await embedImage(renderData.frontBackgroundUrl);
        if (renderData.backBackgroundUrl) backBgImage = await embedImage(renderData.backBackgroundUrl);

        const repeatCount = isGrid ? config.cells : 1;
        
        for (let i = 0; i < repeatCount; i++) {
          let offsetX = 0;
          let offsetY = 0;
          let cellWidth = ptWidth;
          let cellHeight = ptHeight;

          if (isGrid) {
            const col = i % config.cols;
            const row = Math.floor(i / config.cols);
            cellWidth = config.widthMm * 2.83465;
            cellHeight = config.heightMm * 2.83465;
            offsetX = (config.marginLeftMm + (col * (config.widthMm + config.hGapMm))) * 2.83465;
            offsetY = ptHeight - ((config.marginTopMm + (row * (config.heightMm + config.vGapMm)) + config.heightMm)) * 2.83465;
          }

          if (bgImage) {
            page.drawImage(bgImage, { x: offsetX, y: offsetY, width: cellWidth, height: cellHeight });
          }
          if (backBgImage) {
            // Left half
            page.drawImage(backBgImage, { 
              x: offsetX, 
              y: offsetY, 
              width: cellWidth / 2, 
              height: cellHeight 
            });
          }
          if (frontBgImage) {
            // Right half
            page.drawImage(frontBgImage, { 
              x: offsetX + (cellWidth / 2), 
              y: offsetY, 
              width: cellWidth / 2, 
              height: cellHeight 
            });
          }

          // Render Image Blocks
          if (renderData.imageBlocks) {
            for (const imgBlock of renderData.imageBlocks) {
              if (!imgBlock.isPrintable || !imgBlock.url) continue;
              const img = await embedImage(imgBlock.url);
              if (img) {
                const imgW = (imgBlock.width / jobData.paperSizeMm.width) * cellWidth;
                const imgH = (imgBlock.height / jobData.paperSizeMm.height) * cellHeight;
                page.drawImage(img, {
                  x: offsetX + ((imgBlock.x / jobData.paperSizeMm.width) * cellWidth) - (imgW / 2),
                  y: offsetY + cellHeight - ((imgBlock.y / jobData.paperSizeMm.height) * cellHeight) - (imgH / 2),
                  width: imgW,
                  height: imgH
                });
              }
            }
          }

          for (const block of renderData.textBlocks) {
            const color = this.hexToRgb(block.colorHex);
            const font = getFont(block.fontFamily);
            
            // X, Y 좌표 계산 (mm -> pt)
            // 화면 좌표 (pixel)를 mm 비율로 변환하여 배치
            // 현재 화면 주석 기준 105mm (카드 너비)를 기준으로 x가 배치됨
            let pdfX = offsetX + ((block.x / (jobData.paperSizeMm.width || 210)) * cellWidth);
            const pdfY = offsetY + cellHeight - ((block.y / (jobData.paperSizeMm.height || 297)) * cellHeight) - (block.size * 0.8);
            
            if (block.textAlign && block.textAlign !== 'left') {
              const textWidth = font.widthOfTextAtSize(block.text, block.size);
              if (block.textAlign === 'center') {
                pdfX -= (textWidth / 2);
              } else if (block.textAlign === 'right') {
                pdfX -= textWidth;
              }
            }

            page.drawText(block.text || '', {
              x: pdfX,
              y: pdfY,
              size: block.size,
              font: font,
              color: rgb(color.r, color.g, color.b),
            });
          }
        }
        if (isGrid) break;
      }

      return await pdfDoc.save();
    } catch (e) {
      console.error('PDF Generation Failed:', e);
      return null;
    }
  }

  /**
   * 브라우저에서 생성된 PDF를 로컬 연결된 프린터 스풀러로 팝업 시킵니다.
   */
  static triggerPrintPopup(pdfBytes: Uint8Array, filename: string = 'output.pdf') {
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    const printWindow = window.open(blobUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
}
