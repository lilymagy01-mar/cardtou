
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 퀵-슬로건 배치 로직 정밀 교정 (너비 제한 및 영역 고정)
const preciseStickerHandler = `                          onClick={() => {
                            const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
                            
                            // 1. 영역별 가로폭(Page Width) 계산
                            const pageWidth = foldType === 'half' ? currentDimension.widthMm / 2 : currentDimension.widthMm;
                            
                            // 2. 앞면(Front Cover)의 가로 중심값 정밀 계산
                            let targetX = currentDimension.widthMm / 2; // 기본 (Flat)
                            let targetY = currentDimension.heightMm * 0.7; // 하단 70%

                            if (foldType === 'half') {
                              if (isLandscape) {
                                // 가로형 반접이: [뒷면(0~105) | 앞면(105~210)] -> 앞면 중심은 157.5
                                targetX = currentDimension.widthMm * 0.75;
                                targetY = currentDimension.heightMm * 0.5; // 가로형은 세로 중앙이 예쁨
                              } else {
                                // 세로형 반접이: [뒷면(상단) | 앞면(하단)] -> 앞면 중심은 하단 75% 지점
                                targetX = currentDimension.widthMm * 0.5;
                                targetY = currentDimension.heightMm * 0.75;
                              }
                            }

                            // 3. 슬로건 너비 제한 (페이지 폭의 80%를 넘지 않도록 설정하여 뒷면 침범 원천 차단)
                            const maxStickerWidth = pageWidth * 0.8;

                            addTextBlock({
                              text: slogan.text,
                              x: targetX,
                              y: targetY,
                              fontSize: 36, // 조금 더 컴팩트하게 조정
                              textAlign: 'center',
                              colorHex: slogan.color || '#1e293b',
                              fontFamily: slogan.font || "'Nanum Pen Script', cursive",
                              opacity: 1.0,
                              width: maxStickerWidth, // [침범 방지 핵심] 페이지 반쪽 너비 이내로 강제 제한
                              lineHeight: 1.1,
                              fontWeight: 'normal',
                              rotation: (Math.random() * 6) - 3, 
                              textShadow: '3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 0 0 10px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.15)'
                            });
                          }}`;

const ultraHandlerRegex = /\s+onClick=\{\(\) => \{\s+const isLandscape = currentDimension\.widthMm > currentDimension\.heightMm;[\s\S]*?textShadow: '3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 0 0 15px rgba\(255,255,255,1\), 0 5px 15px rgba\(0,0,0,0\.2\)'\s+\}\);\s+\}\}/;
content = content.replace(ultraHandlerRegex, preciseStickerHandler);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Sticker Invasion Fixed: Width & Positioning Corrected");
