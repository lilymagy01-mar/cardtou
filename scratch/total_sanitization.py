# -*- coding: utf-8 -*-
import sys
import re

file_path = r'e:\cardtou\src\app\page.tsx'

# 오염 패턴 -> 정상 한글 매핑 사전
FIX_MAP = {
    r"諛쏅뒗 遺\?": "받는 분",
    r"諛쏅뒗": "받는 분",
    r"蹂대궡\?\?\?щ엺": "보내는 사람",
    r"蹂대궡": "보내는 사람",
    r"\?댁슜\?\?\?낅젰\?\?\?섏꽭\?\?": "내용을 입력하세요",
    r"\?몄뇙 \?ㅽ뻾": "인쇄 실행",
    r"\?꾩껜 \?좏깮": "전체 선택",
    r"\?꾩껜 \?댁젣": "전체 해제",
    r"\?몄뇙 硫붿떆吏€": "인쇄 메시지",
    r"硫붿꽭吏€ \?섑뵆 蹂닿\?\?\?": "메시지 샘플 보기",
    r"媛먯꽦 紐낆뼵 \?쇱씠釉뚮윭由\?": "감성 명언 라이브러리",
    r"\?먰븯\?\?臾멸뎄瑜\?\?\?좏깮\?\?": "원하는 문구를 선택하면 바로",
    r"諛섏쁺\?\?\ms땲\?\?": "디자인에 반영합니다",
    r"\?뼥截\?": "선택한",
    r"媛\?\?\?쇰꺼 \?몄뇙\?\?섍린": "개의 라벨 인쇄하기"
}

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    fixed_lines = []
    for i, line in enumerate(lines):
        new_line = line
        
        # 1. 알려진 깨진 패턴 치환
        for pattern, replacement in FIX_MAP.items():
            new_line = re.sub(pattern, replacement, new_line)
            
        # 2. 구문 에러 교정 (따옴표 누락 방지)
        # 문자열 리터럴 내부에 ? 기호가 많고 따옴표가 하나만 있는 경우를 감지
        if ("'" in new_line or '"' in new_line) and new_line.count("'") % 2 != 0:
            # 특히 645번 줄 같은 경우: text: '내용을 입력하세요, -> text: '내용을 입력하세요',
            if "text: '" in new_line and "내용을 입력하세요" in new_line:
                new_line = re.sub(r"text: '내용을 입력하세요.*", "text: '내용을 입력하세요',\n", new_line)
            # 일반적인 닫히지 않은 따옴표 강제 폐쇄 (콤마나 괄호 앞)
            elif "'" in new_line and new_line.strip().endswith(",") and new_line.count("'") == 1:
                new_line = new_line.replace(",", "',")
            elif "'" in new_line and new_line.strip().endswith("}") and new_line.count("'") == 1:
                new_line = new_line.replace("}", "'}")

        fixed_lines.append(new_line)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    print("Python TOTAL SANITIZATION Success!")
except Exception as e:
    print(f"Error: {e}")
