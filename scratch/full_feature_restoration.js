
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 폰트 리스트 정의
const fontListCode = `
const GOOGLE_FONTS = [
  { label: '나눔고딕 (기본)', value: "'Nanum Gothic', sans-serif" },
  { label: '나눔명조 (고급)', value: "'Nanum Myeongjo', serif" },
  { label: '나눔펜글씨 (감성)', value: "'Nanum Pen Script', cursive" },
  { label: '본고딕', value: "'Noto Sans KR', sans-serif" },
  { label: '검은고딕', value: "'Black Han Sans', sans-serif" },
  { label: '가을바람', value: "'Gaegu', cursive" },
  { label: '주아체', value: "'Jua', sans-serif" },
  { label: '도현체', value: "'Do Hyeon', sans-serif" },
  { label: '송명체', value: "'Song Myung', serif" },
  { label: '이스트바다', value: "'East Sea Dokdo', cursive" },
  { label: '독도체', value: "'Dokdo', cursive" },
  { label: '연성체', value: "'Yeon Sung', serif" },
  { label: '감자꽃', value: "'Gamja Flower', cursive" },
  { label: '하이멜로디', value: "'Hi Melody', cursive" },
  { label: '댄싱 스크립트', value: "'Dancing Script', cursive" },
  { label: '마운틴', value: "'Mountain', cursive" },
  { label: '패시피코', value: "'Pacifico', cursive" },
];
`;

// 파일 상단에 폰트 리스트 삽입 (QUICK_SLOGANS 위에)
if (!content.includes('GOOGLE_FONTS')) {
    content = content.replace('const QUICK_SLOGANS = [', fontListCode + '\nconst QUICK_SLOGANS = [');
}

