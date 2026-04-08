import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface PrintJobData {
  paperSizeMm: { width: number, height: number };
  backgroundUrl: string | null;
  textBlocks: { text: string, x: number, y: number, size: number, colorHex: string, fontFamily?: string }[];
}

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

  /**
   * 최종 데이터를 합성하여 PDF Binary (Uint8Array) 형태로 반환합니다.
   */
  static async generatePdf(jobData: PrintJobData): Promise<Uint8Array | null> {
    try {
      const pdfDoc = await PDFDocument.create();
      
      // Fontkit 등록 (한글 TTF/OTF 파일 사용을 위해 필수)
      pdfDoc.registerFontkit(fontkit);

      // mm -> points 변환 (1mm = 2.83465 pt)
      const ptWidth = jobData.paperSizeMm.width * 2.83465;
      const ptHeight = jobData.paperSizeMm.height * 2.83465;
      
      const page = pdfDoc.addPage([ptWidth, ptHeight]);

      // 브라우저에서 사용할 한글 웹 폰트 (대표적으로 Pretendard 폰트 파일을 외부에서 Fetch하여 주입)
      let defaultCustomFont;
      try {
        const pretendardUrl = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/public/static/Pretendard-Regular.otf';
        const fontBytes = await fetch(pretendardUrl).then(res => res.arrayBuffer());
        defaultCustomFont = await pdfDoc.embedFont(fontBytes);
      } catch (e) {
        console.warn('Failed to fetch generic TTF, falling back to standard font', e);
        defaultCustomFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      // 배경 이미지가 있다면 (임시: 브라우저 환경에서 fetch 불가능한 CORS 문제는 우회 필요)
      if (jobData.backgroundUrl) {
        try {
          const imgUrl = jobData.backgroundUrl;
          let imgBytes;
          if (imgUrl.startsWith('data:image')) {
            // Data URL
            const base64Str = imgUrl.split(',')[1];
            const binaryString = window.atob(base64Str);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            imgBytes = bytes.buffer;
          } else {
             const imgRes = await fetch(imgUrl);
             imgBytes = await imgRes.arrayBuffer();
          }

          let pdfImage;
          if (imgUrl.toLowerCase().includes('.png') || imgUrl.startsWith('data:image/png')) {
            pdfImage = await pdfDoc.embedPng(imgBytes);
          } else {
            pdfImage = await pdfDoc.embedJpg(imgBytes);
          }
          page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: ptWidth,
            height: ptHeight,
          });
        } catch (imgError) {
          console.warn('Failed to embed background image', imgError);
        }
      }

      // 텍스트 블록 그리기
      for (const block of jobData.textBlocks) {
        const color = this.hexToRgb(block.colorHex);
        
        // CSS Canvas의 좌표계를 역산 반영.
        const pdfX = (block.x / 3) * 2.83465;
        const pdfY = ptHeight - ((block.y / 3) * 2.83465) - block.size;
        
        page.drawText(block.text || '', {
          x: pdfX,
          y: pdfY,
          size: block.size,
          font: defaultCustomFont,
          color: rgb(color.r, color.g, color.b),
        });
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
