$filePath = "e:\cardtou\src\app\page.tsx"
$lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)

# GOOGLE_FONTS (47-65 lines are index 46 to 64)
$newFonts = @(
  "const GOOGLE_FONTS = [",
  "  { label: '나눔고딕 (기본)', value: \"'Nanum Gothic', sans-serif\" },",
  "  { label: '나눔명조 (고급)', value: \"'Nanum Myeongjo', serif\" },",
  "  { label: '나눔펜글씨 (감성)', value: \"'Nanum Pen Script', cursive\" },",
  "  { label: '본고딕', value: \"'Noto Sans KR', sans-serif\" },",
  "  { label: '검은고딕', value: \"'Black Han Sans', sans-serif\" },",
  "  { label: '가을바람', value: \"'Gaegu', cursive\" },",
  "  { label: '주아체', value: \"'Jua', sans-serif\" },",
  "  { label: '도현체', value: \"'Do Hyeon', sans-serif\" },",
  "  { label: '송명체', value: \"'Song Myung', serif\" },",
  "  { label: '이스트바다', value: \"'East Sea Dokdo', cursive\" },",
  "  { label: '독도체', value: \"'Dokdo', cursive\" },",
  "  { label: '연성체', value: \"'Yeon Sung', serif\" },",
  "  { label: '감자꽃', value: \"'Gamja Flower', cursive\" },",
  "  { label: '하이멜로디', value: \"'Hi Melody', cursive\" },",
  "  { label: '댄싱 스크립트', value: \"'Dancing Script', cursive\" },",
  "  { label: '마운틴', value: \"'Mountain', cursive\" },",
  "  { label: '패시피코', value: \"'Pacifico', cursive\" },",
  "];"
)

# PAPER_PRESETS (69-84 lines are index 68 to 83)
$newPresets = @(
  "const PAPER_PRESETS = [",
  "  // 표준 규격",
  "  { id: 'a5', label: 'A5 (148×210mm)', widthMm: 210, heightMm: 148, group: '표준 규격' },",
  "  { id: 'a4', label: 'A4 (210×297mm)', widthMm: 297, heightMm: 210, group: '표준 규격' },",
  "  { id: 'a3', label: 'A3 (297×420mm)', widthMm: 420, heightMm: 297, group: '표준 규격' },",
  "  { id: 'a2', label: 'A2 (420×594mm)', widthMm: 594, heightMm: 420, group: '표준 규격' },",
  "  { id: 'a6', label: 'A6 (105×148mm)', widthMm: 148, heightMm: 105, group: '표준 규격' },",
  "  { id: 'custom-card', label: '일반 카드 (100×150mm)', widthMm: 150, heightMm: 100, group: '표준 규격' },",
  "  { id: 'postcard', label: '엽서 (105 x 148 mm)', widthMm: 105, heightMm: 148, group: '표준 규격' },",
  "  // 폼텍 라벨 (사용자 요청 5종: 1, 2, 6, 8, 12칸)",
  "  { id: 'formtec-1', label: '3130 (1칸 - A4 전체)', widthMm: 210, heightMm: 297, group: '폼텍 라벨' },",
  "  { id: 'formtec-2', label: '3102 (2칸 - A4 반절)', widthMm: 199.6, heightMm: 143.5, group: '폼텍 라벨' },",
  "  { id: 'formtec-6', label: '3639 (6칸 - 105x99mm)', widthMm: 105, heightMm: 99, group: '폼텍 라벨' },",
  "  { id: 'formtec-8', label: '3114 (8칸 - 물류용)', widthMm: 99.1, heightMm: 67.7, group: '폼텍 라벨' },",
  "  { id: 'formtec-12', label: '3112 (12칸 - 주소용)', widthMm: 63.5, heightMm: 70, group: '폼텍 라벨' },",
  "];"
)

$allLines = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -ge 46 -and $i -le 64) {
        if ($i -eq 46) { foreach ($line in $newFonts) { $null = $allLines.Add($line) } }
        continue
    }
    if ($i -ge 68 -and $i -le 83) {
        if ($i -eq 68) { foreach ($line in $newPresets) { $null = $allLines.Add($line) } }
        continue
    }
    $null = $allLines.Add($lines[$i])
}

[System.IO.File]::WriteAllLines($filePath, $allLines, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Hard restoration success!"
