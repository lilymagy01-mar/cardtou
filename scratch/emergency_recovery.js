
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 5번 섹션의 시작 위치 찾기
const section5Search = "{/* 5. Photos & Images Section";
const s5Idx = content.indexOf(section5Search);

// 텍스트 삭제 버튼의 끝 위치 찾기 (근처에서 가장 가까운 </div>)
const textDeleteSearch = "글자 삭제";
const textDeleteIdx = content.lastIndexOf(textDeleteSearch, s5Idx);

if (s5Idx !== -1 && textDeleteIdx !== -1) {
    // textDeleteIdx 이후로 닫히는 태그들 찾기
    const afterDelete = content.substring(textDeleteIdx);
    const firstEndDiv = afterDelete.indexOf('</div>');
    const absoluteEndDiv = textDeleteIdx + firstEndDiv + 6;
    
    // 복구할 태그 뭉치
    const recoveryTags = `
                    </div>
                  ) : null}
                </div>
              )}
            </div>\n\n            `;
            
    const newContent = content.substring(0, absoluteEndDiv) + recoveryTags + content.substring(s5Idx);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Emergency Recovery Successful");
}
