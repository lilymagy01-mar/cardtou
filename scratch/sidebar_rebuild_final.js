
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 문제가 된 구간 (977라인~1100라인 근처)을 정밀하게 타격하여 재건함.
// 기존의 꼬인 코드를 식별하기 위한 전체 블록 준비

const reconstructedSidebarMiddle = `            {/* 3. 퀵-슬로건 & 문구 라이브러리 (Enhanced) */}
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
                              text: slogan.text,
                              x: targetX,
                              y: targetY,
                              fontSize: 36,
                              textAlign: 'center',
                              colorHex: slogan.color || '#1e293b',
                              fontFamily: slogan.font || "'Nanum Pen Script', cursive",
                              opacity: 1.0,
                              width: maxStickerWidth,
                              lineHeight: 1.1,
                              fontWeight: 'normal',
                              rotation: (Math.random() * 6) - 3, 
                              textShadow: '3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 0 0 10px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.15)'
                            });
                          }}
                          className="px-3 py-1.5 bg-gray-50 text-[11px] font-bold text-gray-700 rounded-full border border-gray-100 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all active:scale-95"
                        >
                          {slogan.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* --- 카테고리별 정밀 문구 --- */}
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
                       >메시지</button>
                       <button 
                         onClick={() => setActiveSuggestionType('quote')}
                         className={\`flex-1 py-1 text-[9px] font-bold rounded-lg transition \${activeSuggestionType === 'quote' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}\`}
                       >명언</button>
                    </div>

                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {(activeSuggestionType === 'message' 
                        ? (MESSAGE_SUGGESTIONS[selectedCategory as keyof typeof MESSAGE_SUGGESTIONS] || [])
                        : (QUOTE_SUGGESTIONS[selectedCategory as keyof typeof QUOTE_SUGGESTIONS] || [])
                      ).map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const text = typeof item === 'string' ? item : (item as any).text;
                            addTextBlock({
                              text, x: currentDimension.widthMm / 2, y: 80, fontSize: 14, textAlign: 'center', colorHex: '#334155',
                              fontFamily: "'Nanum Myeongjo', serif", opacity: 1.0, width: 140, lineHeight: 1.6
                            });
                          }}
                          className="w-full text-left p-2.5 text-[10px] font-medium leading-relaxed bg-white border border-gray-50 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-700"
                        >
                          {typeof item === 'string' ? item : (item as any).text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>`;

// 2. 개별 속성 편집 패널 (사진 전문가 모드 / 글자 편집 모드) 정상화
// 이 부분은 Sidebar의 상단(Section 1-2 근처)에 있었어야 하므로 재배치 준비

const reconstructedPropertiesPanel = `            <div className={\`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 \${selectedBlock ? 'ring-2 ring-indigo-50 border-indigo-100' : ''}\`}>
              <button
                onClick={() => toggleSection('properties')}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                disabled={!selectedBlock}
              >
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
                    <div className="space-y-4">
                        <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3 mb-2">
                          <div className="p-2 bg-orange-500 text-white rounded-lg shadow-sm"><ImageIcon size={14} /></div>
                          <span className="text-[11px] font-black text-orange-700 uppercase tracking-tight">사진 전문가 모드</span>
                        </div>
                        
                        <button
                          onClick={async () => {
                            if (!selectedImageBlock.url) return;
                            const removeBackground = (await import('@imgly/background-removal')).default;
                            try {
                              const blob = await removeBackground(selectedImageBlock.url);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateImageBlockContent(selectedImageBlock.id, { url: reader.result as string });
                              };
                              reader.readAsDataURL(blob);
                            } catch (e) {
                              console.error(e);
                              alert('배경 제거 실패');
                            }
                          }}
                          className="w-full py-3 mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all text-xs font-black flex items-center justify-center gap-2"
                        >
                          <Sparkles size={14} /> AI 배경 제거 (Magic Remove)
                        </button>

                        <button
                          onClick={() => removeImageBlock(selectedImageBlock.id)}
                          className="w-full py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all text-xs font-bold border border-red-100 flex items-center justify-center gap-2"
                        >
                          <X size={14} /> 사진 삭제
                        </button>
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
                             <input type="color" value={selectedTextBlock.colorHex} onChange={(e) => updateTextBlockContent(selectedTextBlock.id, { colorHex: e.target.value })} className="w-8 h-8 rounded-lg" />
                           </div>
                         </div>
                       </div>
                       <button
                         onClick={() => removeTextBlock(selectedTextBlock.id)}
                         className="w-full py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all text-xs font-bold border border-red-100 flex items-center justify-center gap-2"
                       >
                         <X size={14} /> 글자 삭제
                       </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>`;

// 3. 파일 합체 (기존 977라인 이후의 혼돈을 제거하고 깨끗하게 배치)
const section3Marker = "{/* 3. 퀵-슬로건 & 문구 라이브러리 (Enhanced) */}";
const propertiesMarkerStart = "{/* 2. Format Section (Accordion) */}";

// 혼돈의 구간 (selectedImageBlock 논리가 침범해 있는 곳)을 찾아서 제거
const chaosStart = content.indexOf(section3Marker);
const chaosEnd = content.indexOf("{/* 4. Inside Setting Section");

if (chaosStart !== -1 && chaosEnd !== -1) {
    // 퀵 슬로건과 속성 패널을 순서대로 다시 배치
    content = content.substring(0, chaosStart) + reconstructedPropertiesPanel + "\n\n            " + reconstructedSidebarMiddle + "\n\n            " + content.substring(chaosEnd);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Reconstruction Complete: Syntax Error Fixed and Logic Decoupled");
} else {
    console.log("Reconstruction Markers Not Found");
}
