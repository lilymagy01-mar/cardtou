
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const findLine = (text) => {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(text)) return i;
    }
    return -1;
};

// 재건축 시작 지점 (섹션 3 시작)
const startLineIdx = findLine('3. 퀵-슬로건 & 문구 라이브러리');
// 재건축 종료 지점 (섹션 5 시작 - 사진 업로드가 살아있는 부분)
const endLineIdx = findLine('내 사진 & 이미지');

if (startLineIdx !== -1 && endLineIdx !== -1) {
    const lines = content.split('\n');
    
    // 소실된 섹션 4를 포함하여 완벽하게 복원된 전체 코드 블록
    const restorationBlock = `
            {/* 3. 퀵-슬로건 & 문구 라이브러리 (Perfect Restored) */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-amber-100/50">
              <button
                onClick={() => toggleSection('suggestions')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50/50 to-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-400 text-white rounded-lg flex items-center justify-center text-[10px]">✨</div>
                  <span className="text-sm font-bold text-gray-700">감성 한 줄 & 문구</span>
                </div>
                <ArrowDown size={14} className="text-gray-400" />
              </button>

              {expandedSections.includes('suggestions') && (
                <div className="px-3 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest pl-1 mb-2 font-bold">표지용 퀵-슬로건 (One-Click)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {QUICK_SLOGANS.map((slogan, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
                            const pageWidth = foldType === 'half' ? currentDimension.widthMm / 2 : currentDimension.widthMm;
                            let tx = isLandscape ? currentDimension.widthMm * 0.75 : currentDimension.widthMm * 0.5;
                            let ty = isLandscape ? currentDimension.heightMm * 0.5 : currentDimension.heightMm * 0.75;
                            if (foldType !== 'half') { tx = currentDimension.widthMm / 2; ty = currentDimension.heightMm / 2; }
                            addTextBlock({
                              text: slogan.text, x: tx, y: ty, fontSize: 36, textAlign: 'center', colorHex: slogan.color || '#1e293b',
                              fontFamily: slogan.font || "'Nanum Pen Script', cursive", width: pageWidth * 0.8, rotation: (Math.random() * 6) - 3,
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
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">카테고리별 정밀 문구</label>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                      {(activeSuggestionType === 'message' ? (MESSAGE_SUGGESTIONS[selectedCategory] || []) : (QUOTE_SUGGESTIONS[selectedCategory] || [])).map((item, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => {
                            const txt = typeof item === 'string' ? item : (item as any).text;
                            addTextBlock({ text: txt, x: currentDimension.widthMm / 2, y: 80, fontSize: 14, textAlign: 'center', colorHex: '#334155', fontFamily: "'Nanum Myeongjo', serif", width: 140, lineHeight: 1.6 });
                          }}
                          className="w-full text-left p-2 text-[10px] bg-white border border-gray-50 rounded-xl hover:border-blue-400"
                        >
                          {typeof item === 'string' ? item : (item as any).text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Inside Setting Section (Restored) */}
            {activePage === 'inside' && foldType === 'half' && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => toggleSection('inside_settings')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-emerald-500" />
                    <span className="text-sm font-bold text-gray-700">수신인/발신인 설정</span>
                  </div>
                  <ArrowDown size={14} className="text-gray-400" />
                </button>
                {expandedSections.includes('inside_settings') && (
                  <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="수령인 이름" className="w-full p-2.5 text-xs bg-white rounded-xl shadow-sm outline-none" />
                       <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="보내는 사람 성함" className="w-full p-2.5 text-xs bg-white rounded-xl shadow-sm outline-none" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 개별 요소 속성 편집 (Re-Added) */}
            <div className={\`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm \${selectedBlock ? 'ring-2 ring-indigo-50' : ''}\`}>
              <button 
                onClick={() => toggleSection('properties')} 
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50" 
                disabled={!selectedBlock}
              >
                <div className="flex items-center gap-2">
                  <Settings size={16} className={selectedBlock ? 'text-indigo-500' : 'text-gray-400'} />
                  <span className={\`text-sm font-bold \${selectedBlock ? 'text-indigo-600' : 'text-gray-400'}\`}>개별 요소 속성 편집</span>
                </div>
                <ArrowDown size={14} className="text-gray-400" />
              </button>
              {expandedSections.includes('properties') && selectedBlock && (
                <div className="px-4 pb-4 space-y-4">
                  {selectedImageBlock ? (
                    <div className="space-y-3 pt-2">
                        <div className="p-3 bg-orange-50 rounded-2xl flex items-center gap-3 border border-orange-100">
                          <ImageIcon size={14} className="text-orange-500" />
                          <span className="text-[11px] font-black text-orange-700 tracking-tight">사진 전문가 모드</span>
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
                       <div className="p-3 bg-blue-50 rounded-2xl flex items-center gap-3 border border-blue-100">
                         <Type size={14} className="text-blue-500" />
                         <span className="text-[11px] font-black text-blue-700 tracking-tight">글자 편집 모드</span>
                       </div>
                       <textarea value={selectedTextBlock.text} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { text: e.target.value })} className="w-full p-3 bg-gray-50 border-none rounded-2xl text-sm min-h-[80px] shadow-inner" />
                       <div className="grid grid-cols-2 gap-2">
                         <input type="number" step="0.5" value={selectedTextBlock.fontSize} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { fontSize: Number(e.target.value) })} className="p-2.5 bg-gray-50 rounded-xl text-xs" />
                         <input type="color" value={selectedTextBlock.colorHex} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { colorHex: e.target.value })} className="w-full h-10 bg-gray-50 rounded-xl cursor-pointer" />
                       </div>
                       <button onClick={() => removeTextBlock(selectedTextBlock.id)} className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs border border-red-100 flex items-center justify-center gap-2">
                         <X size={14} /> 글자 삭제
                       </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* 5. My Photos & Images (Alive) */}
            <div className={\`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 \${expandedSections.includes('photos') ? 'ring-2 ring-orange-50 border-orange-100' : ''}\`}>
`;

    // 970라인(Section 3 시작)부터 1100라인(Section 5 시작)까지의 구간을 찾아서 갈아끼움
    // endLineIdx 근처의 태그를 식별하기 위해 더 정밀하게 위치 산정
    const linesToReplace = (endLineIdx - 1) - startLineIdx;
    
    lines.splice(startLineIdx, linesToReplace, restorationBlock);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log("Full Recovery & Reconstruction Successful: Sections 3, 4, 5 restored");
} else {
    console.log("Markers not found correctly: start=" + startLineIdx + ", end=" + endLineIdx);
}