// ---------------------------------------------------------
// 1. 고도화된 개별 요소 속성 편집 패널 (Full Spec)
// ---------------------------------------------------------
const fullPropertiesPanel = `            <div className={\`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 \${selectedBlock ? 'ring-2 ring-indigo-50 border-indigo-100' : ''}\`}>
              <button
                onClick={() => toggleSection('properties')}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                disabled={!selectedBlock}
              >
                <div className="flex items-center gap-2">
                  <Settings size={16} className={selectedBlock ? 'text-indigo-500' : 'text-gray-400'} />
                  <span className={\`text-sm font-bold \${selectedBlock ? 'text-indigo-600' : 'text-gray-400'}\`}>개별 요소 속성 편집</span>
                </div>
                <ArrowDown size={14} className="text-gray-400" />
              </button>

              {expandedSections.includes('properties') && selectedBlock && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {selectedImageBlock ? (
                    <div className="space-y-4 pt-2">
                        {/* 이미지 편집 도구 */}
                        <div className="p-3 bg-orange-50 rounded-2xl flex items-center gap-3 border border-orange-100">
                          <ImageIcon size={14} className="text-orange-500" />
                          <span className="text-[11px] font-black text-orange-700 tracking-tight">사진 전문가 모드</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">OPACITY</label>
                            <input type="range" min="0" max="1" step="0.1" value={selectedImageBlock.opacity || 1} onChange={(e) => updateImageBlockContent(selectedImageBlock.id, { opacity: Number(e.target.value) })} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">ROTATE</label>
                            <input type="range" min="-180" max="180" step="1" value={selectedImageBlock.rotation || 0} onChange={(e) => updateImageBlockContent(selectedImageBlock.id, { rotation: Number(e.target.value) })} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                          </div>
                        </div>

                        <button onClick={async () => {
                            if (!selectedImageBlock.url) return;
                            const removeBackground = (await import('@imgly/background-removal')).default;
                            try { const blob = await removeBackground(selectedImageBlock.url); const reader = new FileReader(); reader.onloadend = () => updateImageBlockContent(selectedImageBlock.id, { url: reader.result as string }); reader.readAsDataURL(blob); } catch (e) { alert('배경 제거 실패'); }
                          }}
                          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                        >
                          <Sparkles size={14} /> AI 배경 제거 (Magic Remove)
                        </button>

                        <button onClick={() => removeImageBlock(selectedImageBlock.id)} className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100">
                          <X size={14} /> 사진 삭제
                        </button>
                    </div>
                  ) : selectedTextBlock ? (
                    <div className="space-y-4 pt-2">
                       {/* 텍스트 편집 도구 */}
                       <div className="p-3 bg-blue-50 rounded-2xl flex items-center gap-3 border border-blue-100">
                         <Type size={14} className="text-blue-500" />
                         <span className="text-[11px] font-black text-blue-700 tracking-tight">글자 편집 모드</span>
                       </div>

                       <textarea value={selectedTextBlock.text} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { text: e.target.value })} className="w-full p-3 bg-gray-50 border-none rounded-2xl text-sm min-h-[80px] shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none" />

                       <div className="space-y-3">
                         {/* 폰트 & 정렬 */}
                         <div className="grid grid-cols-1 gap-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Font Family</label>
                           <select value={selectedTextBlock.fontFamily} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { fontFamily: e.target.value })} className="w-full p-2.5 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500">
                             {GOOGLE_FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                           </select>
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Align</label>
                               <div className="flex bg-gray-50 p-1 rounded-xl">
                                 <button onClick={() => updateTextBlockContent(selectedTextBlock.id, { textAlign: 'left' })} className={\`flex-1 p-1.5 rounded-lg \${selectedTextBlock.textAlign === 'left' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}\`}><AlignLeft size={14} /></button>
                                 <button onClick={() => updateTextBlockContent(selectedTextBlock.id, { textAlign: 'center' })} className={\`flex-1 p-1.5 rounded-lg \${selectedTextBlock.textAlign === 'center' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}\`}><AlignCenter size={14} /></button>
                                 <button onClick={() => updateTextBlockContent(selectedTextBlock.id, { textAlign: 'right' })} className={\`flex-1 p-1.5 rounded-lg \${selectedTextBlock.textAlign === 'right' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}\`}><AlignRight size={14} /></button>
                               </div>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color</label>
                               <input type="color" value={selectedTextBlock.colorHex} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { colorHex: e.target.value })} className="w-full h-9 rounded-xl border-none cursor-pointer bg-gray-50 p-1" />
                            </div>
                         </div>

                         {/* 수치 조절기들 */}
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400">SIZE</label>
                              <input type="number" value={selectedTextBlock.fontSize} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { fontSize: Number(e.target.value) })} className="w-full p-2 bg-gray-50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400">OPACITY</label>
                              <input type="range" min="0.1" max="1" step="0.1" value={selectedTextBlock.opacity || 1} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { opacity: Number(e.target.value) })} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Line Height</label>
                              <input type="range" min="0.8" max="2.5" step="0.1" value={selectedTextBlock.lineHeight || 1.2} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { lineHeight: Number(e.target.value) })} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Rotate</label>
                              <input type="range" min="-180" max="180" step="1" value={selectedTextBlock.rotation || 0} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { rotation: Number(e.target.value) })} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            </div>
                         </div>
                       </div>

                       <button onClick={() => removeTextBlock(selectedTextBlock.id)} className="w-full py-3 mt-2 bg-red-50 text-red-600 rounded-2xl font-bold text-xs border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100">
                         <X size={14} /> 글자 삭제
                       </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>`;

