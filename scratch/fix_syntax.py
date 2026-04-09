# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    # 322번 줄: updateTextBlockContent 호출 방식으로 복구
    for i in range(len(lines)):
        # 310~340번 줄 사이의 recipientName 업데이트 로직 타격
        if 310 <= i+1 <= 340 and "recipientName || '받는 분'" in lines[i]:
            lines[i] = "      updateTextBlockContent(toBlockId, { text: `To. ${recipientName || '받는 분'}` });\n"
            print(f"Fixed update call at line {i+1}")
            
        # 310~340번 줄 사이의 senderName 업데이트 로직 타격
        if 310 <= i+1 <= 340 and "senderName || '보내는 사람'" in lines[i]:
            lines[i] = "      updateTextBlockContent(fromBlockId, { text: `From. ${senderName || '보내는 사람'}` });\n"
            print(f"Fixed update call at line {i+1}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Python Fix Syntax Success!")
except Exception as e:
    print(f"Error: {e}")
