# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    # 322번 줄 복구 (0-indexed: 321)
    # 기존: updateTextBlockContent(toBlockId, { text: `To. ${recipientName || '諛쏅뒗 遺?}` });
    lines[321] = "      updateTextBlockContent(toBlockId, { text: `To. ${recipientName || '받는 분'}` });\n"
    
    # 328번 줄 복구 (0-indexed: 327)
    # 기존: updateTextBlockContent(fromBlockId, { text: `From. ${senderName || '蹂대궡???щ엺'}` });
    lines[327] = "      updateTextBlockContent(fromBlockId, { text: `From. ${senderName || '보내는 사람'}` });\n"

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Python Fix UI Labels Success!")
except Exception as e:
    print(f"Error: {e}")
