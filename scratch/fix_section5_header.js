
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const start = 1117; // 1-indexed 1118
const end = 1126;   // 1-indexed 1126

const replacement = `            <div className={\`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 \${expandedSections.includes('photos') ? 'ring-2 ring-orange-50 border-orange-100' : ''}\`}>
              <button
                onClick={() => toggleSection('photos')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon size={16} className={expandedSections.includes('photos') ? 'text-orange-500' : 'text-gray-400'} />
                  <span className={\`text-sm font-bold \${expandedSections.includes('photos') ? 'text-orange-600' : 'text-gray-700'}\`}>내 사진 & 이미지</span>
                </div>
                <div className={\`transition-transform duration-300 \${expandedSections.includes('photos') ? 'rotate-180' : ''}\`}>
                  <ArrowDown size={14} className="text-gray-400" />
                </div>
              </button>`;

lines.splice(start, end - start, replacement);
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log("Forced Fix Successful: Section 5 Header restored");
