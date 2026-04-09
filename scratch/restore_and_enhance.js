
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. QUICK_SLOGANS 데이터 대폭 강화
const enhancedSlogans = `const QUICK_SLOGANS = [
  { text: "감사합니다", style: "classic" },
  { text: "고맙습니다", style: "warm" },
  { text: "사랑합니다", style: "love" },
  { text: "항상 건강하세요", style: "respect" },
  { text: "오늘도 수고했어", style: "comfort" },
  { text: "너때문에 행복한 하루였어", style: "sweet" },
  { text: "최고의 하루가 되길", style: "cheer" },
  { text: "생신을 축하드립니다", style: "respect" },
  { text: "생일 축하해!", style: "joy" },
  { text: "늘 고맙고 사랑해", style: "love" },
  { text: "꽃길만 걷자", style: "cheer" },
  { text: "우리 오늘부터 1일", style: "sweet" },
  { text: "함께라서 행복해", style: "warm" },
  { text: "기억해, 넌 소중해", style: "comfort" },
  { text: "빛나는 너를 응원해", style: "cheer" },
  { text: "행복한 미래를 위해", style: "classic" },
  { text: "언제나 네 편이야", style: "love" },
  { text: "수고했어, 오늘도!", style: "comfort" },
  { text: "웃는 일만 가득하길", style: "joy" },
  { text: "너의 꿈을 응원해", style: "cheer" }
];`;

content = content.replace(/const QUICK_SLOGANS = \[[\s\S]*?\];/, enhancedSlogans);

// 2. 섹션 3의 내용을 기존 명언/메시지 추천 로직을 포함하도록 대대적 수정
// (기존 카테고리 선택 기능을 다시 이식)

const restoredSection3 = `            {/* 3. 퀵-슬로건 & 문구 라이브러리 (Enhanced) */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-amber-100/50">
              <button
                onClick={() => toggleSection('suggestions')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50/50 to-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-400 text-white rounded-lg flex items-center justify-center text-[10px]">✨</div>
                  <span className="text-sm font-bold text-gray-700">감성 한 줄 & 문구</span>
                </div>
                <div className={\`transition-transform duration-300 \${expandedSections.includes('suggestions') ? 'rotate-180' : ''}\`}>
                  <ArrowDown size={14} className="text-gray-400" />
                </div>
              </button>

              {expandedSections.includes('suggestions') && (
                <div className="px-3 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* --- 표지용 퀵 슬로건 --- */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest pl-1 mb-2">표지용 퀵-슬로건 (One-Click)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                      {QUICK_SLOGANS.map((slogan, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addTextBlock({
                              text: slogan.text,
                              x: currentDimension.widthMm / 2,
                              y: foldType === 'half' ? 120 : 150,
                              fontSize: 18,
                              textAlign: 'center',
                              colorHex: '#1e293b',
                              fontFamily: "'Nanum Myeongjo', serif",
                              opacity: 1.0,
                              width: 180,
                              lineHeight: 1.4,
                              fontWeight: '900'
                            });
                          }}
                          className="px-3 py-1.5 bg-gray-50 text-[11px] font-bold text-gray-700 rounded-full border border-gray-100 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all active:scale-95"
                        >
                          {slogan.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* --- 원복: 카테고리별 메시지/명언 추천 --- */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">카테고리별 정밀 문구</label>
                       <select 
                         value={selectedCategory} 
                         onChange={(e) => setSelectedCategory(e.target.value)}
                         className="text-[10px] p-1 border-none bg-gray-50 rounded font-bold text-blue-600 outline-none"
                       >
                         {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                           <option key={val} value={val}>{label}</option>
                         ))}
                       </select>
                    </div>

                    <div className="flex gap-1 mb-3">
                       <button 
                         onClick={() => setActiveSuggestionType('message')}
                         className={\`flex-1 py-1 text-[9px] font-bold rounded-lg transition \${activeSuggestionType === 'message' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}\`}
                       >메시지 샘플</button>
                       <button 
                         onClick={() => setActiveSuggestionType('quote')}
                         className={\`flex-1 py-1 text-[9px] font-bold rounded-lg transition \${activeSuggestionType === 'quote' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}\`}
                       >명언/글귀</button>
                    </div>

                    <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                      {(activeSuggestionType === 'message' 
                        ? (MESSAGE_SUGGESTIONS[selectedCategory as keyof typeof MESSAGE_SUGGESTIONS] || [])
                        : (QUOTE_SUGGESTIONS[selectedCategory as keyof typeof QUOTE_SUGGESTIONS] || [])
                      ).map((item: any, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addTextBlock({
                              text: typeof item === 'string' ? item : item.text,
                              x: currentDimension.widthMm / 2,
                              y: 80,
                              fontSize: 14,
                              textAlign: 'center',
                              colorHex: '#334155',
                              fontFamily: "'Nanum Myeongjo', serif",
                              opacity: 1.0,
                              width: 150,
                              lineHeight: 1.6
                            });
                          }}
                          className="w-full text-left p-2.5 text-[10px] font-medium leading-relaxed bg-white border border-gray-50 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-700"
                        >
                          {typeof item === 'string' ? item : item.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>`;

// 섹션 3 찾아서 교체 (정확한 매칭을 위해 주석 사용)
const sectionBegin = "{/* 3. 퀵-슬로건 & 문구 라이브러리 (By 폰트김) */}";
const sectionEnd = "{/* 4. Inside Setting Section (Accordion) - Only if half fold & inside page */}";

const startIdx = content.indexOf(sectionBegin);
const endIdx = content.indexOf(sectionEnd);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + restoredSection3 + "\n\n            " + content.substring(endIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Restoration and Enhancement Successful");
} else {
    console.log("Section markers not found");
}
