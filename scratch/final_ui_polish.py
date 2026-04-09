# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def final_ui_polish():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        # 폼텍 모달 및 남은 자잘한 깨짐들 수정
        new_lines = []
        for line in lines:
            new_line = line
            # 폼텍 모달 제목 (기존 ?뤇截? 등)
            if "PAPER_PRESETS.find" in line and "formtecLabelType" in line:
                new_line = "            <h3 className=\"text-xl font-bold text-gray-800 flex items-center gap-2\">\n" + \
                           "              폼텍 {PAPER_PRESETS.find(p => p.id === formtecLabelType)?.label || '라벨'} 인쇄\n" + \
                           "            </h3>\n"
            # 남은 한글 주석들
            new_line = new_line.replace("{/* 洹몃━???좏깮湲?*/}", "{/* 그리드 선택기 */}")
            new_line = new_line.replace("AI媛€ ?몄긽?????꾨쫫?듦쾶 ?붿옄?명븯怨??덉뒿?덈떎...", "AI가 세상을 더 아름답게 디자인하고 있습니다...")
            new_line = new_line.replace("?좎떆留?湲곕떎?ㅼ＜?몄슂 (??2~3珥??뚯슂)", "잠시만 기다려주세요 (약 2~3초 소요)")
            
            # 페이지 스위처 라벨
            new_line = new_line.replace("?쒖? (Outside)", "겉지 (Outside)")
            new_line = new_line.replace("?댁? (Inside)", "내지 (Inside)")
            
            new_lines.append(new_line)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Final UI Polish Complete!")
    except Exception as e:
        print(f"Error: {e}")

final_ui_polish()
