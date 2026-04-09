# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def final_polish():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        new_lines = []
        for line in lines:
            # 타겟 키워드 포함 시 라인 강제 재작성
            if "인쇄" in line and "위치" in line and "선택" in line:
                new_lines.append(line.split('<label')[0] + '인쇄 위치 선택 <span className="text-emerald-600">({formtecSelectedCells.length}/{totalCells})</span>\n')
            elif "메시지" in line and "입력" in line and "label" in line:
                new_lines.append('            <label className="block text-xs font-bold text-gray-600 mb-2">인쇄 메시지</label>\n')
            elif "스타일" in line and "조절" in line:
                new_lines.append('          {/* 스타일 조절 */}\n')
            elif "내용을 입력하세요.." in line:
                new_lines.append('              placeholder="내용을 입력하세요.."\n')
            else:
                new_lines.append(line)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Final Polish Complete!")
    except Exception as e:
        print(f"Error: {e}")

final_polish()
