# -*- coding: utf-8 -*-
import sys
import re

file_path = r'e:\cardtou\src\app\page.tsx'

def absolute_final_fix():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # 폼텍 라벨 제목 복구
        content = re.sub(r'\s*{PAPER_PRESETS\.find\(p => p\.id === formtecLabelType\)\?\.label \|\| \'\'\} μ', 
                         "폼텍 {PAPER_PRESETS.find(p => p.id === formtecLabelType)?.label || '라벨'} 인쇄", content)
        
        # 기타 남은 외계어 타격
        content = content.replace("?뤇截? ?쇳뀓 ?쇰꺼", "폼텍 라벨 인쇄")
        content = content.replace("?쒖? (Outside)", "겉지 (Outside)")
        content = content.replace("?댁? (Inside)", "내지 (Inside)")
        content = content.replace("?띿뒪??", "텍스트")
        content = content.replace("諛곌꼍", "배경")
        content = content.replace("而ㅼ뒪?€ ?꾩븞 媛ㅻ윭由?", "커스텀 도안 갤러리")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Absolute Final Fix Success!")
    except Exception as e:
        print(f"Error: {e}")

absolute_final_fix()
