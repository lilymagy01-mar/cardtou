
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 더 유연한 마커 검색 (공백 무시)
const findMarker = (markerText) => {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(markerText)) {
            return i;
        }
    }
    return -1;
};

const idx3 = findMarker('3. 퀵-슬로건 & 문구 라이브러리');
const idx4 = findMarker('4. Inside Setting Section');

if (idx3 !== -1 && idx4 !== -1) {
    const lines = content.split('\n');
    
    // 재구성할 코드 조각들 (이전 스크립트의 변수 재사용)
    // (여기서는 다시 정의하지 않고 직접 합침)
    
    const reconstructedPart = `
            {/* 3. 퀵-슬로건 & 문구 라이브러리 (Enhanced) */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-amber-100/50">
              <button
                onClick={() => toggleSection('suggestions')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50/50 to-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-400 text-white rounded-lg flex items-center justify-center text-[10px]">✨</div>
                  <span className="text-sm font-bold text-gray-700">감성 한 줄 & 문구</span>
                </div>
                <div className="transition-transform duration-300">
                  <ArrowDown size={14} className="text-gray-400" />
                </div>
              </button>

              {expandedSections.includes('suggestions') && (
                <div className="px-3 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest pl-1 mb-2">표지용 퀵-슬로건 (One-Click)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                      {QUICK_SLOGANS.map((slogan, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
                            const pageWidth = foldType === 'half' ? currentDimension.widthMm / 2 : currentDimension.widthMm;
                            let targetX = currentDimension.widthMm / 2;
                            let targetY = currentDimension.heightMm * 0.7;
                            if (foldType === 'half') {
                              targetX = isLandscape ? currentDimension.widthMm * 0.75 : currentDimension.widthMm * 0.5;
                              targetY = isLandscape ? currentDimension.heightMm * 0.5 : currentDimension.heightMm * 0.75;
                            }
                            const maxStickerWidth = pageWidth * 0.8;
                            addTextBlock({
                              text: slogan.text, x: targetX, y: targetY, fontSize: 36, textAlign: 'center', colorHex: slogan.color || '#1e293b',
                              fontFamily: slogan.font || "'Nanum Pen Script', cursive", width: maxStickerWidth, rotation: (Math.random() * 6) - 3,
                              textShadow: '3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 0 0 10px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.15)'
                            });
                          }}
                          className="px-3 py-1.5 bg-gray-50 text-[11px] font-bold text-gray-700 rounded-full border border-gray-100 hover:border-amber-400"
                        >
                          {slogan.text}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 font-bold">카테고리별 정밀 문구</label>
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {(activeSuggestionType === 'message' ? (MESSAGE_SUGGESTIONS[selectedCategory] || []) : (QUOTE_SUGGESTIONS[selectedCategory] || [])).map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const text = typeof item === 'string' ? item : (item as any).text;
                            addTextBlock({
                              text, x: currentDimension.widthMm / 2, y: 80, fontSize: 14, textAlign: 'center', colorHex: '#334155',
                              fontFamily: "'Nanum Myeongjo', serif", width: 140, lineHeight: 1.6
                            });
                          }}
                          className="w-full text-left p-2.5 text-[10px] font-medium leading-relaxed bg-white border border-gray-50 rounded-xl hover:border-blue-400"
                        >
                          {typeof item === 'string' ? item : (item as any).text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={\`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 \${selectedBlock ? 'ring-2 ring-indigo-50 border-indigo-100' : ''}\`}>
              <button onClick={() => toggleSection('properties')} className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50" disabled={!selectedBlock}>
                <div className="flex items-center gap-2">
                  <Settings size={16} className={selectedBlock ? 'text-indigo-500' : 'text-gray-400'} />
                  <span className={\`text-sm font-bold \${selectedBlock ? 'text-indigo-600' : 'text-gray-400'}\`}>개별 요소 속성 편집</span>
                </div>
                <div className={\`transition-transform duration-300 \${expandedSections.includes('properties') ? 'rotate-180' : ''}\`}>
                  <ArrowDown size={14} className="text-gray-400" />
                </div>
              </button>
              {expandedSections.includes('properties') && selectedBlock && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {selectedImageBlock ? (
                    <div className="space-y-4 pt-2">
                        <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3">
                          <div className="p-2 bg-orange-500 text-white rounded-lg shadow-sm"><ImageIcon size={14} /></div>
                          <span className="text-[11px] font-black text-orange-700 uppercase tracking-tight">사진 전문가 모드</span>
                        </div>
                        <button onClick={async () => {
                            if (!selectedImageBlock.url) return;
                            const removeBackground = (await import('@imgly/background-removal')).default;
                            try { const blob = await removeBackground(selectedImageBlock.url); const reader = new FileReader(); reader.onloadend = () => updateImageBlockContent(selectedImageBlock.id, { url: reader.result as string }); reader.readAsDataURL(blob); } catch (e) { alert('배경 제거 실패'); }
                          }}
                          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2"
                        >
                          <Sparkles size={14} /> AI 배경 제거
                        </button>
                        <button onClick={() => removeImageBlock(selectedImageBlock.id)} className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs border border-red-100 flex items-center justify-center gap-2">
                          <X size={14} /> 사진 삭제
                        </button>
                    </div>
                  ) : selectedTextBlock ? (
                    <div className="space-y-4 pt-2">
                       <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                         <div className="p-2 bg-blue-500 text-white rounded-lg shadow-sm"><Type size={14} /></div>
                         <span className="text-[11px] font-black text-blue-700 uppercase tracking-tight">글자 편집 모드</span>
                       </div>
                       <textarea value={selectedTextBlock.text} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { text: e.target.value })} className="w-full p-3 bg-gray-50 border-none rounded-2xl text-sm min-h-[80px]" />
                       <button onClick={() => removeTextBlock(selectedTextBlock.id)} className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs border border-red-100 flex items-center justify-center gap-2">
                         <X size={14} /> 글자 삭제
                       </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
`;

    // 해당 구간을 교체
    lines.splice(idx3, idx4 - idx3, reconstructedPart);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log("Reconstruction Successful: Hierarchy restored");
} else {
    console.log("Markers not found correctly: idx3=" + idx3 + ", idx4=" + idx4);
}
