# -*- coding: utf-8 -*-
import sys
import re

diff_file = r'e:\cardtou\scratch\diff_page.txt'
target_file = r'e:\cardtou\src\app\page.tsx'

def resurrect():
    try:
        with open(diff_file, 'r', encoding='utf-16', errors='ignore') as f:
            diff_lines = f.readlines()
            
        # Find the last hunk
        hunk_start_idx = -1
        for i, line in enumerate(diff_lines):
            if line.startswith('@@'):
                hunk_start_idx = i
                
        if hunk_start_idx == -1:
            print("No hunk found.")
            return

        last_hunk = diff_lines[hunk_start_idx:]
        
        # We need to extract the "original" lines from this hunk.
        # Lines starting with '-' or ' ' (space) are from the original file.
        recovered_lines = []
        for line in last_hunk[1:]: # skip the @@ line
            if line.startswith('-') or line.startswith(' '):
                # Remove the first character
                recovered_content = line[1:]
                recovered_lines.append(recovered_content)
                
        # Now we have the original 700 deleted lines!
        # Let's perform the intended operations:
        # 1. REMOVE the bad fragment representing 1580-1730
        cleaned_recovered = []
        skip_mode = False
        
        for idx, r_line in enumerate(recovered_lines):
            if "{/* Message Suggestion Modal */}" in r_line and not skip_mode:
                skip_mode = True
                continue
                
            if skip_mode:
                if r_line.strip() == ")}":
                    # Check if next line is Shop Branding Settings Modal
                    if idx + 1 < len(recovered_lines) and "{/* Shop Branding Settings Modal */}" in recovered_lines[idx+1]:
                        skip_mode = False
                continue
                
            # 2. Fix the translations
            new_line = r_line
            new_line = new_line.replace("??釉뚮옖???ㅼ젙", "샵 브랜드 설정")
            new_line = new_line.replace("移대뱶???먮룞?쇰줈 ?몄뇙?섎뒗 釉뚮옖???뺣낫瑜?愿€由ы빀?덈떎.", "카드에 자동으로 삽입되는 브랜드 정보를 관리합니다.")
            new_line = new_line.replace("釉뚮옖??濡쒓퀬", "브랜드 로고")
            new_line = new_line.replace("濡쒓퀬 ?대?吏€ ?낅줈??", "로고 이미지 업로드")
            new_line = new_line.replace("배경???녿뒗 ?щ챸??PNG ?뚯씪??沅뚯옣?⑸땲?? (300dpi ?댁긽)", "배경이 없는 투명한 PNG 파일을 권장합니다. (300dpi 이상)")
            new_line = new_line.replace("?섑뵆 濡쒓퀬 ?ㅼ슫濡쒕뱶", "샘플 로고 다운로드")
            new_line = new_line.replace("?곸꽭 ?뺣낫", "상세 정보")
            new_line = new_line.replace("留ㅼ옣 ?대쫫 (?? 苑껋쓣 ??? ??", "매장 이름 (예: 꽃을 담은 밤)")
            
            cleaned_recovered.append(new_line)
            
        print(f"Recovered and cleaned {len(cleaned_recovered)} lines.")
        
        # Now append to target file
        with open(target_file, 'a', encoding='utf-8') as f:
            f.writelines(cleaned_recovered)
            
        print("Resurrection Success!")
        
    except Exception as e:
        print(f"Error: {e}")

resurrect()
