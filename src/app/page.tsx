'use client';

import { useEditorStore } from '@/store/useEditorStore';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { Type, Image as ImageIcon, Download, Settings } from 'lucide-react';

export default function Home() {
  const { 
    addTextBlock, 
    setBackgroundUrl, 
    selectedBlockId, 
    textBlocks, 
    updateTextBlockContent,
    removeTextBlock,
    currentDimension,
    backgroundUrl,
    saveDesign,
    loadDesign,
    setDimension
  } = useEditorStore();

  const PAPER_PRESETS = [
    { label: '엽서 (105 x 148mm)', widthMm: 105, heightMm: 148 },
    { label: 'A5 (148 x 210mm)', widthMm: 148, heightMm: 210 },
    { label: 'A4 (210 x 297mm)', widthMm: 210, heightMm: 297 },
    { label: 'B5 (182 x 257mm)', widthMm: 182, heightMm: 257 },
  ];

  const selectedBlock = textBlocks.find(b => b.id === selectedBlockId);

  const handleAddText = () => {
    addTextBlock({
      text: '새로운 텍스트',
      x: 50,
      y: 50,
      fontSize: 24,
      colorHex: '#333333',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBackgroundUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = async () => {
    const { PrintCommander } = await import('@/lib/agents/printCommander');
    const pdfBytes = await PrintCommander.generatePdf({
      paperSizeMm: { 
        width: currentDimension.widthMm, 
        height: currentDimension.heightMm 
      },
      backgroundUrl: backgroundUrl,
      textBlocks: textBlocks.map(b => ({
        text: b.text,
        x: b.x,
        y: b.y,
        size: b.fontSize,
        colorHex: b.colorHex
      }))
    });

    if (pdfBytes) {
      PrintCommander.triggerPrintPopup(pdfBytes);
    } else {
      alert('PDF 생성에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gugi&family=Jua&family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@400;700&display=swap');
      `}</style>
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          카드투유 (CardToYou) Editor
        </h1>
        <div className="flex gap-3">
          <button onClick={loadDesign} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-sm">
            불러오기
          </button>
          <button onClick={saveDesign} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-sm">
            저장
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium">
            <Settings size={18} /> 설정
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
          >
            <Download size={18} /> 출력(PDF)
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-80 bg-white border-r border-gray-200 p-4 shrink-0 flex flex-col gap-4 z-10 shadow-sm overflow-y-auto">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">도구</h2>
          
          <button 
            onClick={handleAddText}
            className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition text-gray-700 font-medium group"
          >
            <Type size={20} className="group-hover:text-blue-600 text-gray-500" /> 텍스트 추가
          </button>
          
          <label className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition text-gray-700 font-medium group cursor-pointer">
            <ImageIcon size={20} className="group-hover:text-purple-600 text-gray-500" /> 배경 이미지 업로드
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>

          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">프레임 (용지 크기)</label>
            <select 
              value={`${currentDimension.widthMm}x${currentDimension.heightMm}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                if (w && h) setDimension({ widthMm: w, heightMm: h });
              }}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              {PAPER_PRESETS.map(preset => (
                <option key={preset.label} value={`${preset.widthMm}x${preset.heightMm}`}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Properties Panel */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">속성 제어</h2>
            {!selectedBlock ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500 text-center">
                캔버스의 텍스트를 클릭하여 편집하세요.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">내용</label>
                  <textarea 
                    value={selectedBlock.text}
                    onChange={async (e) => {
                      const newText = e.target.value;
                      const { TypographyWizard } = await import('@/lib/agents/typographyWizard');
                      // 자동 폰트 스케일링 (105mm ~300px 너비를 더미 기준으로 전달)
                      const optimalSize = TypographyWizard.getOptimalFontSize(newText, 300, 400, selectedBlock.fontSize);
                      updateTextBlockContent(selectedBlock.id, { text: newText, fontSize: optimalSize });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">글자 크기 (px)</label>
                    <input 
                      type="number" 
                      value={selectedBlock.fontSize}
                      onChange={(e) => updateTextBlockContent(selectedBlock.id, { fontSize: Number(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">색상</label>
                    <input 
                      type="color" 
                      value={selectedBlock.colorHex}
                      onChange={(e) => updateTextBlockContent(selectedBlock.id, { colorHex: e.target.value })}
                      className="w-full h-9 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">폰트 글꼴</label>
                  <select 
                    value={selectedBlock.fontFamily || 'sans-serif'}
                    onChange={(e) => updateTextBlockContent(selectedBlock.id, { fontFamily: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sans-serif">기본 산세리프</option>
                    <option value="serif">기본 세리프</option>
                    <option value="'Jua', sans-serif">주아체 (Jua)</option>
                    <option value="'Gugi', sans-serif">구기체 (Gugi)</option>
                    <option value="'Noto Sans KR', sans-serif">Noto Sans KR</option>
                    <option value="'Nanum Pen Script', cursive">나눔 손글씨 (Nanum Pen)</option>
                  </select>
                </div>
                <button 
                  onClick={() => removeTextBlock(selectedBlock.id)}
                  className="mt-2 w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                >
                  요소 삭제
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto bg-neutral-100/50 p-8 flex flex-col relative items-center">
          <EditorCanvas />
        </div>
      </div>
    </main>
  );
}
