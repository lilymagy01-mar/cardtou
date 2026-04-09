# -*- coding: utf-8 -*-

file_path = r'e:\cardtou\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

for i, line in enumerate(lines):
    # Insert missing states right after activeSuggestionType
    if "const [activeSuggestionType" in line:
        new_lines.append(line)
        if not any("selectedCategory" in l for l in lines[i:i+5]):
            new_lines.append("  const [selectedCategory, setSelectedCategory] = useState<string>('all');\n")
            new_lines.append("  const [selectedLang, setSelectedLang] = useState<'ko' | 'en'>('ko');\n")
        continue

    # Replace the sidebar section
    if "3. 추천 메시지 & 펜김의 감성 큐레이션" in line:
        skip = True
        new_lines.append("            {/* 3. 추천 메시지 & 감성 큐레이션 (복구 완료) */}\n")
        new_lines.append("""            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm p-3 mb-2">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setActiveSuggestionType('message'); setIsSuggestionModalOpen(true); }}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl hover:shadow-md hover:border-blue-400 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><MessageSquareText size={20} /></div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-800">메세지 샘플 검색</p>
                    <p className="text-[10px] text-gray-400 font-bold">사랑, 축하, 감사 테마별 문구</p>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSuggestionType('quote'); setIsSuggestionModalOpen(true); }}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl hover:shadow-md hover:border-indigo-400 transition-all group"
                >
                  <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Sparkles size={20} /></div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-800">감성 명언 찾기</p>
                    <p className="text-[10px] text-gray-400 font-bold">인생, 성공, 행복 격언 모음</p>
                  </div>
                </button>
              </div>
            </div>\n""")
        continue
        
    if skip:
        if "4. Inside Setting Section" in line:
            skip = False
            new_lines.append("\n")
            new_lines.append(line)
        continue
        
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Surgery completed: injected states and replaced sidebar UI with buttons!")
