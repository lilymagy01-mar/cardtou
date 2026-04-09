
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 초기 확장 섹션에 suggestions 추가하여 기본으로 열리게 함
content = content.replace("['format', 'branding', 'photos', 'properties']", "['format', 'branding', 'photos', 'properties', 'suggestions']");

// 2. 카테고리 데이터가 제대로 출력되는지 확인하기 위해 섹션 코드를 더 견고하게 보강
const robustSuggestionPanel = `            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-blue-50">
              <button
                onClick={() => toggleSection('suggestions')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50/50 to-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center text-[10px]"><MessageSquareText size={12} /></div>
                  <span className="text-sm font-bold text-gray-700">문구 & 명언 라이브러리</span>
                </div>
                <ArrowDown size={14} className={\`text-gray-400 transition-transform duration-300 \${expandedSections.includes('suggestions') ? 'rotate-180' : ''}\`} />
              </button>

              {expandedSections.includes('suggestions') && (
                <div className="px-3 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* 카테고리 앤 탭 선택 */}
                  <div className="space-y-2">
                    <div className="flex gap-1 p-1 bg-gray-50 rounded-xl">
                       <button 
                         onClick={() => setActiveSuggestionType('message')} 
                         className={\`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all \${activeSuggestionType === 'message' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}\`}
                       >
                         샘플 문구
                       </button>
                       <button 
                         onClick={() => setActiveSuggestionType('quote')} 
                         className={\`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all \${activeSuggestionType === 'quote' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}\`}
                       >
                         명언/격언
                       </button>
                    </div>
                    
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)} 
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    >
                       {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>

                  {/* 목록 출력 영역 */}
                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar scroll-smooth">
                    {(activeSuggestionType === 'message' 
                        ? (MESSAGE_SUGGESTIONS[selectedCategory as keyof typeof MESSAGE_SUGGESTIONS] || [])
                        : (QUOTE_SUGGESTIONS[selectedCategory as keyof typeof QUOTE_SUGGESTIONS] || [])
                      ).length > 0 ? (
                      (activeSuggestionType === 'message' 
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
                          className="w-full text-left p-3.5 text-[11px] font-medium leading-relaxed bg-white border border-gray-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-700 shadow-sm"
                        >
                          {typeof item === 'string' ? item : (item as any).text}
                        </button>
                      ))
                    ) : (
                      <div className="py-10 text-center text-[10px] text-gray-400">등록된 문구가 없습니다.</div>
                    )}
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
                        }} className="px-2.5 py-1.5 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm">
                          {s.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>`;

// 섹션 교체 로직
const startMarker = "<div className=\"border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-blue-50\">";
const endMarker = "{/* 4. Inside Setting Section (Restored) */}";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + robustSuggestionPanel + "\n" + content.substring(endIdx);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Success: Message samples and quotes are definitely back and visible!");
} else {
    console.log("Failure: Markers not found.");
}
