# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    # 435번 줄 복구 (0-indexed: 434)
    # 기존: text: `To. ${recipientName || '받는 ?}`,
    # 실제 파일에서는 인덱스가 밀렸을 수 있으니 라인 내용 확인 후 교체하는 것이 안전합니다.
    # 하지만 앞서 수술로 라인 번호가 크게 변하지 않았으므로 434를 시도합니다.
    # 만약 틀어짐을 대비해 근처 라인을 검색하여 타격합니다.
    
    for i in range(len(lines)):
        if "recipientName || '받는" in lines[i] or "recipientName || '諛쏅뒗" in lines[i]:
            lines[i] = f"        text: `To. ${{recipientName || '받는 분'}}`,\n"
            print(f"Fixed recipient label at line {i+1}")
        
        if "senderName || '보내" in lines[i] or "senderName || '蹂대궡" in lines[i]:
            lines[i] = f"        text: `From. ${{senderName || '보내는 사람'}}`,\n"
            print(f"Fixed sender label at line {i+1}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Python Global Cleanup Success!")
except Exception as e:
    print(f"Error: {e}")
