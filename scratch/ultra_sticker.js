
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 필요한 모든 프리미엄 폰트(스티커용) 추가 로드
const allFonts = `@import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Dokdo&family=East+Sea+Dokdo&family=Gaegu&family=Gamja+Flower&family=Gugi&family=Hi+Melody&family=Jua&family=Nanum+Pen+Script&family=Yeon+Sung&family=Nanum+Myeongjo:wght@400;700;800&family=Dancing+Script:wght@700&family=Modak&family=Noto+Sans+KR:wght@400;700;900&display=swap');`;

content = content.replace(/@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=[\s\S]*?'\);/, allFonts);

// 2. 퀵-슬로건 핸들러의 스타일을 '초정밀 스티커'로 업그레이드
const ultraStickerHandler = `                          onClick={() => {
                            const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
                            let targetX = currentDimension.widthMm / 2;
                            let targetY = currentDimension.heightMm * 0.7;

                            if (foldType === 'half') {
                              targetX = isLandscape ? (currentDimension.widthMm * 0.75) : (currentDimension.widthMm * 0.5);
                              targetY = isLandscape ? (currentDimension.heightMm * 0.5) : (currentDimension.heightMm * 0.75);
                            }

                            addTextBlock({
                              text: slogan.text,
                              x: targetX,
                              y: targetY,
                              fontSize: 42, // 더 시원시원하게 키움
                              textAlign: 'center',
                              colorHex: slogan.color || '#1e293b',
                              fontFamily: slogan.font || "'Nanum Pen Script', cursive",
                              opacity: 1.0,
                              width: 180,
                              lineHeight: 1.1,
                              fontWeight: 'normal',
                              rotation: (Math.random() * 8) - 4, 
                              // [초필살기] 다중 레이어 텍스트 섀도우로 완벽한 '화이트 스티커 테두리' 구현
                              textShadow: '3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 0 0 15px rgba(255,255,255,1), 0 5px 15px rgba(0,0,0,0.2)'
                            });
                          }}`;

const stickerHandlerRegex = /\s+onClick=\{\(\) => \{\s+\/\/ \[각도기\] 황금 비율 배치 계산[\s\S]*?\}\s+\}\}/;
content = content.replace(stickerHandlerRegex, ultraStickerHandler);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Ultra Sticker Fonts & Effect Integrated");
