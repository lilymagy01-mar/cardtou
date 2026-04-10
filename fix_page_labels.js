const fs = require('fs');
const path = 'src/app/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// 1. PAPER_PRESETS (48-63행) 정화 - 인덱스 47부터 62까지
const newPresets = [
    'const PAPER_PRESETS = [',
    '  // 용지 규격',
    '  { id: \'a5\', label: \'A5 (148x210mm)\', widthMm: 210, heightMm: 148, group: \'용지 규격\' },',
    '  { id: \'a4\', label: \'A4 (210x297mm)\', widthMm: 297, heightMm: 210, group: \'용지 규격\' },',
    '  { id: \'a3\', label: \'A3 (297x420mm)\', widthMm: 420, heightMm: 297, group: \'용지 규격\' },',
    '  { id: \'a2\', label: \'A2 (420x594mm)\', widthMm: 594, heightMm: 420, group: \'용지 규격\' },',
    '  { id: \'a6\', label: \'A6 (105x148mm)\', widthMm: 148, heightMm: 105, group: \'용지 규격\' },',
    '  { id: \'custom-card\', label: \'일반 카드 (100x150mm)\', widthMm: 150, heightMm: 100, group: \'용지 규격\' },',
    '  { id: \'postcard\', label: \'엽서 (105x148mm)\', widthMm: 105, heightMm: 148, group: \'용지 규격\' },',
    '  // 폼텍 라벨 (사용자 요청 5종: 1, 2, 6, 8, 12칸)',
    '  { id: \'formtec-1\', label: \'3130 (1칸 - A4 전체)\', widthMm: 210, heightMm: 297, group: \'폼텍 라벨\' },',
    '  { id: \'formtec-2\', label: \'3102 (2칸 - A4 반절)\', widthMm: 199.6, heightMm: 143.5, group: \'폼텍 라벨\' },',
    '  { id: \'formtec-6\', label: \'3639 (6칸 - 105x99mm)\', widthMm: 105, heightMm: 99, group: \'폼텍 라벨\' },',
    '  { id: \'formtec-8\', label: \'3114 (8칸 - 물류용)\', widthMm: 99.1, heightMm: 67.7, group: \'폼텍 라벨\' },',
    '  { id: \'formtec-12\', label: \'3112 (12칸 - 주소용)\', widthMm: 63.5, heightMm: 70, group: \'폼텍 라벨\' },',
    '];'
];
lines.splice(47, 16, ...newPresets);

// 2. 개별 레이블 치환 (문자열 매칭)
let content = lines.join('\n');
const labels = {
    'text-[10px] font-bold">?띿뒪??/span>': 'text-[10px] font-bold">텍스트</span>',
    'text-[10px] font-bold">?ъ쭊 異붽?</span>': 'text-[10px] font-bold">사진 추가</span>',
    'text-[10px] font-bold">諛곌꼍 ?ㅼ젙</span>': 'text-[10px] font-bold">배경 설정</span>',
    'text-gray-400 font-bold">?꾨겮쨌?꾪꽣쨌?꾨젅??1踰꾪듉 ?몄쭛</p>': 'text-gray-400 font-bold">스티커/이미지/도형 1버튼 편집</p>',
    'text-gray-400 font-bold">?щ옉, 異뺥븯, 媛먯궗 ?뚮쭏蹂?臾멸뎄</p>': 'text-gray-400 font-bold">사랑, 축하, 감사 테마별 문구</p>',
    'text-gray-400 font-bold">?몄깮, ?깃났, ?됰났 寃⑹뼵 紐⑥쓬</p>': 'text-gray-400 font-bold">인생, 성공, 행복 격언 모음</p>'
};

for (const [key, value] of Object.entries(labels)) {
    content = content.split(key).join(value);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Page labels and presets restored successfully!');
