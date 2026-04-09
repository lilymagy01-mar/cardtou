# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    # 2367번 줄 복구 (0-indexed: 2366)
    lines[2366] = "          {/* 인쇄 실행 */}\n"
    
    # 2373번 줄 복구 (0-indexed: 2372)
    # 기존: ?뼥截?{formtecSelectedCells.length}媛??쇰꺼 ?몄뇙?섍린
    lines[2372] = f"            선택한 {{formtecSelectedCells.length}}개의 라벨 인쇄하기\n"

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Python Final Polish Success!")
except Exception as e:
    print(f"Error: {e}")
