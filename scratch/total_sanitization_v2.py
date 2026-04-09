# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

# 오염 패턴 -> 정상 한글 매핑 사전 (정규식 대신 단순 문자열 치환 사용)
FIX_PAIRS = [
    ("諛쏅뒗 遺?", "받는 분"),
    ("諛쏅뒗", "받는 분"),
    ("蹂대궡???щ엺", "보내는 사람"),
    ("蹂대궡", "보내는 사람"),
    ("?댁슜???낅젰?섏꽭??", "내용을 입력하세요"),
    ("?몄뇙 ?ㅽ뻾", "인쇄 실행"),
    ("?꾩껜 ?좏깮", "전체 선택"),
    ("?꾩껜 ?댁젣", "전체 해제"),
    ("?몄뇙 硫붿떆吏€", "인쇄 메시지"),
    ("硫붿꽭吏€ ?섑뵆 蹂닿???", "메시지 샘플 보기"),
    ("媛먯꽦 紐낆뼵 ?쇱씠釉뚮윭미??", "감성 명언 라이브러리"),
    ("媛먯꽦 紐낆뼵 ?쇱씠釉뚮윭由?", "감성 명언 라이브러리"),
    ("?먰븯??臾멸뎄瑜??좏깮?섎㈃", "원하는 문구를 선택하면 바로"),
    ("諛섏쁺?⑸땲??", "디자인에 반영합니다"),
    ("?뼥截?", "선택한"),
    ("媛??쇰꺼 ?몄뇙?섍린", "개의 라벨 인쇄하기")
]

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    fixed_lines = []
    for i, line in enumerate(lines):
        new_line = line
        
        # 1. 알려진 깨진 패턴 단순 치환
        for old, new in FIX_PAIRS:
            if old in new_line:
                new_line = new_line.replace(old, new)
            
        # 2. 구문 에러 교정 (특히 645번 줄 같은 경우)
        # 내용 확인 후 확실한 패턴 타격
        if "text: '내용을 입력하세요" in new_line and "'" in new_line and new_line.count("'") % 2 != 0:
            new_line = "      text: '내용을 입력하세요',\n"
            print(f"Fixed specific syntax at line {i+1}")
        
        # 일반적인 따옴표 누락 방지 (단순 닫기)
        if ("'" in new_line) and new_line.count("'") % 2 != 0:
            cleaned = new_line.strip()
            if cleaned.endswith(","):
                new_line = new_line.replace(",", "',")
            elif cleaned.endswith("}"):
                new_line = new_line.replace("}", "'}")
            elif cleaned.endswith("});"):
                new_line = new_line.replace("});", "'});")

        fixed_lines.append(new_line)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    print("Python TOTAL SANITIZATION Success! (Fixed Escape issues)")
except Exception as e:
    print(f"Error: {e}")
