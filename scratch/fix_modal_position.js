
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 잘못 삽입된 모달 코드 제거 (FormtecModal 내부)
const wrongModalPattern = /\{\/\* 🔮 대형 문구 & 명언 팝업 다이얼로그 \(Classic Reborn\) \*\/\}[\s\S]*?\{isSuggestionModalOpen && \([\s\S]*?\}\)/g;
content = content.replace(wrongModalPattern, '');

// 2. 메인 Home 컴포넌트의 return 위치 찾기 (보통 <main 혹은 <div 로 시작하는 첫번째 return)
// 파일을 위에서부터 읽어 'return (' 를 찾되, 함수 정의 내부에 있지 않은 것을 찾아야 함.
// 간단하게는 파일 앞부분 500~600 라인 사이의 return 을 타겟팅.

const mainReturnIdx = content.indexOf('return (', 500); // 500라인 이후의 첫 return

if (mainReturnIdx !== -1) {
    const insertPos = content.indexOf('>', mainReturnIdx) + 1;
    
    // 삽입할 모달 코드 (메인 컴포넌트용)
    const suggestionModalUI = `
      {/* 🔮 대형 문구 & 명언 팝업 다이얼로그 (Classic Reborn) */}
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
                  <h2 className="text-xl font-black text-gray-900">{activeSuggestionType === 'message' ? '메세지 샘플 보관함' : '감성 명언 라이브러리'}</h2>
                  <p className="text-xs text-gray-400 font-bold">원하는 문구를 선택하면 바로 디자인에 반영됩니다.</p>
                </div>
              </div>
              
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button onClick={() => setActiveSuggestionType('message')} className={\`px-6 py-2.5 rounded-xl text-xs font-black transition-all \${activeSuggestionType === 'message' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 opacity-60'}\`}>메세지 샘플</button>
                <button onClick={() => setActiveSuggestionType('quote')} className={\`px-6 py-2.5 rounded-xl text-xs font-black transition-all \${activeSuggestionType === 'quote' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 opacity-60'}\`}>감성 명언</button>
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
                    className={\`w-full text-left px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all \${selectedCategory === v ? 'bg-white shadow-md text-indigo-600 ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-100'}\`}
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
      )}`;

    content = content.substring(0, insertPos) + suggestionModalUI + content.substring(insertPos);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Success: Fixed Modal position. Rescued from FormtecModal and moved to Main return.");
} else {
    console.log("Failure: Main return not found.");
}
