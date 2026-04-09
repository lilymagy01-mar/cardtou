# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def remove_tag_duplication():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        new_lines = []
        skip = False
        for i in range(len(lines)):
            if skip:
                skip = False
                continue
            
            # 중복된 <h3> 태그 감지 및 제거
            if i < len(lines)-1 and '<h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">' in lines[i] and \
               '<h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">' in lines[i+1]:
                print(f"Found duplicated <h3> at line {i+1}, merging...")
                continue
            
            if i < len(lines)-1 and '</h3>' in lines[i].strip() and '</h3>' in lines[i+1].strip():
                print(f"Found duplicated </h3> at line {i+1}, merging...")
                continue
                
            new_lines.append(lines[i])

        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Tag Deduplication Success!")
    except Exception as e:
        print(f"Error: {e}")

remove_tag_duplication()
