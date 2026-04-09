
const fs = require('fs');
const filePath = 'e:\\cardtou\\src\\app\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const faultyTarget = `                              const reader = new FileReader();
                              reader.readAsDataURL(blob);
                              reader.onloadend = () => {
                                const base64data = reader.result as string;
                                updateImageBlockContent(selectedImageBlock.id, { url: base64data });
                              };`;

const improvedVersion = `                              const dataUrl = await new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.onerror = reject;
                                reader.readAsDataURL(blob);
                              });
                              
                              updateImageBlockContent(selectedImageBlock.id, { url: dataUrl });`;

if (content.includes(faultyTarget)) {
    content = content.replace(faultyTarget, improvedVersion);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("UX Polish: Background Removal Flow Optimized");
} else {
    console.log("Target pattern not found for polish");
}
