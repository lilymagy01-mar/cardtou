# -*- coding: utf-8 -*-
import sys
import re

file_path = r'e:\cardtou\src\app\page.tsx'

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. Messy useEffect cleanup fix
    # We find the corrupted useEffect and replace it with a clean one
    cleanup_pattern = re.compile(r'return \(\) =>\s+{/\*.*?\*/}\s+{isSuggestionModalOpen && \([\s\S]*?\)\s+} window\.removeEventListener\(\'' + r'keydown\', handleKeyDown\);', re.DOTALL)
    
    # Let's be more specific with lines if regex is risky
    lines = content.splitlines(keepends=True)
    
    # Find the problematic range
    # Lines 365 to 445 (0-indexed 364 to 444)
    start_eff = 364
    end_eff = 444
    
    # Correct clean-up
    lines[start_eff:end_eff+1] = [
        "    return () => window.removeEventListener('keydown', handleKeyDown);\n",
        "  }, [selectedBlockId, textBlocks, imageBlocks, removeTextBlock, removeImageBlock]);\n"
    ]

    # 2. Prepare the Modal JSX content
    modal_jsx = """
      {/* 팁 관련 문구 & 명언 팝업 다이얼로그 (Classic Reborn) */}
      {isSuggestionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSuggestionModalOpen(false)} />
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  {activeSuggestionType === 'message' ? <MessageSquareText size={24} /> : <Sparkles size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{activeSuggestionType === 'message' ? '메시지 샘플 보기' : '감성 명언 라이브러리'}</h2>
                  <p className="text-xs text-gray-400 font-bold">원하는 문구를 선택하면 바로 디자인에 반영합니다.</p>
                </div>
              </div>
              
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button onClick={() => setActiveSuggestionType('message')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSuggestionType === 'message' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 opacity-60'}`}>메시지 샘플</button>
                <button onClick={() => setActiveSuggestionType('quote')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSuggestionType === 'quote' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 opacity-60'}`}>감성 명언</button>
              </div>

              <button onClick={() => setIsSuggestionModalOpen(false)} className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"><X size={24} /></button>
            </div>

            {/* 본문 레이아웃 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 왼쪽: 카테고리 사이드바 */}
              <div className="w-64 bg-gray-50/50 border-r border-gray-100 p-6 space-y-2 overflow-y-auto">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Categories</p>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSelectedCategory(v)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all ${selectedCategory === v ? 'bg-white shadow-md text-indigo-600 ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* 오른쪽: 리스트 영역 */}
              <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const items = activeSuggestionType === 'message' 
                      ? (MESSAGE_SUGGESTIONS as any[]).filter(m => m.category === selectedCategory && m.lang === 'ko')
                      : (QUOTE_SUGGESTIONS as any[]).filter(q => q.category === selectedCategory && q.lang === 'ko');

                    if (items.length === 0) {
                      return <div className="col-span-2 py-40 text-center text-gray-400 font-bold">선택한 카테고리에 등록된 문구가 없습니다.</div>;
                    }

                    return items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          addTextBlock({
                            text: item.content, x: currentDimension.widthMm / 2, y: 80, fontSize: 16, textAlign: 'center', colorHex: '#1e293b',
                            fontFamily: "'Nanum Myeongjo', serif", width: currentDimension.widthMm * 0.7, zIndex: 10
                          });
                          setIsSuggestionModalOpen(false);
                        }}
                        className="group text-left p-6 bg-gray-50 border border-transparent rounded-[24px] hover:border-indigo-400 hover:bg-indigo-50 transition-all hover:shadow-xl hover:shadow-indigo-100/50 relative overflow-hidden active:scale-95"
                      >
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={16} className="text-indigo-500" /></div>
                        <div className="flex flex-col gap-4">
                          <span className="text-[13px] font-medium leading-relaxed text-gray-700">{item.content}</span>
                          {item.author && <span className="text-[10px] text-indigo-400 font-black self-end opacity-70 italic">- {item.author}</span>}
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
"""

    # 3. Insert Modal JSX at the end of the Home component return
    # Find the last closing tags of the Home component.
    # We look for the final `</main>` and insert before it or before the last `</div>` of the main return.
    
    new_content = "".join(lines)
    
    # Let's find the closing `</main>` which is probably near the end.
    main_end_match = list(re.finditer(r'</main>', new_content))
    if main_end_match:
        last_main_end = main_end_match[-1].start()
        new_content = new_content[:last_main_end] + modal_jsx + "\n" + new_content[last_main_end:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Python Structural Rebuild Success!")
except Exception as e:
    print(f"Error: {e}")
