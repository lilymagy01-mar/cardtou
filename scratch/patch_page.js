
const fs = require('fs');
const path = require('path');

const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 속성 패널 교체
// {!selectedBlock ? ( 부분을 찾아서 갈아끼우기
const oldBlockStart = '{!selectedBlock ? (';
const startIdx = content.indexOf(oldBlockStart);

if (startIdx !== -1) {
    // 닫는 중괄호 찾기 (대략적인 구조 파악)
    let braceCount = 1;
    let endIdx = startIdx + oldBlockStart.length;
    
    while (endIdx < content.length && braceCount > 0) {
        if (content[endIdx] === '{') braceCount++;
        if (content[endIdx] === '}') braceCount--;
        endIdx++;
    }

    const newPanel = `{!selectedBlockId ? (
                    <div className="p-8 bg-gray-50 rounded-2xl text-center">
                      <div className="mb-2 flex justify-center"><Search size={24} className="text-gray-300" /></div>
                      <p className="text-xs font-bold text-gray-400">캔버스의 요소를 클릭해보세요</p>
                    </div>
                  ) : selectedImageBlock ? (
                    /* --- IMAGE BLOCK CONTROLS --- */
                    <div className="space-y-5">
                      <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500 text-white rounded-lg shadow-sm">
                          <ImageIcon size={14} />
                        </div>
                        <span className="text-[11px] font-black text-orange-700 uppercase tracking-tight">사진 전문가 모드</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">액자 모서리</label>
                          <span className="text-[10px] font-black text-orange-600">{(selectedImageBlock as any).borderRadius || 0}px</span>
                        </div>
                        <input
                          type="range" min="0" max="100" value={(selectedImageBlock as any).borderRadius || 0}
                          onChange={(e) => updateImageBlockContent(selectedImageBlock.id, { borderRadius: parseInt(e.target.value) } as any)}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">분위기 필터</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => updateImageBlockContent(selectedImageBlock.id, { filter: 'grayscale(100%)' } as any)}
                            className="py-2 text-[10px] font-bold rounded-xl border bg-gray-50 bg-white"
                          >흑백</button>
                          <button 
                            onClick={() => updateImageBlockContent(selectedImageBlock.id, { filter: 'sepia(40%) saturate(120%)' } as any)}
                            className="py-2 text-[10px] font-bold rounded-xl border bg-gray-50"
                          >빈티지</button>
                          <button 
                            onClick={() => updateImageBlockContent(selectedImageBlock.id, { filter: 'brightness(1.2) contrast(1.1)' } as any)}
                            className="py-2 text-[10px] font-bold rounded-xl border bg-gray-50"
                          >화사하게</button>
                          <button 
                            onClick={() => updateImageBlockContent(selectedImageBlock.id, { filter: 'none' } as any)}
                            className="py-2 text-[10px] font-bold bg-white text-gray-400 rounded-xl border border-gray-100"
                          >RESET</button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">투명도</label>
                          <span className="text-[10px] font-black text-orange-600">{Math.round((selectedImageBlock.opacity || 1) * 100)}%</span>
                        </div>
                        <input
                          type="range" min="0" max="1" step="0.01" value={selectedImageBlock.opacity || 1}
                          onChange={(e) => updateImageBlockContent(selectedImageBlock.id, { opacity: parseFloat(e.target.value) } as any)}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => removeImageBlock(selectedImageBlock.id)}
                          className="w-full py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all text-xs font-bold border border-red-100 flex items-center justify-center gap-2"
                        >
                          <X size={14} /> 사진 삭제
                        </button>
                      </div>
                    </div>
                  ) : selectedTextBlock ? (
                    <div className="space-y-5">
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500 text-white rounded-lg shadow-sm"><Type size={14} /></div>
                        <span className="text-[11px] font-black text-blue-700 uppercase tracking-tight">글자 편집 모드</span>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-blue-500 uppercase ml-0.5">CONTENT</label>
                        <textarea
                          value={selectedTextBlock.text}
                          onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { text: e.target.value })}
                          className="w-full p-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-inner min-h-[80px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">SIZE</label>
                          <input
                            type="number" step="0.5" value={selectedTextBlock.fontSize}
                            onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { fontSize: Number(e.target.value) })}
                            className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">COLOR</label>
                          <div className="flex gap-2 items-center h-10 bg-gray-50 rounded-xl px-2">
                            <input
                              type="color" value={selectedTextBlock.colorHex}
                              onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { colorHex: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => removeTextBlock(selectedTextBlock.id)}
                          className="w-full py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all text-xs font-bold border border-red-100 flex items-center justify-center gap-2"
                        >
                          <X size={14} /> 글자 삭제
                        </button>
                      </div>
                    </div>
                  ) : null`;

    content = content.substring(0, startIdx) + newPanel + content.substring(endIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Update Successful using Node.js");
} else {
    console.log("Target block not found");
}
