# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

# 한글 폰트 데이터 리스트
new_fonts = [
    "const GOOGLE_FONTS = [\n",
    "  { label: '나눔고딕 (기본)', value: \"'Nanum Gothic', sans-serif\" },\n",
    "  { label: '나눔명조 (고급)', value: \"'Nanum Myeongjo', serif\" },\n",
    "  { label: '나눔펜글씨 (감성)', value: \"'Nanum Pen Script', cursive\" },\n",
    "  { label: '본고딕', value: \"'Noto Sans KR', sans-serif\" },\n",
    "  { label: '검은고딕', value: \"'Black Han Sans', sans-serif\" },\n",
    "  { label: '가을바람', value: \"'Gaegu', cursive\" },\n",
    "  { label: '주아체', value: \"'Jua', sans-serif\" },\n",
    "  { label: '도현체', value: \"'Do Hyeon', sans-serif\" },\n",
    "  { label: '송명체', value: \"'Song Myung', serif\" },\n",
    "  { label: '이스트바다', value: \"'East Sea Dokdo', cursive\" },\n",
    "  { label: '독도체', value: \"'Dokdo', cursive\" },\n",
    "  { label: '연성체', value: \"'Yeon Sung', serif\" },\n",
    "  { label: '감자꽃', value: \"'Gamja Flower', cursive\" },\n",
    "  { label: '하이멜로디', value: \"'Hi Melody', cursive\" },\n",
    "  { label: '댄싱 스크립트', value: \"'Dancing Script', cursive\" },\n",
    "  { label: '마운틴', value: \"'Mountain', cursive\" },\n",
    "  { label: '패시피코', value: \"'Pacifico', cursive\" },\n",
    "];\n"
]

# 종이 규격 데이터 리스트
new_presets = [
    "const PAPER_PRESETS = [\n",
    "  // 표준 규격\n",
    "  { id: 'a5', label: 'A5 (148×210mm)', widthMm: 210, heightMm: 148, group: '표준 규격' },\n",
    "  { id: 'a4', label: 'A4 (210×297mm)', widthMm: 297, heightMm: 210, group: '표준 규격' },\n",
    "  { id: 'a3', label: 'A3 (297×420mm)', widthMm: 420, heightMm: 297, group: '표준 규격' },\n",
    "  { id: 'a2', label: 'A2 (420×594mm)', widthMm: 594, heightMm: 420, group: '표준 규격' },\n",
    "  { id: 'a6', label: 'A6 (105×148mm)', widthMm: 148, heightMm: 105, group: '표준 규격' },\n",
    "  { id: 'custom-card', label: '일반 카드 (100×150mm)', widthMm: 150, heightMm: 100, group: '표준 규격' },\n",
    "  { id: 'postcard', label: '엽서 (105 x 148 mm)', widthMm: 105, heightMm: 148, group: '표준 규격' },\n",
    "  // 폼텍 라벨 (사용자 요청 5종: 1, 2, 6, 8, 12칸)\n",
    "  { id: 'formtec-1', label: '3130 (1칸 - A4 전체)', widthMm: 210, heightMm: 297, group: '폼텍 라벨' },\n",
    "  { id: 'formtec-2', label: '3102 (2칸 - A4 반절)', widthMm: 199.6, heightMm: 143.5, group: '폼텍 라벨' },\n",
    "  { id: 'formtec-6', label: '3639 (6칸 - 105x99mm)', widthMm: 105, heightMm: 99, group: '폼텍 라벨' },\n",
    "  { id: 'formtec-8', label: '3114 (8칸 - 물류용)', widthMm: 99.1, heightMm: 67.7, group: '폼텍 라벨' },\n",
    "  { id: 'formtec-12', label: '3112 (12칸 - 주소용)', widthMm: 63.5, heightMm: 70, group: '폼텍 라벨' },\n",
    "];\n"
]

try:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    # 47~65번 줄 교체 (0-indexed: 46~64)
    lines[46:65] = new_fonts
    
    # 69~84번 줄 교체 (폰트 리스트가 교체된 후이므로 줄 번호를 다시 계산해야 하지만,
    # GOOGLE_FONTS 배열 길이가 19줄로 똑같으므로 인덱스는 유지됨. 68~83)
    lines[68:84] = new_presets

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Python Hard Restoration Success!")
except Exception as e:
    print(f"Error: {e}")
