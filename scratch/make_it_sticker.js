
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 퀵-슬로건에 상황별 맞춤 폰트와 스타일(스티커 효과) 부여
const stickerSlogans = `const QUICK_SLOGANS = [
  { text: "감사합니다", font: "'Nanum Myeongjo', serif", color: "#1e293b" },
  { text: "고맙습니다", font: "'Nanum Pen Script', cursive", color: "#db2777" },
  { text: "사랑합니다", font: "'Gaegu', cursive", color: "#e11d48" },
  { text: "항상 건강하세요", font: "'Nanum Myeongjo', serif", color: "#1e293b" },
  { text: "오늘도 수고했어", font: "'Nanum Pen Script', cursive", color: "#2563eb" },
  { text: "너때문에 행복해", font: "'Gaegu', cursive", color: "#7c3aed" },
  { text: "꽃길만 걷자", font: "'Black Han Sans', sans-serif", color: "#059669" },
  { text: "생일 축하해!", font: "'Jua', sans-serif", color: "#ea580c" },
  { text: "Best Wishes", font: "'Dancing Script', cursive", color: "#1e293b" },
  { text: "Happy Day", font: "'Modak', cursive", color: "#be185d" }
];`;

content = content.replace(/const QUICK_SLOGANS = \[[\s\S]*?\];/, stickerSlogans);

// 2. 퀵-슬로건 클릭 시 '전문적 스티커' 형태로 추가되도록 핸들러 수정
const stickerHandler = `                          onClick={() => {
                            // [각도기] 황금 비율 배치 계산
                            const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
                            let targetX = currentDimension.widthMm / 2;
                            let targetY = currentDimension.heightMm * 0.7; // 하단 70% 지점 (안정감)

                            if (foldType === 'half') {
                              // 반접이일 경우 우측 표지면 영역 고려
                              targetX = isLandscape ? (currentDimension.widthMm * 0.75) : (currentDimension.widthMm * 0.5);
                              targetY = isLandscape ? (currentDimension.heightMm * 0.5) : (currentDimension.heightMm * 0.75);
                            }

                            addTextBlock({
                              text: slogan.text,
                              x: targetX,
                              y: targetY,
                              fontSize: 32,
                              textAlign: 'center',
                              colorHex: slogan.color || '#1e293b',
                              fontFamily: slogan.font || "'Nanum Pen Script', cursive",
                              opacity: 1.0,
                              width: 150,
                              lineHeight: 1.2,
                              fontWeight: 'normal',
                              rotation: (Math.random() * 6) - 3, // 살짝 기울여서 스티커 느낌 강조
                              // [강력 추천] 스티커 효과: 화이트 외곽선 + 부드러운 그림자
                              textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 4px 10px rgba(0,0,0,0.15)'
                            });
                          }}`;

// 기존 핸들러를 정교하게 치환
const oldHandlerRegex = /\s+onClick=\{\(\) => \{\s+addTextBlock\(\{[\s\S]*?\}\);\s+\}\}/;
content = content.replace(oldHandlerRegex, stickerHandler);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Sticker-Style Slogans Integrated");
