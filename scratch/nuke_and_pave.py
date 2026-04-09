# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def nuke_and_pave():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        new_lines = []
        skip_mode = False
        
        for i, line in enumerate(lines):
            # 1. 썩은 파편 도려내기 (1580 ~ 1730 라인 근처)
            if "{/* Message Suggestion Modal */}" in line and not skip_mode:
                # 여기서부터 무자비하게 자릅니다.
                print(f"Began nuking fragment at line {i+1}")
                skip_mode = True
                continue
                
            if skip_mode:
                # 1730 근처에서 파편의 끝부분 확인 후 삭제 중단
                if line.strip() == ")}":
                    # 그 다음 줄부터는 살려야 하므로, 다음 줄부터 중단
                    if i + 1 < len(lines) and "{/* Shop Branding Settings Modal */}" in lines[i+1]:
                        print(f"Stopped nuking fragment at line {i+1}")
                        skip_mode = False
                continue
            
            # 2. 살아남은 라벨 정화
            new_line = line
            # 1732번 줄 이하 샵 세팅 모달 라벨들
            new_line = new_line.replace("??釉뚮옖???ㅼ젙", "샵 브랜드 설정")
            new_line = new_line.replace("移대뱶???먮룞?쇰줈 ?몄뇙?섎뒗 釉뚮옖???뺣낫瑜?愿€由ы빀?덈떎.", "카드에 자동으로 삽입되는 브랜드 정보를 관리합니다.")
            new_line = new_line.replace("釉뚮옖??濡쒓퀬", "브랜드 로고")
            new_line = new_line.replace("濡쒓퀬 ?대?吏€ ?낅줈??", "로고 이미지 업로드")
            new_line = new_line.replace("배경???녿뒗 ?щ챸??PNG ?뚯씪??沅뚯옣?⑸땲?? (300dpi ?댁긽)", "배경이 없는 투명한 PNG 파일을 권장합니다. (300dpi 이상)")
            new_line = new_line.replace("?섑뵆 濡쒓퀬 ?ㅼ슫濡쒕뱶", "샘플 로고 다운로드")
            new_line = new_line.replace("?곸꽭 ?뺣낫", "상세 정보")
            new_line = new_line.replace("留ㅼ옣 ?대쫫 (?? 苑껋쓣 ??? ??", "매장 이름 (예: 꽃을 담은 밤)")
            
            # 혹시 모를 찌꺼기
            if "?뚮쭏???댁슱由щ뒗" in new_line:
                new_line = ""

            new_lines.append(new_line)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Nuke and Pave Success!")
    except Exception as e:
        print(f"Error: {e}")

nuke_and_pave()
