# 🌷 CardToYou 에디터 아키텍처 Q&A

이 문서는 메시지 카드 & 패널 출력 서비스 개발과 관련하여, 초기 설계 단계에서의 주요 기술적 질문과 답변, 그리고 에디터 기능 고도화 작업 내역을 정리한 내용입니다.

---

## 📌 Part 1: 초기 설계 Q&A

### Q1. 개발 환경으로 깃허브(GitHub) + 수파베이스(Supabase) + 버셀(Vercel) 조합 정도면 충분할까요?
**A. 네, 충분하고도 넘칩니다!** 
특히 초기 구축(MVP) 및 테스트 단계에서는 가장 완벽한 '황금의 삼각 편대'입니다. 무거운 그래픽 라이브러리(C++ 기반) 대신 Vercel 환경에서 돌아가는 최신 웹 기술(Satori, @resvg/resvg-wasm, pdf-lib 등)을 사용하면 Vercel의 서버리스 함수만으로도 가볍고 빠르게 HTML/JSX UI를 즉석에서 PDF로 렌더링 할 수 있습니다.

* **비용(초기 테스팅 기준):**
  * **GitHub:** 무료
  * **Vercel:** Hobby 요금제(월 $0)로 커버 가능. 추후 사업 확장 시 Pro(월 $20).
  * **Supabase:** Free 요금제(월 $0)로 초기 트래픽 충분히 소화. 확장 시 Pro(월 $25).
  * **AI 이미지 생성(API):** 건당 약 20~50원 (현장에서 고객 결제 금액에 포함하여 과금 가능).
  * **결론:** 초기에 **약 0원**의 고정비로 안전하게 테스트를 마칠 수 있습니다.

---

### Q2. 휘발성 데이터는 얼마나 보관되며, 사용자가 맘에 들어 하는 AI 배경 디자인은 별도 보관이 가능한가요?
**A. 휘발성 데이터(PDF)는 곧바로 지워지며, 배경 그림은 영구 보관이 가능합니다!**

1. **휘발성 PDF의 생명:** 생성된 최종 PDF는 하드디스크에 한 번도 저장되지 않고, 서버 메모리(RAM)에 1~2초간 머물다 프린터(키오스크)로 쏘아진 직후 **완전 소멸**됩니다. 
2. **AI 그림 원본(배경) 영구 보관:** 반면, 텍스트가 입혀지기 전 AI가 뽑아낸 '그림 원본' 자체는 생성 즉시 **Supabase Storage에 영구 저장**됩니다. 
3. **템플릿 생태계 구축:** 고객은 예쁜 원본 디자인을 자기 갤러리에 소장할 수도 있고, 사장님(관리자)은 맘에 드는 고객의 AI 창작물을 **[기본 테마 템플릿]**으로 승격시켜 다른 사람에게 무료 자산으로 제공할 수도 있습니다.

---

### Q3. 완성된 PDF가 그렇게 바로 날아가버리면 나중에 재출력은 어떻게 하나요?
**A. '케이크(PDF)'를 저장하는 대신 '레시피(데이터)'를 저장하기 때문입니다.**

하드디스크가 꽉 차는 것을 방지하기 위해, 완성된 카드 파일(PDF) 자체를 저장하지 않고 조합 비법인 **레시피**만 DB에 가볍게 저장합니다.
* **저장되는 레시피 내역:** 배경 이미지 링크, 고객 입력 텍스트 내용, 폰트 종류, 위치 좌표, 결제 기록 등.
* **재출력 방식:** 고객이나 사장님이 [재출력]을 누르는 순간, 서버는 0.1초 만에 DB에서 저 레시피를 꺼내와 **1초 만에 아까와 똑같은 PDF를 다시 구워냅니다.** 
* **응용:** 만약 "텍스트만 아주 살짝 고쳐서 다시 뽑고 싶어요"라고 할 때도, 레시피 안의 텍스트 데이터만 쓱 바꿔서 즉각 커스텀 재출력이 가능한 엄청난 장점이 있습니다.

---

### Q4. 출력할 때 왜 굳이 무겁고 귀찮게 PDF로 바꿔줘야 하나요? (JPG면 안되나요?)
**A. 절대 안 됩니다! 일반 웹 화면(HTML)이나 JPG 화질로는 상용 퀄리티를 낼 수 없습니다.**

이유는 다음 세 가지입니다:
1. **벡터(Vector) 방식:** JPG 사진 위에 글씨를 올리고 출력하면 모서리가 픽셀로 깨져 흐릿해집니다. PDF는 글자를 화소가 아닌 '수학적 뼈대(벡터)'로 보존하기 때문에 명품 카드처럼 가장자리가 칼같이 또렷하게 출력됩니다.
2. **절대적인 물리적 규격 보장:** 브라우저에서 인쇄를 누르면 OS가 자기 마음대로 여백을 넣고 그림을 구겨버립니다. PDF로 전달해야만 "각도기" 에이전트가 계산한 **'1mm 오차 없는 접는 선'과 'A4/B5 규격'**이 인쇄기에 똑같이 적용됩니다.
3. **색감 보정:** 인쇄소의 잉크 색상 규격과 모니터 규격은 다릅니다. 이 간극을 잡아주어 칙칙함을 없애려면 인쇄 친화적(Print-ready)인 PDF 프로필 스펙을 거쳐야 합니다.

