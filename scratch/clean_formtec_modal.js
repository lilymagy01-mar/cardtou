
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. FormtecModal을 통째로 원래 디자인으로 복구 (찌꺼기 제거)
const cleanFormtecModal = `function FormtecModal({
  isOpen, onClose, config, formtecLabelType, formtecSelectedCells, setFormtecSelectedCells,
  formtecMessage, setFormtecMessage, formtecFontSize, setFormtecFontSize,
  formtecIsBold, setFormtecIsBold, formtecTextAlign, setFormtecTextAlign,
  formtecBgColor, setFormtecBgColor, formtecTextColor, setFormtecTextColor,
  onPrint, isGenerating, setIsGenerating
}: any) {
  if (!isOpen) return null;
  const rows = config ? Math.ceil(config.cells / config.cols) : 1;
  const cols = config ? config.cols : 1;
  const totalCells = config ? config.cells : 1;

  const toggleCell = (idx: number) => {
    setFormtecSelectedCells((prev: any) =>
      prev.includes(idx) ? prev.filter((c: any) => c !== idx) : [...prev, idx]
    );
  };
  const selectAll = () => setFormtecSelectedCells(Array.from({ length: totalCells }, (_, i) => i));
  const clearAll = () => setFormtecSelectedCells([]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🏷️ {PAPER_PRESETS.find(p => p.id === formtecLabelType)?.label || '라벨'} 인쇄
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X size={24} className="text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">인쇄할 위치를 클릭하여 선택하세요</p>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 그리드 선택기 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600">
                인쇄 위치 선택 <span className="text-emerald-600">({formtecSelectedCells.length}/{totalCells})</span>
              </label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold">전체 선택</button>
                <button onClick={clearAll} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-500 rounded-md font-bold">전체 해제</button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
              <div
                className="bg-white rounded-lg border border-gray-300 mx-auto shadow-sm overflow-hidden"
                style={{ aspectRatio: '210/297', maxHeight: '300px' }}
              >
                <div
                  className="grid h-full w-full p-2"
                  style={{
                    gridTemplateColumns: \`repeat(\${cols}, 1fr)\`,
                    gridTemplateRows: \`repeat(\${rows}, 1fr)\`,
                    gap: '2px'
                  }}
                >
                  {Array.from({ length: totalCells }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleCell(idx)}
                      className={\`rounded border transition-all flex items-center justify-center text-[9px] \${formtecSelectedCells.includes(idx) ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-gray-300 border-gray-100'
                        }\`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 메시지 입력 */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">인쇄 메시지</label>
            <textarea
              value={formtecMessage}
              onChange={e => setFormtecMessage(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm h-20 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="내용을 입력하세요..."
            />
          </div>

          {/* 스타일 조절 */}
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 border-r pr-3">
              <button onClick={() => setFormtecFontSize(Math.max(8, formtecFontSize - 1))}><Minus size={16} /></button>
              <span className="text-xs font-bold w-4 text-center">{formtecFontSize}</span>
              <button onClick={() => setFormtecFontSize(Math.min(72, formtecFontSize + 1))}><Plus size={16} /></button>
            </div>
            <button
              onClick={() => setFormtecIsBold(!formtecIsBold)}
              className={\`p-1.5 rounded \${formtecIsBold ? 'bg-emerald-100 text-emerald-600' : ''}\`}
            >
              <Bold size={16} />
            </button>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(a => (
                <button key={a} onClick={() => setFormtecTextAlign(a)} className={\`p-1.5 rounded \${formtecTextAlign === a ? 'bg-emerald-100' : ''}\`}>
                  {a === 'left' ? <AlignLeft size={16} /> : a === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* 인쇄 실행 */}
          <button
            onClick={onPrint}
            disabled={!formtecMessage.trim() || formtecSelectedCells.length === 0 || isGenerating}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            🖨️ {formtecSelectedCells.length}개 라벨 인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}`;

// FormtecModal 함수 시작부터 끝까지 교체
const modalStartMarker = "function FormtecModal(";
const startIdx = content.indexOf(modalStartMarker);

if (startIdx !== -1) {
    // 파일 끝까지가 함수이므로 startIdx 이후를 통째로 교체
    content = content.substring(0, startIdx) + cleanFormtecModal;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Success: Cleaned up all debris in FormtecModal and restored it to original state.");
} else {
    console.log("Failure: FormtecModal not found.");
}
