
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetBefore = "                          <X size={14} /> 글자 삭제\n                        </button>\n                      </div>\n                    </div>";
const targetAfter = "            <div className={`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${expandedSections.includes('photos')";

const beforeIdx = content.indexOf(targetBefore);
const afterIdx = content.indexOf(targetAfter);

if (beforeIdx !== -1 && afterIdx !== -1) {
    const recoveryTags = `\n                  ) : null}\n                </div>\n              )}\n            </div>\n\n`;
    const newContent = content.substring(0, beforeIdx + targetBefore.length) + recoveryTags + content.substring(afterIdx);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Final Emergency Recovery Successful");
} else {
    console.log("Search strings not found. indices:", beforeIdx, afterIdx);
}
