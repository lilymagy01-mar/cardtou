
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 3번 섹션의 끝 (이미 이식된 새 버전)
const section3EndSearch = "/* 3. 퀵-슬로건 & 문구 라이브러리 (By 폰트김) */";
const s3Start = content.indexOf(section3EndSearch);

if (s3Start !== -1) {
    // s3의 닫는 </div> 태그 찾기
    let braceCount = 0;
    let foundFirstBrace = false;
    let s3End = -1;
    
    for (let i = s3Start; i < content.length; i++) {
        if (content[i] === '{') { braceCount++; foundFirstBrace = true; }
        if (content[i] === '}') { braceCount--; }
        if (foundFirstBrace && braceCount === 0) {
            s3End = i + 1;
            break;
        }
    }
    
    if (s3End !== -1) {
        // 다음 섹션(4번)의 시작 찾기
        const section4StartSearch = "/* 4. Inside Setting Section";
        const s4Start = content.indexOf(section4StartSearch);
        
        if (s4Start !== -1) {
            // s3End와 s4Start 사이를 공백으로 치환 (단, s4Start의 주석 태그 '/* ' 앞의 '            { ' 는 남겨야 할 수도 있음)
            // 하지만 보통 '            {/* 4.' 로 시작하니 s4Start 앞쪽의 공백까지만 살리기
            const lastNewlineBeforeS4 = content.lastIndexOf('\n', s4Start);
            const cleanContent = content.substring(0, s3End) + '\n\n' + content.substring(lastNewlineBeforeS4 + 1);
            fs.writeFileSync(filePath, cleanContent, 'utf8');
            console.log("Cleanup Successful");
        }
    }
}
