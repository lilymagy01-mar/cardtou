# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

# 2300번대 인코딩 잔해 타격 리스트
RECOVERY_LIST = [
    ("?쇄 ?치 ?택", "인쇄 위치 선택"),
    ("메시지 ?력", "메시지 입력"),
    ("?쇄 메시지", "인쇄 메시지"),
    ("????조절", "스타일 조절"),
    ("?댁슜???낅젰?섏꽭??..", "내용을 입력하세요..")
]

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    fixed_lines = []
    for i, line in enumerate(lines):
        new_line = line
        for old, new in RECOVERY_LIST:
            if old in new_line:
                new_line = new_line.replace(old, new)
        fixed_lines.append(new_line)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    print("Python DEEP RECOVERY Success!")
except Exception as e:
    print(f"Error: {e}")
