# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def force_replace_branding():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        new_lines = []
        for i, line in enumerate(lines):
            new_line = line
            
            # 1330~1380 구간 핵심 타격
            if "??釉뚮옖???먮룞 諛곗튂" in new_line:
                new_line = new_line.replace("??釉뚮옖???먮룞 諛곗튂", "샵 브랜드 자동 배치")
                
            # 가장 중요한 따옴표 에러 복구
            if "{shopSettings.name || '???대쫫 誘몄???}</p>" in new_line:
                new_line = new_line.replace("{shopSettings.name || '???대쫫 誘몄???}</p>", "{shopSettings.name || '샵 이름 미지정'}</p>")
                
            if "{shopSettings.tel || '?곕씫泥?誘몄???}</p>" in new_line:
                new_line = new_line.replace("{shopSettings.tel || '?곕씫泥?誘몄???}</p>", "{shopSettings.tel || '연락처 미지정'}</p>")
                
            if "?욌㈃??諛곗튂" in new_line:
                new_line = new_line.replace("?욌㈃??諛곗튂", "앞면에 배치")
                
            if "?룸㈃??諛곗튂" in new_line:
                new_line = new_line.replace("?룸㈃??諛곗튂", "뒷면에 배치")
                
            new_lines.append(new_line)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Python Branding Fix Success!")
    except Exception as e:
        print(f"Error: {e}")

force_replace_branding()
