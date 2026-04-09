# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

# 사이드바 전용 복구 매핑 리스트
SIDEBAR_FIXES = [
    ("?뤇截??쇳뀓 ?쇰꺼", "폼텍 라벨"),
    ("?띿뒪??", "텍스트"),
    ("諛곌꼍", "배경"),
    ("AI ?ㅻ쭏???붿옄??", "AI 스마트 디자인"),
    ("?렓 ?꾨┛?몄슜 怨좏빐?곷룄 ?대?吏€媛€ ?€?λ릺?덉뒿?덈떎. 醫낆씠 洹쒓꺽??留욎떠 異쒕젰?섏꽭??", "인쇄용 고해상도 이미지가 저장되었습니다. 종이 규격에 맞춰 출력하세요."),
    ("怨좏빐?곷룄 ?대?吏€ ?€??(異쒕젰??)", "고해상도 이미지 저장 (출력용)"),
    ("而ㅼ뒪?€ ?꾩븞 媛ㅻ윭由?", "커스텀 도안 갤러리"),
    ("?⑹? 洹쒓꺽 諛?諛⑺뼢", "용지 규격 및 방향"),
    ("?쒖? (Outside)", "겉지 (Outside)"),
    ("?댁? (Inside)", "내지 (Inside)"),
    ("?뤇截?{PAPER_PRESETS.find(p => p.id === formtecLabelType)?.label || '?쇰꺼'} ?몄뇙", "폼텍 {PAPER_PRESETS.find(p => p.id === formtecLabelType)?.label || '라벨'} 인쇄")
]

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    fixed_lines = []
    for i, line in enumerate(lines):
        new_line = line
        
        # 850~950번 줄 집중 타격
        if 800 <= i+1 <= 1000:
            for old, new in SIDEBAR_FIXES:
                if old in new_line:
                    new_line = new_line.replace(old, new)
        
        # 구문 에러 유발 가능성 있는 (870번 줄 등) 잔여 ? 제거 및 정상화
        if i+1 == 870 and "?" in new_line:
            new_line = '                  <span className="text-[11px] font-bold">텍스트</span>\n'
        
        fixed_lines.append(new_line)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    print("Python Sidebar UI Polish Success!")
except Exception as e:
    print(f"Error: {e}")
