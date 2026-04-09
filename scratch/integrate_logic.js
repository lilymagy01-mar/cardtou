
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = "const selectedImageBlock = imageBlocks.find(b => b.id === selectedBlockId);";
const replacement = `const selectedTextBlock = textBlocks.find(b => b.id === selectedBlockId);
  const selectedImageBlock = imageBlocks.find(b => b.id === selectedBlockId);
  const selectedBlock = (selectedTextBlock as any) || (selectedImageBlock as any);`;

if (content.includes(target)) {
    // 만약 이미 selectedTextBlock이 있다면 (중복 방지)
    if (!content.includes('const selectedTextBlock = textBlocks.find')) {
        content = content.replace(target, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Integration Successful");
    } else {
        console.log("Already Integrated");
    }
} else {
    console.log("Target string not found precisely. Trying fuzzy match...");
    // 혹시 띄어쓰기가 다를 수 있으니 유연하게 찾기
    const lines = content.split('\n');
    const idx = lines.findIndex(l => l.includes('selectedImageBlock = imageBlocks.find') && l.includes('selectedBlockId'));
    if (idx !== -1) {
        lines[idx] = replacement;
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log("Fuzzy Integration Successful");
    } else {
        console.log("Could not find target even with fuzzy match");
    }
}