---
---

## 📌 Part 2: 에디터 기능 고도화 (2026-04-08)

이번 세션에서는 카드 에디터의 사용성, 레이아웃, 텍스트 렌더링, 그리고 요소 삭제 UX를 대폭 개선했습니다.

---

### 🏗️ 프로젝트 구조

```
cardtou/
├── src/
│   ├── app/
│   │   └── page.tsx                    # 메인 페이지 (사이드바 + 에디터)
│   ├── components/
│   │   └── editor/
│   │       ├── EditorCanvas.tsx         # 캔버스 (DnD, 컨텍스트 메뉴)
│   │       ├── DraggableText.tsx        # 드래그 가능한 텍스트 블록
│   │       └── DraggableImage.tsx       # 드래그 가능한 이미지 블록
│   ├── store/
│   │   └── useEditorStore.ts           # Zustand 전역 상태 관리
│   └── lib/
│       ├── agents/                     # AI 에이전트 시스템
│       │   ├── aiConnector.ts
│       │   └── typographyWizard.ts
│       └── constants/
│           └── ContentSuggestions.ts
├── docs/
│   ├── QnA_architecture.md             # 이 문서
│   └── development_plan.md             # 개발 계획서
└── .agents/
    └── skills/                         # 전문가 에이전트 스킬
        ├── layout-architect/           # 각도기 (인쇄 규격 계산)
        ├── print-commander/            # 프린트박 (출력물 생성)
        ├── template-curator/           # 샘플리 (디자인 소스 관리)
        └── typography-wizard/          # 폰트김 (폰트 렌더링)
```

---

### 📐 데이터 모델 (Zustand Store)

#### TextBlock 인터페이스
```typescript
interface TextBlock {
  id: string;
  text: string;
  x: number;           // mm 단위 X 좌표
  y: number;           // mm 단위 Y 좌표
  fontSize: number;    // mm 단위 폰트 크기
  colorHex: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  zIndex?: number;
  opacity?: number;
  isLocked?: boolean;
  width?: number;       // 가로 너비 (mm)
  lineHeight?: number;  // 줄 간격 (기본 1.0)
  rotation?: number;    // 회전 (도)
}
```

#### ImageBlock 인터페이스
```typescript
interface ImageBlock {
  id: string;
  url: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  isPrintable: boolean;
  zIndex?: number;
  rotation?: number;
}
```

#### ShopSettings 인터페이스
```typescript
interface ShopSettings {
  name: string;     // 가게명
  tel: string;      // 전화번호
  address: string;  // 주소
  sns: string;      // SNS 계정
  logoUrl: string | null;
}
```

---

### 🎯 주요 작업 내역

#### 1. 표지 로고 & 샵 정보 배치 기능
- **샵 브랜딩 설정 팝업**: 가게 정보(이름, 전화, 주소, SNS, 로고)를 별도 팝업에서 관리
- **자동 배치**: "자동 배치" 버튼 클릭 시 표지에 로고 + 샵 정보 텍스트 블록을 자동 생성
- **파일**: `page.tsx` — `isShopSettingsOpen` 상태로 팝업 제어, `applyShopBranding()` 호출

#### 2. 캔버스 작업 영역 고정 (Sticky)
- 사이드바 메뉴가 길어져도 캔버스가 항상 화면에 보이도록 `position: sticky` 적용
- `top: 48px` (헤더 높이)에 고정, 메뉴만 스크롤됨

#### 3. 텍스트 편집 안정화
- **문제**: 줄바꿈 시 `TypographyWizard.getOptimalFontSize()`가 폰트를 12px로 강제 리셋
- **해결**: 수동 편집 시 자동 사이즈 조절 로직 비활성화, 사용자 설정 폰트 크기 유지
- **파일**: `page.tsx` textarea `onChange` 핸들러 수정

#### 4. 줄간격(Line Height) 제어 슬라이더
- 요소 속성 제어 섹션에 줄간격 슬라이더 추가 (범위: 0.8 ~ 3.0)
- `TextBlock.lineHeight` 속성 → `DraggableText` 컴포넌트의 `style.lineHeight`에 자동 반영
- 실시간 미리보기 지원

#### 5. ⭐ 요소 삭제 UX 대폭 개선

기존에는 요소 선택 후 작은 **X 버튼**을 찾아 클릭해야만 삭제가 가능했습니다.  
이번 개선으로 **3가지 직관적 삭제 방법**을 모두 지원합니다:

| 방법 | 동작 | 구현 위치 |
|------|------|-----------|
| ❌ X 버튼 | 요소 선택 → 우상단 빨간 X 클릭 | `DraggableText.tsx`, `DraggableImage.tsx` |
| ⌨️ 키보드 | 요소 선택 → `Delete` 또는 `Backspace` 키 | `page.tsx` (글로벌 keydown 리스너) |
| 🖱️ 우클릭 | 요소 우클릭 → "삭제하기" 메뉴 클릭 | `EditorCanvas.tsx` (커스텀 컨텍스트 메뉴) |

