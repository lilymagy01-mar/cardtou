
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetSearch = "alert('AI 마법사가 배경을 지우는 중입니다... (시뮬레이션)');";
const replacement = `try {
                              setIsGenerating(true);
                              // 동적 임포트로 무거운 AI 라이브러리를 필요할 때만 로드
                              const removeBackground = (await import('@imgly/background-removal')).default;
                              
                              // 배경 제거 실행 (브라우저 자체 AI 사용)
                              const blob = await removeBackground(selectedImageBlock.url, {
                                progress: (step, current, total) => {
                                  console.log(\`BG Removal: \${step} \${current}/\${total}\`);
                                }
                              });
                              
                              // Blob을 DataURL로 변환
                              const reader = new FileReader();
                              reader.readAsDataURL(blob);
                              reader.onloadend = () => {
                                const base64data = reader.result as string;
                                updateImageBlockContent(selectedImageBlock.id, { url: base64data });
                              };
                              
                            } catch (bgError: any) {
                              console.error('Background removal failed:', bgError);
                              alert('배경 제거에 실패했습니다. 사진을 확인해 주세요.');
                            } finally {
                              setIsGenerating(false);
                            }`;

if (content.includes(targetSearch)) {
    content = content.replace(targetSearch, replacement);
    // filter 업데이트 로직은 삭제 (이미지 자체가 바뀌므로)
    content = content.replace("updateImageBlockContent(selectedImageBlock.id, { filter: 'contrast(1.1) brightness(1.05)' });", "");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Real AI Background Removal Integrated");
} else {
    console.log("Target button handler not found");
}