// ---------------------------------------------------------
// 2. 통합 콘텐츠 라이브러리 (Message Samples, Quotes, Slogans)
// ---------------------------------------------------------
const fullSuggestionPanel = `            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-blue-50">
              <button
                onClick={() => toggleSection('suggestions')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50/50 to-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center text-[10px]"><MessageSquareText size={12} /></div>
                  <span className="text-sm font-bold text-gray-700">문구 & 명언 라이브러리</span>
                </div>
                <ArrowDown size={14} className="text-gray-400" />
              </button>

              {expandedSections.includes('suggestions') && (
                <div className="px-3 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* 카테고리 앤 탭 선택 */}
                  <div className="space-y-2">
                    <div className="flex gap-1 p-1 bg-gray-50 rounded-xl">
                       <button onClick={() => setActiveSuggestionType('message')} className={\`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all \${activeSuggestionType === 'message' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}\`}>샘플 문구</button>
                       <button onClick={() => setActiveSuggestionType('quote')} className={\`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all \${activeSuggestionType === 'quote' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}\`}>명언/격언</button>
                    </div>
                    
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-blue-700 outline-none">
                       {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>

                  {/* 목록 출력 영역 */}
                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                    {(activeSuggestionType === 'message' 
                        ? (MESSAGE_SUGGESTIONS[selectedCategory as keyof typeof MESSAGE_SUGGESTIONS] || [])
                        : (QUOTE_SUGGESTIONS[selectedCategory as keyof typeof QUOTE_SUGGESTIONS] || [])
                      ).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const text = typeof item === 'string' ? item : (item as any).text;
                          addTextBlock({
                            text, x: currentDimension.widthMm / 2, y: 80, fontSize: 16, textAlign: 'center', colorHex: '#1e293b',
                            fontFamily: "'Nanum Myeongjo', serif", width: currentDimension.widthMm * 0.7, zIndex: 10
                          });
                        }}
                        className="w-full text-left p-3 text-[11px] font-medium leading-relaxed bg-gray-50 border border-transparent rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all text-gray-700"
                      >
                        {typeof item === 'string' ? item : (item as any).text}
                      </button>
                    ))}
                  </div>

                  {/* 퀵 슬로건 (서브 도구로 강등 및 세련된 연출) */}
                  <div className="pt-3 border-t border-gray-100">
                    <label className="block text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">QUICK SLOGANS</label>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SLOGANS.map((s, idx) => (
                        <button key={idx} onClick={() => {
                          const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
                          const pageWidth = foldType === 'half' ? currentDimension.widthMm / 2 : currentDimension.widthMm;
                          let tx = isLandscape ? currentDimension.widthMm * 0.75 : currentDimension.widthMm * 0.5;
                          let ty = isLandscape ? currentDimension.heightMm * 0.5 : currentDimension.heightMm * 0.75;
                          if (foldType !== 'half') { tx = currentDimension.widthMm / 2; ty = currentDimension.heightMm / 2; }
                          addTextBlock({
                             text: s.text, x: tx, y: ty, fontSize: 32, textAlign: 'center', colorHex: s.color, fontFamily: s.font, width: pageWidth * 0.8,
                             textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 4px 10px rgba(0,0,0,0.1)'
                          });
                        }} className="px-2.5 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-all">
                          {s.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>`;

// ---------------------------------------------------------
// 3. 파일 합체
// ---------------------------------------------------------
const propertiesStartMarker = "{/* 개별 요소 속성 편집 (Re-Added) */}";
const suggestionStartMarker = "{/* 3. 퀵-슬로건 & 문구 라이브러리 (Perfect Restored) */}";
const suggestionEndMarker = "{/* 4. Inside Setting Section (Restored) */}";

// 정밀 교체
const lines = content.split('\n');
const propertiesIdx = lines.findIndex(l => l.includes(propertiesStartMarker));
const suggestionIdx = lines.findIndex(l => l.includes(suggestionStartMarker));
const suggestionEndIdx = lines.findIndex(l => l.includes(suggestionEndMarker));

if (propertiesIdx !== -1 && suggestionIdx !== -1 && suggestionEndIdx !== -1) {
    // 섹션 3 교체
    lines.splice(suggestionIdx, suggestionEndIdx - suggestionIdx, fullSuggestionPanel);
    
    // 다시 index 찾기 (splice로 변했을 것)
    const newLines = lines.join('\n').split('\n');
    const newPropertiesIdx = newLines.findIndex(l => l.includes(propertiesStartMarker));
    
    // 섹션 4는 그대로 두고 속성 패널 교체
    // (이미 propertiesIdx가 아래에 있으므로 아래를 먼저 찾는게 안전)
    const finalLines = newLines;
    const pEndIdx = finalLines.findIndex((l, i) => i > newPropertiesIdx && l.includes('<div className={`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${expandedSections.includes(\'photos\')'));
    
    if (pEndIdx !== -1) {
       finalLines.splice(newPropertiesIdx, pEndIdx - newPropertiesIdx, fullPropertiesPanel);
       fs.writeFileSync(filePath, finalLines.join('\n'), 'utf8');
       console.log("Full Feature Restoration Complete: All editing tools and libraries are back!");
    } else {
       console.log("Properties End Marker not found");
    }
} else {
    console.log("Markers not found correctly: properties=" + propertiesIdx + ", suggestion=" + suggestionIdx);
}
