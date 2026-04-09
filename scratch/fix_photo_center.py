import sys

file_path = r'e:\cardtou\src\app\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 591~610번 줄을 찾아서 교체 (1-indexed 기준이므로 590~609)
start_idx = 590
end_idx = 609

# 교체할 내용
new_logic = [
    '        // [각도기] Layout Architect의 정밀 배치: 캔버스 정중앙 무조건 배치\n',
    '        const centerX = currentDimension.widthMm / 2;\n',
    '        const centerY = currentDimension.heightMm / 2;\n',
    '        \n',
    '        // 🎯 [프로의 센터링] 사진의 중심이 캔버스 중심에 오도록 계산 (기본 60x60mm 기준)\n',
    '        const defaultSize = 60;\n',
    '        const tX = centerX - (defaultSize / 2);\n',
    '        const tY = centerY - (defaultSize / 2);\n',
    '\n',
    '        addImageBlock({\n',
    '          url: result,\n',
    '          x: tX,\n',
    '          y: tY,\n',
    '          width: defaultSize, \n',
    '          height: defaultSize,\n',
    '          isPrintable: true,\n',
    '          rotation: 0\n',
    '        });\n'
]

# 기존 줄 교체
lines[start_idx:end_idx+1] = new_logic

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Replacement successful!")
