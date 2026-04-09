# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def force_replace():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        new_lines = []
        for i, line in enumerate(lines):
            new_line = line
            
            # 주석 복구
            if "{/* ?대?吏€ ?몄쭛 ?꾧뎄 */}" in new_line:
                new_line = new_line.replace("{/* ?대?吏€ ?몄쭛 ?꾧뎄 */}", "{/* 이미지 편집 도구 */}")
            
            # 라벨명 복구
            if "?ъ쭊 ?꾨Ц媛€ 紐⑤뱶" in new_line:
                new_line = new_line.replace("?ъ쭊 ?꾨Ц媛€ 紐⑤뱶", "사진 전문가 모드")
                
            # 가장 중요한 따옴표 에러 복구
            if "title=\"留??욎쑝濡? className=" in new_line:
                new_line = new_line.replace("title=\"留??욎쑝濡? className=", 'title="맨 앞으로" className=')
            
            if "title=\"留??ㅻ줈\" className=" in new_line:
                new_line = new_line.replace("title=\"留??ㅻ줈\" className=", 'title="맨 뒤로" className=')
                
            # 혹시 모를 따옴표 유실 버전
            if "title=\"留??ㅻ줈\" className=" not in line and "title=\"留??ㅻ줈? className=" in line:
                new_line = line.replace("title=\"留??ㅻ줈? className=", 'title="맨 뒤로" className=')
                
            new_lines.append(new_line)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Python Force Replace Success!")
    except Exception as e:
        print(f"Error: {e}")

force_replace()
