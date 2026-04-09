# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def line_number_fix():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        # 줄 번호 기준 강제 치환 (0-indexed)
        # 2292번 줄
        lines[2291] = '          <p className="text-xs text-gray-500 mt-1">인쇄할 위치를 클릭하여 선택하세요</p>\n'
        # 2300번 줄
        lines[2299] = '                인쇄 위치 선택 <span className="text-emerald-600">({formtecSelectedCells.length}/{totalCells})</span>\n'
        # 2336번 줄
        lines[2335] = '          {/* 메시지 입력 */}\n'
        # 2338번 줄
        lines[2337] = '            <label className="block text-xs font-bold text-gray-600 mb-2">인쇄 메시지</label>\n'
        # 2347번 줄
        lines[2346] = '          {/* 스타일 조절 */}\n'

        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Line Number Fix Complete!")
    except Exception as e:
        print(f"Error: {e}")

line_number_fix()