##### 5-1. 키보드 삭제 (Delete / Backspace)

```typescript
// page.tsx — 글로벌 키보드 리스너
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        // INPUT, TEXTAREA, contentEditable 안에서는 무시
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
            const isText = textBlocks.some(b => b.id === selectedBlockId);
            const isImage = imageBlocks.some(b => b.id === selectedBlockId);
            if (isText) removeTextBlock(selectedBlockId);
            else if (isImage) removeImageBlock(selectedBlockId);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedBlockId, textBlocks, imageBlocks, removeTextBlock, removeImageBlock]);
```

**핵심 포인트:**
- `INPUT`, `TEXTAREA`, `contentEditable` 요소에 포커스가 있으면 삭제 키 이벤트를 무시 → 텍스트 입력 중 실수로 블록이 삭제되지 않음
- 캔버스 영역에서만 작동

##### 5-2. 우클릭 컨텍스트 메뉴

```typescript
// EditorCanvas.tsx — 커스텀 컨텍스트 메뉴
const [contextMenu, setContextMenu] = React.useState<{
    x: number; y: number; visible: boolean;
    targetId: string; type: 'text' | 'image';
}>({ x: 0, y: 0, visible: false, targetId: '', type: 'text' });

const handleContextMenu = (e: React.MouseEvent, id: string, type: 'text' | 'image') => {
    e.preventDefault();  // 브라우저 기본 메뉴 차단
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true, targetId: id, type });
    setSelectedBlockId(id);
};
```

**UI 렌더링:**
- `fixed` 포지셔닝으로 클릭 위치에 정확히 표시
- `Trash2` 아이콘 + "삭제하기" 텍스트
- `hover:bg-red-50` 호버 효과
- 아무 곳 클릭 시 자동 닫힘 (글로벌 `click` 이벤트 리스너)

##### 5-3. 컴포넌트 Props 확장

두 드래그 컴포넌트 모두 `onContextMenu` 옵셔널 prop이 추가됨:

```typescript
// DraggableText.tsx
interface DraggableTextProps extends TextBlock {
  isSelected: boolean;
  zoom: number;
  onContextMenu?: (e: React.MouseEvent) => void;  // 새로 추가
}

// DraggableImage.tsx
interface DraggableImageProps {
  // ... 기존 props
  onContextMenu?: (e: React.MouseEvent) => void;   // 새로 추가
}
```

---

### 🔄 상태 관리 흐름도

```
[사용자 동작]
    │
    ├── Delete/Backspace 키 입력
    │       ↓
    │   page.tsx: handleKeyDown()
    │       ↓
    │   useEditorStore: removeTextBlock() / removeImageBlock()
    │       ↓
    │   EditorCanvas 리렌더링 (요소 제거)
    │
    ├── 요소 우클릭
    │       ↓
    │   DraggableText/Image: onContextMenu → EditorCanvas: handleContextMenu()
    │       ↓
    │   컨텍스트 메뉴 표시 (fixed 위치)
    │       ↓
    │   "삭제하기" 클릭 → removeTextBlock() / removeImageBlock()
    │       ↓
    │   메뉴 닫힘 + 요소 제거
    │
    └── X 버튼 클릭
            ↓
        DraggableText/Image 내부: removeTextBlock(id) / removeImageBlock(id)
            ↓
        EditorCanvas 리렌더링 (요소 제거)
```

---

### 📏 줌(Zoom) 시스템

| 속성 | 값 |
|------|-----|
| 최소 줌 | 1.0x |
| 최대 줌 | 10.0x |
| 줌 방식 | Alt + 마우스 휠 / 슬라이더 / 화면 맞춤 버튼 |
| 자동 맞춤 | 용지 크기 변경 시 뷰포트에 맞게 자동 조절 |
| 좌표 환산 | `실제 위치(px) = mm값 × zoom` |
| 폰트 환산 | `표시 크기(px) = fontSize(mm) × (zoom / 3)` |

---

### 🖨️ 지원 용지 규격

에디터에서 사이드바를 통해 선택 가능한 용지 규격:

| 규격 | 크기 (mm) | 용도 |
|------|-----------|------|
| A4 | 210 × 297 | 표준 카드 |
| A5 | 148 × 210 | 반접기 카드 |
| A6 | 105 × 148 | 엽서형 카드 |
| B5 | 176 × 250 | 중형 카드 |

접지 방식: 없음(Flat) / 반접기(Half) 지원  
방향: 가로(Landscape) / 세로(Portrait) 전환 가능

---

### 🔧 향후 개선 과제

1. **Undo/Redo 시스템**: 삭제 실수 시 되돌리기 기능
2. **다중 선택 삭제**: Shift/Ctrl 클릭으로 여러 요소 동시 선택 후 일괄 삭제
3. **컨텍스트 메뉴 확장**: 삭제 외에 복제, 잠금, Z-Index 조정 메뉴 추가
4. **클립보드**: Ctrl+C/V 복사 붙여넣기
5. **고해상도 PDF 출력**: 프린트 커맨더 에이전트 연동 완성
