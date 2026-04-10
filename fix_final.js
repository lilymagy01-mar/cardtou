const fs = require('fs');
const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. 별표 연산자(⭐) 정화
content = content.replace(/⭐/g, '??');

// 2. 기본 텍스트 블록 생성 시 테두리 추가 (601행 부근)
content = content.replace(
    /addTextBlock\(\{\s+text: '내용을 입력하세요',/,
    `addTextBlock({
      text: '내용을 입력하세요',
      colorHex: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 0.5,`
);

// 3. 의존성 배열 수정 (selectedBlockIds 추가)
content = content.replace(
    /\}, \[selectedBlockId, textBlocks, imageBlocks, removeTextBlock, removeImageBlock\]\);/,
    '}, [selectedBlockId, selectedBlockIds, textBlocks, imageBlocks, removeTextBlock, removeImageBlock]);'
);

// 4. 남은 잔당 주석 및 레이블 정화
const finalLabels = {
    'STROKE WIDTH (?뚮몢由?': 'STROKE WIDTH (테두리)',
    'OPACITY (?щ챸??': 'OPACITY (투명도)',
    '?좏깮 ?붿냼 ??젣': '선택 요소 삭제',
    '??釉뚮옖???먮룞 諛곗튂': '상점 브랜딩 자동 배치',
    '???대쫫 誘몄???': '상점 이름 미지정',
    '?곕씫泥?誘몄???': '연락처 미지정',
    '紐낆뼵 諛ꗯ?': '명언 배치',
    '硫붿떆吏€ 諛ꗯ?': '메시지 배치',
    '紐낆뼵 湲곕낯 ?щ챸??': '명언 기본 투명도',
    '??젣 ?쒓굅': '두께 제거',
    '?묒? ??醫뚯륫': '접힌 면 좌측',
    '?묒? ???곗륫': '접힌 면 우측'
};

for (const [key, value] of Object.entries(finalLabels)) {
    content = content.split(key).join(value);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Final polish and purification complete!');
