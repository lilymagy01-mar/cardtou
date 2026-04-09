
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. aiDesignTheme -> (activeAiThemeTab || 'modern') 오타 수정
content = content.replace("PEN_KIM_COLLECTION[aiDesignTheme]", "PEN_KIM_COLLECTION[activeAiThemeTab || 'modern']");

// 2. onClick 핸들러에 async 키워드 추가 (배경 제거 로직용)
const targetOnClick = "                        <button\n                          onClick={() => {";
const asyncOnClick = "                        <button\n                          onClick={async () => {";

// 중복 방지를 위해 앞뒤 문맥까지 포함해서 찾기
const removalButtonContext = "const removeBackground = (await import('@imgly/background-removal')).default;";
const buttonStartPos = content.indexOf(removalButtonContext);

if (buttonStartPos !== -1) {
    // removalButtonContext 근처에서 가장 가까운 이전 onClick 찾기
    const beforeContent = content.substring(0, buttonStartPos);
    const lastOnClickIdx = beforeContent.lastIndexOf("onClick={() => {");
    if (lastOnClickIdx !== -1) {
        content = content.substring(0, lastOnClickIdx) + "onClick={async () => {" + content.substring(lastOnClickIdx + "onClick={() => {".length);
        console.log("Async keyword added to Magic Remove button");
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Bug Fixes Applied: Typo corrected and Async restored");
