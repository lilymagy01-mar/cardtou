
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// ---------------------------------------------------------
// 1. 완전히 복구된 오리지널 스타일의 문구 & 명언 라이브러리
// ---------------------------------------------------------
const originalStyleSuggestionPanel = `            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-blue-50">
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
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-1 p-1 bg-gray-50 rounded-xl">
                       <button 
                         onClick={() => setActiveSuggestionType('message')} 
                         className={\`flex-1 py-1.5 text-[10.5px] font-black rounded-lg transition-all \${activeSuggestionType === 'message' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 opacity-60'}\`}
                       >
                         메세지 샘플
                       </button>
                       <button 
                         onClick={() => setActiveSuggestionType('quote')} 
                         className={\`flex-1 py-1.5 text-[10.5px] font-black rounded-lg transition-all \${activeSuggestionType === 'quote' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 opacity-60'}\`}
                       >
                         감성 명언
                       </button>
                    </div>
                    
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)} 
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                    >
                       {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>

                  {/* 목록 출력 영역 (정밀 필터링 로직 적용) */}
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar scroll-smooth p-1">
                    {(() => {
                      const items = activeSuggestionType === 'message' 
                        ? (MESSAGE_SUGGESTIONS as any[]).filter(m => m.category === selectedCategory && m.lang === 'ko')
                        : (QUOTE_SUGGESTIONS as any[]).filter(q => q.category === selectedCategory && q.lang === 'ko');

                      if (items.length === 0) {
                        return <div className="py-20 text-center text-[10px] text-gray-400 font-medium">선택한 카테고리에 등록된 문구가 없습니다.</div>;
                      }

                      return items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addTextBlock({
                              text: item.content, x: currentDimension.widthMm / 2, y: 80, fontSize: 16, textAlign: 'center', colorHex: '#1e293b',
                              fontFamily: "'Nanum Myeongjo', serif", width: currentDimension.widthMm * 0.7, zIndex: 10
                            });
                          }}
                          className="w-full text-left p-4 text-[11px] font-medium leading-relaxed bg-white border border-gray-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50 shadow-sm transition-all text-gray-700 active:scale-[0.98]"
                        >
                          <div className="flex flex-col gap-2">
                            <span className="leading-relaxed">{item.content}</span>
                            {item.author && <span className="text-[9px] text-gray-400 font-bold self-end opacity-70">- {item.author}</span>}
                          </div>
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>`;

// 섹션 교체 로직 (퀵슬로건 삭제 포함)
const startMarker = "<div className=\"border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-blue-50\">";
const endMarker = "{/* 4. Inside Setting Section (Restored) */}";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + originalStyleSuggestionPanel + "\n" + content.substring(endIdx);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Success: Reverted to Original Message Samples and Quotes. Quick Slogans removed.");
} else {
    console.log("Failure: Suggestion Panel markers not found.");
}
