
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 578~580라인 (1-indexed 기준 578, 579, 580) 삭제
// 0-indexed로는 577, 578, 579
// 주의: splice를 하면 인덱스가 당겨지므로 조심해서 작업
// 578행이 "const selectedTextBlock"으로 시작하는지 확인 후 삭제
if (lines[577].includes('const selectedTextBlock')) {
    lines.splice(577, 3); // 3줄 삭제
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log("Deduplication Successful");
} else {
    // 만약 인덱스가 안 맞으면 내용으로 찾기
    const startIdx = lines.findIndex(l => l.includes('const selectedTextBlock') && l.includes('selectedBlockId'));
    if (startIdx !== -1) {
       lines.splice(startIdx, 3);
       fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
       console.log("Deduplication via Search Successful");
    } else {
       console.log("Could not find targets");
    }
}
