
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const anchor3 = "{/* 3. 퀵-슬로건 & 문구 라이브러리 (By 폰트김) */}";
const anchor4 = "{/* 4. Inside Setting Section";

const startIdx = content.indexOf(anchor3);
const endIdx = content.indexOf(anchor4);

if (startIdx !== -1 && endIdx !== -1) {
    const fullSection3 = `${anchor3}
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
                    <div className="flex flex-wrap gap-1.5">
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

                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">내지용 긴 문구 추천</label>
                    <div className="space-y-1.5">
                      {(PEN_KIM_COLLECTION[aiDesignTheme] || PEN_KIM_COLLECTION['modern']).map((quote, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addTextBlock({
                              text: quote,
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
                          {quote}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>\n\n            `;
    
    content = content.substring(0, startIdx) + fullSection3 + content.substring(endIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Full Reconstruction Successful");
}
