'use client';

import { useEditorStore } from '@/store/useEditorStore';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { PEN_KIM_COLLECTION } from '@/lib/constants/penKimQuotes';
import {
  Type,
  Image as ImageIcon,
  Download,
  Save,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
  X,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minus,
  Plus,
  Bold,
  Palette,
  Grid,
  User,
  MessageSquareText,
  Smile,
  CheckCircle2,
  Store,
  Phone,
  MapPin,
  Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AIConnector } from '@/lib/agents/aiConnector';
import { TypographyWizard } from '@/lib/agents/typographyWizard';
import { LABEL_CONFIGS } from '@/lib/agents/printCommander';
import { CATEGORY_LABELS, MESSAGE_SUGGESTIONS, QUOTE_SUGGESTIONS } from '@/lib/constants/ContentSuggestions';
import { GALLERY_CATEGORIES, FREE_TEMPLATES, CALLIGRAPHY_PHRASES, CALLIGRAPHY_FONTS } from '@/lib/constants/templates';
import { AI_THEME_LIBRARY } from '@/lib/constants/aiPrompts';

const PAPER_PRESETS = [
  // 표준 규격
  { id: 'a5', label: 'A5 (148×210mm)', widthMm: 210, heightMm: 148, group: '표준 규격' },
  { id: 'a4', label: 'A4 (210×297mm)', widthMm: 297, heightMm: 210, group: '표준 규격' },
  { id: 'a3', label: 'A3 (297×420mm)', widthMm: 420, heightMm: 297, group: '표준 규격' },
  { id: 'a2', label: 'A2 (420×594mm)', widthMm: 594, heightMm: 420, group: '표준 규격' },
  { id: 'a6', label: 'A6 (105×148mm)', widthMm: 148, heightMm: 105, group: '표준 규격' },
  { id: 'custom-card', label: '일반 카드 (100×150mm)', widthMm: 150, heightMm: 100, group: '표준 규격' },
  { id: 'postcard', label: '엽서 (105 x 148 mm)', widthMm: 105, heightMm: 148, group: '표준 규격' },
  // 폼텍 라벨 (사용자 요청 5종: 1, 2, 6, 8, 12칸)
  { id: 'formtec-1', label: '3130 (1칸 - A4 전체)', widthMm: 210, heightMm: 297, group: '폼텍 라벨' },
  { id: 'formtec-2', label: '3102 (2칸 - A4 반절)', widthMm: 199.6, heightMm: 143.5, group: '폼텍 라벨' },
  { id: 'formtec-6', label: '3639 (6칸 - 105x99mm)', widthMm: 105, heightMm: 99, group: '폼텍 라벨' },
  { id: 'formtec-8', label: '3114 (8칸 - 물류용)', widthMm: 99.1, heightMm: 67.7, group: '폼텍 라벨' },
  { id: 'formtec-12', label: '3112 (12칸 - 주소용)', widthMm: 63.5, heightMm: 70, group: '폼텍 라벨' },
];


export default function Home() {
  const {
    addTextBlock,
    setBackgroundUrl,
    setFrontBackgroundUrl,
    setBackBackgroundUrl,
    setMargins,
    selectedBlockId,
    textBlocks,
    updateTextBlockContent,
    removeTextBlock,
    currentDimension,
    backgroundUrl,
    frontBackgroundUrl,
    backBackgroundUrl,
    margins,
    orientation,
    foldType,
    setOrientation,
    setFoldType,
    saveDesign,
    loadDesign,
    setDimension,
    showFoldingGuide,
    toggleFoldingGuide,
    activePage,
    setActivePage,
    listDesigns,
    selectedPresetId,
    imageBlocks,
    addImageBlock,
    removeImageBlock,
    recipientName,
    senderName,
    showToField,
    showFromField,
    toBlockId,
    fromBlockId,
    suggestedMessageBlockId,
    suggestedQuoteBlockId,
    setRecipientName,
    setSenderName,
    setShowToField,
    setShowFromField,
    setToBlockId,
    setFromBlockId,
    setSuggestedMessageBlockId,
    setSuggestedQuoteBlockId,
    zoom,
    setZoom,
    isGenerating,
    setIsGenerating,
    shopSettings,
    updateShopSettings,
    applyShopBranding,
    pages,
  } = useEditorStore();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [aiModalType, setAiModalType] = useState<'theme' | 'magic' | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isShopSettingsOpen, setIsShopSettingsOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [activeSuggestionType, setActiveSuggestionType] = useState<'quote' | 'message'>('message');
  // const [isGenerating, setIsGenerating] = useState(false); // Removed local state
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [activeGalleryTab, setActiveGalleryTab] = useState<string>('my_designs');

  // Sidebar accordion states
  const [expandedSections, setExpandedSections] = useState<string[]>(['format', 'branding']);

  // AI Card Generation states
  const [aiOccasion, setAiOccasion] = useState('');
  const [aiRelationship, setAiRelationship] = useState('');
  const [aiRecipient, setAiRecipient] = useState('');
  const [aiSender, setAiSender] = useState('');
  const [aiCustomNote, setAiCustomNote] = useState('');
  const [aiThemePrompt, setAiThemePrompt] = useState(''); // 테마 생성용 커스텀 프롬프트
  const [aiGeneratedMessages, setAiGeneratedMessages] = useState<{ message: string; tone: string }[]>([]);
  const [aiSelectedMessage, setAiSelectedMessage] = useState('');
  const [aiGeneratedImages, setAiGeneratedImages] = useState<{ url: string; seed: number }[]>([]); // AI 생성 이미지들
  const [activeAiThemeTab, setActiveAiThemeTab] = useState<string | null>(null);
  const [aiStep, setAiStep] = useState<'input' | 'messages' | 'complete'>('input');
  const [aiDesignStyle, setAiDesignStyle] = useState('photo'); // New: 이미지 스타일 (photo, illustration, oil_painting, watercolor, line_art)

  // Formtec batch mode
  const [isFormtecMode, setIsFormtecMode] = useState(false);
  const [formtecLabelType, setFormtecLabelType] = useState('formtec-1');
  const [formtecMessage, setFormtecMessage] = useState('');
  const [formtecBgColor, setFormtecBgColor] = useState('#FFF0F5');
  const [formtecTextColor, setFormtecTextColor] = useState('#9B2335');
  const [formtecFontSize, setFormtecFontSize] = useState(14);
  const [formtecTextAlign, setFormtecTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [formtecIsBold, setFormtecIsBold] = useState(false);
  const [formtecSelectedCells, setFormtecSelectedCells] = useState<number[]>([]);

  // Auto-open/close properties accordion based on element selection
  useEffect(() => {
    if (selectedBlockId) {
      setExpandedSections(prev =>
        prev.includes('properties') ? prev : [...prev, 'properties']
      );
    } else {
      setExpandedSections(prev =>
        prev.filter(s => s !== 'properties')
      );
    }
  }, [selectedBlockId]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // 폼텍 모드 진입 시 전체 메시지(표지 + 내지) 실시간 동기화
  useEffect(() => {
    if (isFormtecMode) {
      // 다른 페이지의 텍스트와 모두 합쳐서 초기값 설정
      const otherPage = activePage === 'outside' ? 'inside' : 'outside';
      const otherBlocks = pages[otherPage]?.textBlocks || [];

      const allTexts = [
        ...textBlocks.map(b => b.text),
        ...otherBlocks.map(b => b.text)
      ].filter(t => t && t.trim() !== '' && !t.includes('To.') && !t.includes('From.'));

      const combinedText = allTexts.join('\n').trim();

      // 기존 메시지가 비어있거나, 완전히 새로운 모드 진입인 경우에만 초기화
      // (이미 수동으로 수정한 경우는 덮어쓰지 않음)
      setFormtecMessage(prev => {
        if (!prev) return combinedText;
        return prev;
      });
    }
  }, [isFormtecMode, activePage]); // textBlocks 의존성 제거하여 수동 수정 유지

  // 상단 용지 선택 시 폼텍 라벨인 경우 해당 모드로 자동 준비
  useEffect(() => {
    if (selectedPresetId.startsWith('formtec-')) {
      setFormtecLabelType(selectedPresetId);
    }
  }, [selectedPresetId]);

  // Suggestion Modal State
  const [selectedCategory, setSelectedCategory] = useState<string>('lover');
  const [selectedLang, setSelectedLang] = useState<'ko' | 'en'>('ko');

  const loadTemplate = (imageUrl: string, categoryId?: string) => {
    const state = useEditorStore.getState();
    const { addTextBlock, currentDimension, margins } = state;

    // 강제로 표지면 블록 비우기
    state.setActivePage('outside');
    const outState = useEditorStore.getState();
    outState.textBlocks.forEach(b => outState.removeTextBlock(b.id));
    outState.imageBlocks.forEach(b => outState.removeImageBlock(b.id));

    if (outState.foldType === 'half') {
      outState.setFrontBackgroundUrl(imageUrl);
      outState.setBackBackgroundUrl(null);
    } else {
      outState.setBackgroundUrl(imageUrl);
    }

    // AI/템플릿 선택 시, 카테고리에 맞는 캘리그라피 텍스트 자동 추가
    if (categoryId && CALLIGRAPHY_PHRASES[categoryId]) {
      const phrases = CALLIGRAPHY_PHRASES[categoryId];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

      const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
      let targetX = currentDimension.widthMm / 2;
      let targetY = currentDimension.heightMm / 2;

      if (outState.foldType === 'half') {
        if (isLandscape) {
          targetX = currentDimension.widthMm * 0.75;
          targetY = currentDimension.heightMm * 0.5;
        } else {
          targetX = currentDimension.widthMm * 0.5;
          targetY = currentDimension.heightMm * 0.75;
        }
      }

      const randomFont = CALLIGRAPHY_FONTS[Math.floor(Math.random() * CALLIGRAPHY_FONTS.length)];

      // 약간의 랜덤 회전 각도 (-4 ~ 4도)
      const randomRotation = (Math.random() * 8) - 4;

      // 폰트김(Typography Wizard): 글자 수 기반 Auto-scaling
      const baseSize = Math.min(currentDimension.widthMm, currentDimension.heightMm) * 0.18;
      const safeWidth = currentDimension.widthMm * 0.7; // Safe Area 70%
      const autoScaledSize = Math.min(baseSize, safeWidth / Math.max(randomPhrase.length, 1) * 1.8);

      useEditorStore.getState().addTextBlock({
        text: randomPhrase,
        x: targetX,
        y: targetY - 20, // 약간 위쪽으로 배치
        fontSize: autoScaledSize,
        colorHex: '#ffffff', // 화이트 (밝게)
        fontFamily: randomFont,
        textAlign: 'center',
        zIndex: 50,
        rotation: randomRotation,
        textShadow: 'rgba(0,0,0,0.85) 1px 2px 4px, rgba(0,0,0,0.7) 0px 4px 12px, rgba(0,0,0,0.5) 0px 0px 20px', // 강렬한 다중 그림자
      });
    }

    // 내지면 블록 비우기
    state.setActivePage('inside');
    const inState = useEditorStore.getState();
    inState.textBlocks.forEach(b => inState.removeTextBlock(b.id));
    inState.imageBlocks.forEach(b => inState.removeImageBlock(b.id));

    state.setActivePage('outside');
    state.setDesignId(null);
    setIsGalleryOpen(false);
    setActiveGalleryTab('my_designs');

    // 사용자가 지정한 로고 등 샵 브랜딩 자동 배치
    state.applyShopBranding('back');
  };

  useEffect(() => {
    if (isGalleryOpen) {
      listDesigns().then(setSavedDesigns);
    }
  }, [isGalleryOpen, listDesigns]);

  // To/From 실시간 동기화
  useEffect(() => {
    if (toBlockId) {
      updateTextBlockContent(toBlockId, { text: `To. ${recipientName || '받는 분'}` });
    }
  }, [recipientName, toBlockId, updateTextBlockContent]);

  useEffect(() => {
    if (fromBlockId) {
      updateTextBlockContent(fromBlockId, { text: `From. ${senderName || '보내는 사람'}` });
    }
  }, [senderName, fromBlockId, updateTextBlockContent]);

  // Automatic Fit-to-screen when paper size changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Typing context check
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Delete' || (e.key === 'Backspace' && !selectedBlockId?.includes('text'))) {
        // Backspace is a bit tricky, but mostly we use Delete. 
        // However, many designers expect Backspace to delete the object too.
        if (selectedBlockId) {
          const isText = textBlocks.some(b => b.id === selectedBlockId);
          const isImage = imageBlocks.some(b => b.id === selectedBlockId);

          if (isText) removeTextBlock(selectedBlockId);
          else if (isImage) removeImageBlock(selectedBlockId);
        }
      } else if (e.key === 'Backspace' && selectedBlockId) {
        // If text is selected but we aren't in an input, it's still safe to delete the block
        const isText = textBlocks.some(b => b.id === selectedBlockId);
        const isImage = imageBlocks.some(b => b.id === selectedBlockId);
        if (isText) removeTextBlock(selectedBlockId);
        else if (isImage) removeImageBlock(selectedBlockId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, textBlocks, imageBlocks, removeTextBlock, removeImageBlock]);

  // Automatic Fit-to-screen when paper size changes
  useEffect(() => {
    const handleAutoFit = () => {
      // Calculate available workspace (Viewport - Sidebar(320) - Header(48) - Padding)
      const workspaceWidth = window.innerWidth - 320 - 80;
      const workspaceHeight = window.innerHeight - 48 - 80;

      const zoomW = workspaceWidth / currentDimension.widthMm;
      const zoomH = workspaceHeight / currentDimension.heightMm;

      // Use the smaller scale factor to ensure it fits both ways
      const idealZoom = Math.min(zoomW, zoomH);

      // Clamp between 1.0 and 6.0 for safety
      const clampedZoom = Math.max(1, Math.min(6, idealZoom));
      setZoom(clampedZoom);
    };

    // Delay slightly to ensure layout is ready
    const timer = setTimeout(handleAutoFit, 100);
    window.addEventListener('resize', handleAutoFit);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleAutoFit);
    };
  }, [currentDimension, orientation, foldType, setZoom]);





  const handleToggleToField = () => {
    const newState = !showToField;
    setShowToField(newState);

    // 기존 블록이 있다면 삭제
    if (toBlockId) {
      removeTextBlock(toBlockId);
      setToBlockId(null);
    }

    if (newState) {
      const isFolding = foldType === 'half';
      const isLandscape = currentDimension.widthMm > currentDimension.heightMm;

      const midX = currentDimension.widthMm / 2;
      const midY = currentDimension.heightMm / 2;
      let startX = midX;
      let startY = 30;
      let width = currentDimension.widthMm - (margins.left + margins.right);

      if (isFolding) {
        if (isLandscape) {
          // 가로형 반접이: 우측 페이지(내지 본문)의 상단
          startX = (midX + (currentDimension.widthMm - margins.right)) / 2;
          startY = 40;
          width = (currentDimension.widthMm / 2) - (margins.left + margins.right);
        } else {
          // 세로형 반접이: 하단 페이지(내지 본문)의 상단부
          startX = currentDimension.widthMm / 2;
          startY = (currentDimension.heightMm / 2) + 20;
          width = currentDimension.widthMm - (margins.left + margins.right);
        }
      }

      const id = addTextBlock({
        text: `To. ${recipientName || '받는 분'}`,
        x: startX,
        y: startY,
        fontSize: 16,
        textAlign: 'center',
        colorHex: '#475569',
        fontFamily: "'Noto Sans KR', sans-serif",
        width: width,
        rotation: 0 // 내지는 무조건 정방향
      });
      setToBlockId(id);
    }
  };

  const handleToggleFromField = () => {
    const newState = !showFromField;
    setShowFromField(newState);

    // 기존 블록이 있다면 삭제
    if (fromBlockId) {
      removeTextBlock(fromBlockId);
      setFromBlockId(null);
    }

    if (newState) {
      const isFolding = foldType === 'half';
      const isLandscape = currentDimension.widthMm > currentDimension.heightMm;

      const midX = currentDimension.widthMm / 2;
      const midY = currentDimension.heightMm / 2;
      let startX = midX;
      let startY = currentDimension.heightMm - 30;
      let width = currentDimension.widthMm - (margins.left + margins.right);

      if (isFolding) {
        if (isLandscape) {
          // 가로형 반접이: 우측 페이지(내지 본문)의 중앙 하단
          startX = (midX + (currentDimension.widthMm - margins.right)) / 2;
          startY = currentDimension.heightMm - margins.bottom - 10;
        } else {
          // 세로형 반접이: 하단 페이지(내지 본문)의 우측 하단
          startX = currentDimension.widthMm - margins.right - 20;
          startY = currentDimension.heightMm - margins.bottom - 10;
          width = 40; // 이름이 들어갈 정도의 적당한 너비
        }
      }

      const id = addTextBlock({
        text: `From. ${senderName || '보내는 사람'}`,
        x: startX,
        y: startY,
        fontSize: 14,
        textAlign: isLandscape ? 'center' : 'right',
        colorHex: '#475569',
        fontFamily: "'Noto Sans KR', sans-serif",
        width: width,
        rotation: 0
      });
      setFromBlockId(id);
    }
  };



  // AI 스마트 디자인: 표지 앞면 이미지 생성 및 안착에 집중
  const handleAISmartDesign = async (specificStyle?: string) => {
    setIsGenerating(true);
    
    // [중요] 새로운 생성 시작 시 기존 배경을 즉시 비워서 시각적 피드백 강화
    setFrontBackgroundUrl(null);
    setBackgroundUrl(null);
    
    const isFolding = foldType === 'half';
    try {
      // 1. 선제적 페이지 전환 (표지 디자인을 보여줌)
      setActivePage('outside');

      // 2. AI 이미지 생성 요청 (합쳐진 엔진 사용)
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: specificStyle || aiThemePrompt || 'Beautiful artistic cover', // 'description'에서 'prompt'로 변경
          theme: activeAiThemeTab || 'modern',
          style: aiDesignStyle, // 사용자가 선택한 아트 스타일 전달
          occasion: aiOccasion,
          orientation,
          foldType,
          widthMm: currentDimension.widthMm,
          heightMm: currentDimension.heightMm
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '디자인 생성 실패');

      const images = data.images || [];
      setAiGeneratedImages(images);
      
      // 만약 첫 번째 이미지를 바로 배경으로 깔아주고 싶다면:
      if (images.length > 0) {
        const imageUrl = images[0].url;
        if (foldType === 'half') setFrontBackgroundUrl(imageUrl);
        else setBackgroundUrl(imageUrl);
      }
      
      setAiStep('complete'); // 단계 전환: 갤러리 로딩 완료

    } catch (error: any) {
      console.error('AI Smart Design error:', error);
      alert(`디자인 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedBlock = textBlocks.find(b => b.id === selectedBlockId);

  const handleAddText = () => {
    addTextBlock({
      text: '내용을 입력하세요',
      x: currentDimension.widthMm / 2,
      y: currentDimension.heightMm / 2,
      fontSize: 24,
      colorHex: '#333333',
      textAlign: 'center',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (activePage === 'outside' && foldType === 'half') {
        setFrontBackgroundUrl(dataUrl);
      } else {
        setBackgroundUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateShopSettings({ logoUrl: dataUrl });
      setTimeout(() => applyShopBranding('back'), 50);
    };
    reader.readAsDataURL(file);
  };



  // === 폼텍 전용 인쇄 ===
  const handleFormtecPrint = async () => {
    if (!formtecMessage.trim()) {
      alert('인쇄할 메시지를 입력해주세요.');
      return;
    }
    if (formtecSelectedCells.length === 0) {
      alert('인쇄할 라벨 위치를 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const { PrintCommander } = await import('@/lib/agents/printCommander');

      // 심플 SVG 배경 생성
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${formtecBgColor}"/></svg>`;
      const bgUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

      const config = LABEL_CONFIGS[formtecLabelType] || LABEL_CONFIGS['formtec-1'];

      const pdfBytes = await PrintCommander.generatePdf({
        paperSizeMm: { width: 210, height: 297 }, // A4 고정
        pages: [{
          backgroundUrl: bgUrl,
          textBlocks: [{
            text: formtecMessage,
            x: 105,
            y: 148.5,
            size: formtecFontSize,
            colorHex: formtecTextColor,
            fontFamily: "'Nanum Pen Script', cursive",
            textAlign: formtecTextAlign,
            fontWeight: formtecIsBold ? 'bold' : 'normal'
          }]
        }],
        labelType: formtecLabelType,
        selectedCells: formtecSelectedCells
      });

      if (pdfBytes) {
        PrintCommander.triggerPrintPopup(pdfBytes);
      } else {
        alert('PDF 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Formtec print failed:', error);
      alert('폼텍 인쇄 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    const { PrintCommander } = await import('@/lib/agents/printCommander');
    const { pages, activePage, backgroundUrl, textBlocks, currentDimension, foldType } = useEditorStore.getState();

    // 현재 작업 중인 페이지 데이터 최신화 (pages 객체 내)
    const currentPages = {
      ...pages,
      [activePage]: {
        ...pages[activePage],
        backgroundUrl,
        frontBackgroundUrl,
        backBackgroundUrl,
        textBlocks,
        imageBlocks
      }
    };

    const selectedPreset = PAPER_PRESETS.find(p => p.widthMm === currentDimension.widthMm && p.heightMm === currentDimension.heightMm);
    const labelType = selectedPreset?.id?.startsWith('formtec-') ? selectedPreset.id : undefined;

    // 인쇄용 데이터 구성
    const printPages = (foldType === 'half')
      ? [currentPages.outside, currentPages.inside]
      : [currentPages[activePage]];

    const pdfBytes = await PrintCommander.generatePdf({
      paperSizeMm: {
        width: currentDimension.widthMm,
        height: currentDimension.heightMm
      },
      pages: printPages.map(p => ({
        backgroundUrl: p.backgroundUrl,
        frontBackgroundUrl: p.frontBackgroundUrl,
        backBackgroundUrl: p.backBackgroundUrl,
        textBlocks: p.textBlocks.map(b => ({
          text: b.text,
          x: b.x,
          y: b.y,
          size: b.fontSize,
          colorHex: b.colorHex,
          textAlign: b.textAlign,
          fontFamily: b.fontFamily,
          rotation: b.rotation,       // 프린트박: 회전 전달
          textShadow: b.textShadow,   // 프린트박: 그림자 전달
          opacity: b.opacity          // 프린트박: 투명도 전달
        })),
        imageBlocks: p.imageBlocks?.map(b => ({
          url: b.url,
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          isPrintable: b.isPrintable,
          rotation: b.rotation        // 프린트박: 이미지 회전 전달
        }))
      })),
      labelType: labelType
    });

    if (pdfBytes) {
      PrintCommander.triggerPrintPopup(pdfBytes);
    } else {
      alert('PDF 생성에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Dokdo&family=East+Sea+Dokdo&family=Gaegu&family=Gamja+Flower&family=Gugi&family=Hi+Melody&family=Jua&family=Nanum+Pen+Script&family=Yeon+Sung&family=Noto+Sans+KR:wght@400;700&display=swap');
      `}</style>
      {/* Top Navigation - Ultra Slimmed for Maximum Workspace */}
      <header className="bg-white border-b border-gray-200 px-6 py-1 flex items-center justify-between shadow-sm z-30 h-12">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CardToYou
          </h1>
          <div className="h-6 w-px bg-gray-200" />
          {/* Integrated Page Switcher in Header for more vertical space */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActivePage('outside')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activePage === 'outside' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              표지 (Outside)
            </button>
            <button
              onClick={() => setActivePage('inside')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activePage === 'inside' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              내지 (Inside)
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => loadDesign()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-sm">
            ID로 찾기
          </button>
          <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md font-bold text-sm">
            현재 디자인 저장
          </button>
          <div className="w-[1px] h-8 bg-gray-200 mx-2" />
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition shadow-lg font-bold"
          >
            <Download size={18} /> 인쇄 (PDF)
          </button>
          <button
            onClick={() => setIsFormtecMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md font-bold text-sm"
          >
            🏷️ 폼텍 라벨
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-48px)]">
        {/* Left Toolbar - Sticky */}
        {/* Left Toolbar - Compact Accordion Style */}
        <aside className="w-80 bg-white border-r border-gray-200 shrink-0 flex flex-col z-10 shadow-sm overflow-hidden sticky top-0 h-[calc(100vh-48px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">

            {/* 1. Quick Tools Section */}
            <div className="space-y-2 mb-4">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Quick Tools</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddText}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all text-gray-600 group"
                >
                  <Type size={18} className="group-hover:text-indigo-600 text-gray-400" />
                  <span className="text-[11px] font-bold">텍스트</span>
                </button>
                <label className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-purple-50 hover:border-purple-100 hover:text-purple-700 transition-all text-gray-600 group cursor-pointer">
                  <ImageIcon size={18} className="group-hover:text-purple-600 text-gray-400" />
                  <span className="text-[11px] font-bold">배경</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              {/* AI 스마트 디자인 (The Unified Brain) */}
              <div className="pt-2">
                <button
                  onClick={() => setIsAiWizardOpen(true)}
                  className="w-full flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] shadow-xl shadow-indigo-100 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden text-white border-2 border-indigo-200"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="w-10 h-10 group-hover:scale-125 transition-transform duration-500" />
                  <div className="text-center relative z-10">
                    <span className="block text-lg font-black tracking-tight">AI 스마트 디자인</span>
                    <span className="text-[11px] text-white/80 font-bold uppercase tracking-[0.2em]">Premium AI Artwork</span>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -bottom-2 -right-2 text-white/10 rotate-12">
                    <Palette size={60} />
                  </div>
                </button>
              </div>
              {/* Print Commander Masterpiece */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const link = document.createElement('a');
                      link.download = `cardtoyou-print-${Date.now()}.png`;
                      link.href = canvas.toDataURL('image/png', 2.0); // High quality
                      link.click();
                      alert('🎨 프린트용 고해상도 이미지가 저장되었습니다. 종이 규격에 맞춰 출력하세요!');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-gray-900 to-black text-white rounded-[2rem] hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all font-black text-sm group"
                >
                  <Download size={20} className="group-hover:bounce" />
                  <span>고해상도 이미지 저장 (출력용)</span>
                </button>

                <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white border-2 border-gray-100 text-gray-700 rounded-[2rem] hover:border-indigo-400 hover:text-indigo-600 transition-all font-black text-sm active:scale-95 shadow-sm"
                >
                  <Grid size={20} className="text-gray-400" />
                  <span>커스텀 도안 갤러리</span>
                </button>
              </div>
            </div>

            {/* 2. Format Section (Accordion) */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection('format')}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Maximize size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">용지 규격 및 방향</span>
                </div>
                <div className={`transition-transform duration-300 ${expandedSections.includes('format') ? 'rotate-180' : ''}`}>
                  <ArrowDown size={14} className="text-gray-400" />
                </div>
              </button>

              {expandedSections.includes('format') && (
                <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1.5 ml-0.5">PAPER SIZE</label>
                    <select
                      value={selectedPresetId}
                      onChange={(e) => {
                        const presetId = e.target.value;
                        const preset = PAPER_PRESETS.find(p => p.id === presetId);
                        if (preset) {
                          const isLandscape = orientation === 'landscape';
                          const [w, h] = isLandscape
                            ? [Math.max(preset.widthMm, preset.heightMm), Math.min(preset.widthMm, preset.heightMm)]
                            : [Math.min(preset.widthMm, preset.heightMm), Math.max(preset.widthMm, preset.heightMm)];
                          setDimension({ widthMm: w, heightMm: h }, presetId);
                          if (presetId.startsWith('formtec-')) {
                            setFoldType('none');
                            setFormtecLabelType(presetId);
                            setFormtecSelectedCells([]);
                            setIsFormtecMode(true);
                          }
                        }
                      }}
                      className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <optgroup label="표준 규격">
                        {PAPER_PRESETS.filter(p => p.group === '표준 규격').map(preset => (
                          <option key={preset.id} value={preset.id}>{preset.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="폼텍 라벨">
                        {PAPER_PRESETS.filter(p => p.group === '폼텍 라벨').map(preset => (
                          <option key={preset.id} value={preset.id}>{preset.label}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1.5 ml-0.5">ORIENTATION</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const d = currentDimension;
                          setOrientation('landscape');
                          setDimension({ widthMm: Math.max(d.widthMm, d.heightMm), heightMm: Math.min(d.widthMm, d.heightMm) }, selectedPresetId);
                        }}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition ${orientation === 'landscape' ? 'bg-white border-2 border-indigo-600 text-indigo-600' : 'bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100'}`}
                      >
                        가로형
                      </button>
                      <button
                        onClick={() => {
                          const d = currentDimension;
                          setOrientation('portrait');
                          setDimension({ widthMm: Math.min(d.widthMm, d.heightMm), heightMm: Math.max(d.widthMm, d.heightMm) }, selectedPresetId);
                        }}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition ${orientation === 'portrait' ? 'bg-white border-2 border-indigo-600 text-indigo-600' : 'bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100'}`}
                      >
                        세로형
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1.5 ml-0.5">TYPE</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFoldType('none')}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition ${foldType === 'none' ? 'bg-white border-2 border-indigo-600 text-indigo-600' : 'bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100'}`}
                      >
                        단면 (Flat)
                      </button>
                      <button
                        disabled={selectedPresetId.startsWith('formtec-')}
                        onClick={() => setFoldType('half')}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition disabled:opacity-30 ${foldType === 'half' ? 'bg-white border-2 border-indigo-600 text-indigo-600' : 'bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100'}`}
                      >
                        접이 (Folding)
                      </button>
                    </div>
                  </div>

                  {foldType === 'half' && (
                    <div className="flex items-center justify-between px-1 pt-1 border-t border-gray-50">
                      <span className="text-[11px] font-bold text-gray-500">접지 가이드</span>
                      <button
                        onClick={toggleFoldingGuide}
                        className={`w-9 h-5 rounded-full transition-colors relative ${showFoldingGuide ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${showFoldingGuide ? 'left-5' : 'left-1'}`} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. 추천 메시지 & 펜김의 감성 큐레이션 */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-amber-100/50">
              <button
                onClick={() => toggleSection('suggestions')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50/50 to-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center text-[10px]">🖋️</div>
                  <span className="text-sm font-bold text-gray-700">문구 라이브러리</span>
                </div>
                <div className={`transition-transform duration-300 ${expandedSections.includes('suggestions') ? 'rotate-180' : ''}`}>
                  <ArrowDown size={14} className="text-gray-400" />
                </div>
              </button>

              {expandedSections.includes('suggestions') && (
                <div className="px-3 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] text-amber-600 font-bold px-1 italic">"{aiDesignTheme || 'Modern'} 스타일에 어울리는 글귀를 준비했어요~"</p>
                  <div className="space-y-1.5 pt-1">
                    {(PEN_KIM_COLLECTION[aiDesignTheme as keyof typeof PEN_KIM_COLLECTION] || PEN_KIM_COLLECTION['modern']).map((quote, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const id = addTextBlock({
                            text: quote,
                            x: 105,
                            y: 80,
                            fontSize: 14,
                            textAlign: 'center',
                            colorHex: '#334155',
                            fontFamily: "'Nanum Myeongjo', serif",
                            opacity: 1.0,
                            width: 150,
                            lineHeight: 1.6
                          });
                          toast.success('펜김의 진심이 카드에 담겼습니다! ✨');
                        }}
                        className="w-full text-left p-3 text-[11px] font-medium leading-relaxed bg-white border border-gray-50 rounded-xl hover:border-amber-400 hover:bg-amber-50 hover:shadow-sm transition-all text-gray-700 active:scale-[0.98]"
                      >
                        {quote}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Inside Setting Section (Accordion) - Only if half fold & inside page */}
            {activePage === 'inside' && foldType === 'half' && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => toggleSection('inside_settings')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-emerald-500" />
                    <span className="text-sm font-bold text-gray-700">수신인/발신인 설정</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedSections.includes('inside_settings') ? 'rotate-180' : ''}`}>
                    <ArrowDown size={14} className="text-gray-400" />
                  </div>
                </button>

                {expandedSections.includes('inside_settings') && (
                  <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">

                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">수령인 (To.)</span>
                        <button onClick={handleToggleToField} className={`w-8 h-4 rounded-full transition-colors relative ${showToField ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showToField ? 'left-4.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {showToField && (
                        <input
                          type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="수령인 이름" className="w-full p-2.5 text-xs bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        />
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">발신인 (From.)</span>
                        <button onClick={handleToggleFromField} className={`w-8 h-4 rounded-full transition-colors relative ${showFromField ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showFromField ? 'left-4.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {showFromField && (
                        <input
                          type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)}
                          placeholder="보내는 사람 성함" className="w-full p-2.5 text-xs bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Element Properties (Accordion) - Always Auto-opens when block selected */}
            <div className={`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${selectedBlockId ? 'ring-2 ring-blue-50 border-blue-100' : ''}`}>
              <button
                onClick={() => toggleSection('properties')}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                id="properties-accordion-header"
              >
                <div className="flex items-center gap-2">
                  <Settings size={16} className={selectedBlockId ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-700">요소 속성 제어</span>
                </div>
                <div className={`transition-transform duration-300 ${expandedSections.includes('properties') ? 'rotate-180' : ''}`}>
                  <ArrowDown size={14} className="text-gray-400" />
                </div>
              </button>

              {expandedSections.includes('properties') && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {!selectedBlock ? (
                    <div className="p-8 bg-gray-50 rounded-2xl text-center">
                      <div className="mb-2 flex justify-center"><Search size={24} className="text-gray-300" /></div>
                      <p className="text-xs font-bold text-gray-400">캔버스의 요소를 클릭해보세요</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-blue-500 uppercase ml-0.5">CONTENT</label>
                        <textarea
                          value={selectedBlock.text}
                          onChange={(e) => updateTextBlockContent(selectedBlock.id, { text: e.target.value })}
                          className="w-full p-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-inner min-h-[100px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">SIZE</label>
                          <input
                            type="number"
                            step="0.5"
                            value={Number((selectedBlock.fontSize).toFixed(1))}
                            onChange={(e) => updateTextBlockContent(selectedBlock.id, { fontSize: Number(e.target.value) })}
                            className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">COLOR</label>
                          <div className="flex gap-2 items-center h-10 bg-gray-50 rounded-xl px-2">
                            <input
                              type="color" value={selectedBlock.colorHex}
                              onChange={(e) => updateTextBlockContent(selectedBlock.id, { colorHex: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                            />
                            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">{selectedBlock.colorHex}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">OPACITY</label>
                          <span className="text-[10px] font-bold text-blue-600">{Math.round((selectedBlock.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                          type="range" min="0" max="1" step="0.01" value={selectedBlock.opacity ?? 1}
                          onChange={(e) => updateTextBlockContent(selectedBlock.id, { opacity: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">LINE HEIGHT (줄간격)</label>
                          <span className="text-[10px] font-bold text-blue-600">{(selectedBlock.lineHeight ?? 1.6).toFixed(1)}</span>
                        </div>
                        <input
                          type="range" min="0.8" max="3.0" step="0.1" value={selectedBlock.lineHeight ?? 1.6}
                          onChange={(e) => updateTextBlockContent(selectedBlock.id, { lineHeight: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">ROTATION (회전)</label>
                          <span className="text-[10px] font-bold text-blue-600">{Math.round(selectedBlock.rotation || 0)}°</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="range" min="-180" max="180" step="1" value={selectedBlock.rotation || 0}
                            onChange={(e) => updateTextBlockContent(selectedBlock.id, { rotation: parseFloat(e.target.value) })}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <button
                            onClick={() => updateTextBlockContent(selectedBlock.id, { rotation: 0 })}
                            className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500 hover:bg-gray-200"
                          >
                            초기화
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">FONT FAMILY</label>
                        <select
                          value={selectedBlock.fontFamily || 'sans-serif'}
                          onChange={(e) => updateTextBlockContent(selectedBlock.id, { fontFamily: e.target.value })}
                          className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="sans-serif">Pretendard (Default)</option>
                          <option value="'Jua', sans-serif">주아체 (Jua)</option>
                          <option value="'Gugi', sans-serif">구기체 (Gugi)</option>
                          <option value="'Noto Sans KR', sans-serif">Noto Sans KR</option>
                          <option value="'Nanum Pen Script', cursive">나눔 손글씨 (Pen)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">ALIGNMENT & LAYER</label>
                        <div className="flex gap-2">
                          <div className="flex p-1 bg-gray-100 rounded-xl flex-1">
                            <button
                              onClick={() => updateTextBlockContent(selectedBlock.id, { textAlign: 'left' })}
                              className={`flex-1 py-1.5 flex justify-center rounded-lg transition ${selectedBlock.textAlign === 'left' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              <AlignLeft size={16} />
                            </button>
                            <button
                              onClick={() => updateTextBlockContent(selectedBlock.id, { textAlign: 'center' })}
                              className={`flex-1 py-1.5 flex justify-center rounded-lg transition ${selectedBlock.textAlign === 'center' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              <AlignCenter size={16} />
                            </button>
                            <button
                              onClick={() => updateTextBlockContent(selectedBlock.id, { textAlign: 'right' })}
                              className={`flex-1 py-1.5 flex justify-center rounded-lg transition ${selectedBlock.textAlign === 'right' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              <AlignRight size={16} />
                            </button>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => { const maxZ = Math.max(...textBlocks.map(b => b.zIndex || 0), 10); updateTextBlockContent(selectedBlock.id, { zIndex: maxZ + 1 }); }}
                              className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 text-gray-500" title="맨 위로"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              onClick={() => { const minZ = Math.min(...textBlocks.map(b => b.zIndex || 0), 10); updateTextBlockContent(selectedBlock.id, { zIndex: Math.max(0, minZ - 1) }); }}
                              className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 text-gray-500" title="맨 뒤로"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeTextBlock(selectedBlock.id)}
                        className="w-full py-3.5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 active:scale-95 transition-all text-xs font-bold border border-red-100 flex items-center justify-center gap-2"
                      >
                        <X size={14} /> 선택 요소 삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Branding Section (Accordion) - Moved to bottom */}
            <div className={`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${expandedSections.includes('branding') ? 'ring-2 ring-indigo-50 border-indigo-100' : ''}`}>
              <button
                onClick={() => toggleSection('branding')}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Store size={16} className={expandedSections.includes('branding') ? 'text-indigo-500' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-700">샵 브랜딩 자동 배치</span>
                </div>
                <div className={`transition-transform duration-300 ${expandedSections.includes('branding') ? 'rotate-180' : ''}`}>
                  <ArrowDown size={14} className="text-gray-400" />
                </div>
              </button>

              {expandedSections.includes('branding') && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 bg-gray-50 rounded-2xl space-y-3 mb-3 border border-gray-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {shopSettings.logoUrl ? <img src={shopSettings.logoUrl} className="w-full h-full object-contain p-1" /> : <ImageIcon size={14} className="text-gray-200" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{shopSettings.name || '샵 이름 미지정'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{shopSettings.tel || '연락처 미지정'}</p>
                      </div>
                      <button
                        onClick={() => setIsShopSettingsOpen(true)}
                        className="p-2 bg-white rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => applyShopBranding('front')}
                      className="py-3 bg-indigo-50 text-indigo-700 rounded-xl text-[11px] font-extrabold hover:bg-indigo-100 active:scale-95 transition-all border border-indigo-100 flex flex-col items-center gap-1"
                    >
                      <span>앞면에 배치</span>
                      <span className="text-[9px] font-medium opacity-60">(Cover)</span>
                    </button>
                    <button
                      onClick={() => applyShopBranding('back')}
                      className="py-3 bg-neutral-800 text-white rounded-xl text-[11px] font-extrabold hover:bg-neutral-900 active:scale-95 transition-all flex flex-col items-center gap-1 shadow-lg shadow-neutral-200"
                    >
                      <span>뒷면에 배치</span>
                      <span className="text-[9px] font-medium opacity-60">(Back)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400">v2.5 Professional</span>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Ready</span>
            </div>
          </div>
        </aside>


        {/* Main Canvas Area */}
        <div className="flex-1 w-full flex flex-col items-center pt-2 overflow-auto bg-neutral-100/30">
          <EditorCanvas />
        </div>

        {/* Floating Zoom Controls - Moved to Bottom for Vertical Space */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-gray-200 z-50 transition-transform hover:scale-105">
          <button
            onClick={() => setZoom(Math.max(1, zoom - 0.5))}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
            title="축소"
          >
            <ZoomOut size={18} />
          </button>
          <div className="w-16 text-center text-xs font-bold text-gray-700 bg-gray-50 py-1 rounded-md border border-gray-100">
            {Math.round((zoom / 3) * 100)}%
          </div>
          <button
            onClick={() => setZoom(Math.min(10, zoom + 0.5))}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
            title="확대"
          >
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            onClick={() => setZoom(3.0)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-bold text-gray-500 transition"
          >
            <Maximize size={14} /> 100%
          </button>
          <button
            onClick={() => {
              const containerWidth = 800;
              const fitZoom = (containerWidth / currentDimension.widthMm) * 0.9;
              setZoom(Math.max(1, Math.min(6, fitZoom)));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold text-gray-500 transition"
          >
            <Search size={14} /> 화면맞춤
          </button>
        </div>
      </div>

      {/* Save Design Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Save className="text-indigo-600" size={20} /> 디자인 저장
              </h3>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                현재 디자인을 어떤 카테고리에 저장하시겠습니까?
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {GALLERY_CATEGORIES.filter(c => c.id !== 'my_designs').map(category => (
                  <button
                    key={category.id}
                    onClick={async () => {
                      await saveDesign(category.id);
                      setIsSaveModalOpen(false);
                      alert('디자인이 성공적으로 저장되었습니다!');
                    }}
                    className="p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left group"
                  >
                    <div className="font-bold text-gray-800 group-hover:text-indigo-700">{category.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={async () => {
                    await saveDesign(); // No category string
                    setIsSaveModalOpen(false);
                    alert('미분류로 저장되었습니다.');
                  }}
                  className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  분류 없이 그냥 저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Design Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Layers className="text-emerald-600" /> 디자인 보관함 & 무료 템플릿
              </h3>
              <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <aside className="w-56 bg-gray-50/50 border-r border-gray-100 p-4 shrink-0 overflow-y-auto">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">보관함 & 테마</label>
                <div className="flex flex-col gap-1">
                  {GALLERY_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveGalleryTab(category.id)}
                      className={`px-4 py-3 text-left text-sm font-bold rounded-xl transition-all flex items-center justify-between ${activeGalleryTab === category.id ? 'bg-white shadow-md text-emerald-600 border border-emerald-100' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
                    >
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Gallery Grid */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                {activeGalleryTab === 'my_designs' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {savedDesigns.length === 0 ? (
                      <div className="col-span-full py-20 text-center text-gray-400">
                        아직 저장된 디자인이 없습니다.
                      </div>
                    ) : (
                      savedDesigns.map((design) => (
                        <div
                          key={design.id}
                          className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative"
                          onClick={() => {
                            loadDesign(design.id);
                            setIsGalleryOpen(false);
                          }}
                        >
                          <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                            {design.background_url ? (
                              <img src={design.background_url} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="text-xs text-gray-300">내용 없음</div>
                            )}
                          </div>
                          <div className="p-4 bg-white">
                            <div className="text-xs text-gray-400 mb-1">{new Date(design.created_at).toLocaleDateString()}</div>
                            <div className="text-sm font-bold text-gray-700 truncate">{design.id.substring(0, 8)}...</div>
                          </div>
                          <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition-colors pointer-events-none" />
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {FREE_TEMPLATES[activeGalleryTab]?.map((url, index) => (
                      <div
                        key={index}
                        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative"
                        onClick={() => loadTemplate(url, activeGalleryTab)}
                      >
                        <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden">
                          <img src={url} alt={`Template ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                        </div>
                        <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition-colors pointer-events-none" />
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md font-bold">
                          적용하기
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Message Suggestion Modal */}
      {isSuggestionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {activeSuggestionType === 'quote' ? (
                    <><Sparkles className="text-emerald-600" /> 명언 라이브러리 (내지 좌측)</>
                  ) : (
                    <><MessageSquareText className="text-blue-600" /> 추천 문구 라이브러리 (내지 우측)</>
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {activeSuggestionType === 'quote'
                    ? '테마에 어울리는 명언을 선택하여 카드의 깊이를 더해보세요.'
                    : '상황에 맞는 최적의 문구를 선택하여 소중한 마음을 전하세요.'}
                </p>
              </div>
              <button onClick={() => setIsSuggestionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Categories */}
              <aside className="w-56 bg-gray-50/50 border-r border-gray-100 p-4 shrink-0 overflow-y-auto">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">카테고리</label>
                <div className="flex flex-col gap-1">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-4 py-2.5 text-left text-sm font-bold rounded-xl transition-all ${selectedCategory === key ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </aside>

              {/* Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Lang Toggle */}
                <div className="p-4 border-b border-gray-50 flex justify-end">
                  <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                    <button
                      onClick={() => setSelectedLang('ko')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${selectedLang === 'ko' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      한국어
                    </button>
                    <button
                      onClick={() => setSelectedLang('en')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${selectedLang === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activeSuggestionType === 'quote' ? QUOTE_SUGGESTIONS : MESSAGE_SUGGESTIONS)
                    .filter(s => s.category === selectedCategory && s.lang === selectedLang)
                    .map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          const isFolding = foldType === 'half';
                          const isLandscape = currentDimension.widthMm > currentDimension.heightMm;

                          let startX = currentDimension.widthMm / 2;
                          let startY = currentDimension.heightMm / 2;
                          let width = currentDimension.widthMm - (margins.left + margins.right);

                          if (activeSuggestionType === 'quote') {
                            if (isFolding) {
                              if (isLandscape) {
                                startX = (margins.left + (currentDimension.widthMm / 2)) / 2;
                                width = (currentDimension.widthMm / 2) - (margins.left + margins.right);
                              } else {
                                startX = currentDimension.widthMm / 2;
                                startY = (margins.top + (currentDimension.heightMm / 2)) / 2;
                                width = currentDimension.widthMm - (margins.left + margins.right);
                              }
                            }

                            // 명언 배치 (접지 시 좌측 중앙 또는 상단 중앙, 단면 시 전체 중앙)
                            if (suggestedQuoteBlockId) {
                              removeTextBlock(suggestedQuoteBlockId);
                            }
                            const id = addTextBlock({
                              text: suggestion.content + (suggestion.author ? `\n\n- ${suggestion.author} -` : ''),
                              x: startX,
                              y: startY,
                              fontSize: 16,
                              textAlign: 'center',
                              colorHex: '#475569',
                              fontFamily: "'Nanum Pen Script', cursive",
                              opacity: 0.6, // 명언 기본 투명도 60%
                              isLocked: true, // 위치 고정
                              width: width,
                              lineHeight: 1.6
                            });
                            setSuggestedQuoteBlockId(id);

                            // 내지로 화면 전환하여 확인 유도
                            setActivePage('inside');
                          } else {
                            if (isFolding) {
                              if (isLandscape) {
                                startX = ((currentDimension.widthMm / 2) + (currentDimension.widthMm - margins.right)) / 2;
                                width = (currentDimension.widthMm / 2) - (margins.left + margins.right);
                              } else {
                                startX = currentDimension.widthMm / 2;
                                startY = ((currentDimension.heightMm / 2) + (currentDimension.heightMm - margins.bottom)) / 2;
                                width = currentDimension.widthMm - (margins.left + margins.right);
                              }
                            }

                            // 메시지 배치 (접지 시 우측 중앙 또는 하단 중앙, 단면 시 전체 중앙)
                            if (suggestedMessageBlockId) {
                              removeTextBlock(suggestedMessageBlockId);
                            }
                            const id = addTextBlock({
                              text: suggestion.content,
                              x: startX,
                              y: startY,
                              fontSize: 20,
                              textAlign: 'center',
                              colorHex: '#334155',
                              fontFamily: "'Nanum Pen Script', cursive",
                              opacity: 1.0,  // 추천문구 기본 투명도 100%
                              isLocked: true, // 위치 고정
                              width: width,
                              lineHeight: 1.6
                            });
                            setSuggestedMessageBlockId(id);

                            // 내지로 화면 전환하여 확인 유도
                            setActivePage('inside');
                          }
                          setIsSuggestionModalOpen(false);
                        }}
                        className={`p-6 text-left border border-gray-100 rounded-2xl transition-all bg-white group relative ${activeSuggestionType === 'quote' ? 'hover:border-emerald-500 hover:shadow-xl' : 'hover:border-blue-500 hover:shadow-xl'
                          }`}
                      >
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{suggestion.content}</p>
                        {suggestion.author && (
                          <p className="text-xs text-gray-400 mt-4 text-right">— {suggestion.author}</p>
                        )}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckCircle2 size={20} className={activeSuggestionType === 'quote' ? 'text-emerald-500' : 'text-blue-500'} />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Branding Settings Modal */}
      {isShopSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                  <Store size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">샵 브랜딩 설정</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">카드에 자동으로 인쇄되는 브랜드 정보를 관리합니다.</p>
                </div>
              </div>
              <button
                onClick={() => setIsShopSettingsOpen(false)}
                className="p-2 hover:bg-white/80 rounded-full transition shadow-sm bg-white"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
              {/* Logo Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">브랜드 로고</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                    {shopSettings.logoUrl ? (
                      <>
                        <img src={shopSettings.logoUrl} className="w-full h-full object-contain p-2" alt="Logo preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <ImageIcon size={24} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <ImageIcon size={32} className="text-gray-200" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-gray-700">로고 이미지 업로드</p>
                    <p className="text-xs text-gray-400 leading-relaxed">배경이 없는 투명한 PNG 파일을 권장합니다. (300dpi 이상)</p>
                    <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 underline mt-2">샘플 로고 다운로드</button>
                  </div>
                </div>
              </div>

              {/* Info Fields */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">상세 정보</label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
                    <input
                      type="text"
                      placeholder="매장 이름 (예: 꽃을 닮은 너)"
                      value={shopSettings.name}
                      onChange={(e) => updateShopSettings({ name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 shadow-none focus:shadow-sm transition-all outline-none"
                    />
                  </div>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
                    <input
                      type="text"
                      placeholder="매장 연락처"
                      value={shopSettings.tel}
                      onChange={(e) => updateShopSettings({ tel: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 shadow-none focus:shadow-sm transition-all outline-none"
                    />
                  </div>
                  <div className="relative group">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
                    <input
                      type="text"
                      placeholder="매장 주소"
                      value={shopSettings.address}
                      onChange={(e) => updateShopSettings({ address: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 shadow-none focus:shadow-sm transition-all outline-none"
                    />
                  </div>
                  <div className="relative group">
                    <Info size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
                    <input
                      type="text"
                      placeholder="인스타그램 / 웹사이트 등"
                      value={shopSettings.sns}
                      onChange={(e) => updateShopSettings({ sns: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 shadow-none focus:shadow-sm transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsShopSettingsOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition shadow-sm"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setIsShopSettingsOpen(false);
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
              >
                설정 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 통합 AI 스마트 디자인 모달 */}
      {isAiWizardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAiWizardOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
              <button
                onClick={() => setIsAiWizardOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                title="닫기"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="animate-pulse" size={24} />
                <h2 className="text-2xl font-black">AI 스마트 디자인</h2>
              </div>
              <p className="text-white/80 text-sm font-medium">단 한 번의 터치로 표지 이미지를 완성합니다.</p>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* 입력 단계 (Step: input) */}
              {aiStep === 'input' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  {/* 테마 프리셋 선택 */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">스타일 테마</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'romantic', label: '💖 로맨틱', color: 'border-pink-50 text-pink-700' },
                        { id: 'modern', label: '🏢 모던/심플', color: 'border-slate-50 text-slate-700' },
                        { id: 'luxury', label: '💎 럭셔리/우아', color: 'border-amber-50 text-amber-700' },
                        { id: 'cute', label: '🧸 귀여운/3D', color: 'border-yellow-50 text-yellow-700' },
                        { id: 'retro', label: '📷 레트로/빈티지', color: 'border-orange-50 text-orange-700' },
                        { id: 'artistic', label: '🖼️ 예술적/추상', color: 'border-purple-50 text-purple-700' },
                        { id: 'vibrant', label: '🌈 비비드', color: 'border-red-50 text-red-700' },
                        { id: 'cyber', label: '🏙️ 사이버/네온', color: 'border-cyan-50 text-cyan-700' },
                        { id: 'nature', label: '🌿 자연/오가닉', color: 'border-emerald-50 text-emerald-700' },
                        { id: 'calm', label: '🍵 감성/차분', color: 'border-teal-50 text-teal-700' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setActiveAiThemeTab(activeAiThemeTab === t.id ? null : t.id)}
                          className={`p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-between ${activeAiThemeTab === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' : 'bg-gray-50 ' + t.color}`}
                        >
                          <span>{t.label}</span>
                          {activeAiThemeTab === t.id ? <Plus size={14} className="rotate-45" /> : <Plus size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 아트 스타일 선택 */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">아트 스타일</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: 'photo', icon: '📸' },
                        { id: 'illustration', icon: '🎨' },
                        { id: 'oil_painting', icon: '🖼️' },
                        { id: 'watercolor', icon: '🖌️' },
                        { id: 'line_art', icon: '🖋️' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setAiDesignStyle(s.id)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${aiDesignStyle === s.id ? 'bg-indigo-50 border-indigo-600' : 'bg-gray-50 border-transparent'}`}
                        >
                          <span className="text-lg">{s.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 테마별 상세 리스트 */}
                  {activeAiThemeTab && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">세부 컨셉</label>
                      <div className="grid grid-cols-1 gap-2">
                        {AI_THEME_LIBRARY[activeAiThemeTab as keyof typeof AI_THEME_LIBRARY].map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleAISmartDesign(item.prompt)}
                            className="p-3 text-left bg-white border border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex items-center justify-between"
                          >
                            <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-700">{item.label}</span>
                            <Sparkles size={12} className="text-indigo-300" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                    <div className="relative flex justify-center text-[10px]"><span className="bg-white px-2 text-gray-400 font-bold uppercase tracking-widest">OR</span></div>
                  </div>

                  {/* 커스텀 프롬프트 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 font-black">직접 입력하기</label>
                    <textarea
                      value={aiThemePrompt}
                      onChange={e => setAiThemePrompt(e.target.value)}
                      placeholder="예: '수채화 풍의 장미 정원'"
                      className="w-full p-4 border border-gray-200 rounded-2xl text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <button
                    onClick={() => handleAISmartDesign()}
                    disabled={isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-lg"
                  >
                    AI 디자인 시작하기
                  </button>
                </div>
              )}

              {/* 결과 선택 단계 (Step: complete) */}
              {aiStep === 'complete' && aiGeneratedImages.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center">
                    <h3 className="text-xl font-black text-indigo-900">최고의 디자인을 골라주세요!</h3>
                    <p className="text-xs font-medium text-slate-400">마음에 드는 이미지를 클릭하면 카드에 즉시 적용됩니다.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {aiGeneratedImages.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          if (foldType === 'half') setFrontBackgroundUrl(img.url);
                          else setBackgroundUrl(img.url);
                        }}
                        className={`relative cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${
                          (foldType === 'half' ? frontBackgroundUrl === img.url : backgroundUrl === img.url)
                            ? 'border-indigo-600 shadow-xl scale-[1.05]'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt="AI 시안" className="w-full aspect-square object-cover" />
                        {(foldType === 'half' ? frontBackgroundUrl === img.url : backgroundUrl === img.url) && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <button
                      onClick={() => setAiStep('input')}
                      className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm"
                    >
                      다시 설정하기
                    </button>
                    <button
                      onClick={() => setIsAiWizardOpen(false)}
                      className="bg-black text-white py-4 rounded-2xl font-black text-sm"
                    >
                      이 디자인으로 편집
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* === 폼텍 인쇄 모달 === */}
      {isFormtecMode && (
        <FormtecModal
          isOpen={isFormtecMode}
          onClose={() => setIsFormtecMode(false)}
          config={LABEL_CONFIGS[formtecLabelType]}
          formtecLabelType={formtecLabelType}
          formtecSelectedCells={formtecSelectedCells}
          setFormtecSelectedCells={setFormtecSelectedCells}
          formtecMessage={formtecMessage}
          setFormtecMessage={setFormtecMessage}
          formtecFontSize={formtecFontSize}
          setFormtecFontSize={setFormtecFontSize}
          formtecIsBold={formtecIsBold}
          setFormtecIsBold={setFormtecIsBold}
          formtecTextAlign={formtecTextAlign}
          setFormtecTextAlign={setFormtecTextAlign}
          formtecBgColor={formtecBgColor}
          setFormtecBgColor={setFormtecBgColor}
          formtecTextColor={formtecTextColor}
          setFormtecTextColor={setFormtecTextColor}
          onPrint={handleFormtecPrint}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={32} />
          </div>
          <p className="mt-6 text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            AI가 세상을 더 아름답게 디자인하고 있습니다...
          </p>
          <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요 (약 2~3초 소요)</p>
        </div>
      )}
    </main>
  );
}

// === 하위 컴포넌트: 폼텍 모달 (파싱 에러 방지를 위해 분리) ===
function FormtecModal({
  isOpen, onClose, config, formtecLabelType, formtecSelectedCells, setFormtecSelectedCells,
  formtecMessage, setFormtecMessage, formtecFontSize, setFormtecFontSize,
  formtecIsBold, setFormtecIsBold, formtecTextAlign, setFormtecTextAlign,
  formtecBgColor, setFormtecBgColor, formtecTextColor, setFormtecTextColor,
  onPrint, isGenerating, setIsGenerating
}: any) {
  if (!isOpen) return null;
  const rows = config ? Math.ceil(config.cells / config.cols) : 1;
  const cols = config ? config.cols : 1;
  const totalCells = config ? config.cells : 1;

  const toggleCell = (idx: number) => {
    setFormtecSelectedCells((prev: any) =>
      prev.includes(idx) ? prev.filter((c: any) => c !== idx) : [...prev, idx]
    );
  };
  const selectAll = () => setFormtecSelectedCells(Array.from({ length: totalCells }, (_, i) => i));
  const clearAll = () => setFormtecSelectedCells([]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🏷️ {PAPER_PRESETS.find(p => p.id === formtecLabelType)?.label || '라벨'} 인쇄
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X size={24} className="text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">인쇄할 위치를 클릭하여 선택하세요</p>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 그리드 선택기 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600">
                인쇄 위치 선택 <span className="text-emerald-600">({formtecSelectedCells.length}/{totalCells})</span>
              </label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold">전체 선택</button>
                <button onClick={clearAll} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-500 rounded-md font-bold">전체 해제</button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
              <div
                className="bg-white rounded-lg border border-gray-300 mx-auto shadow-sm overflow-hidden"
                style={{ aspectRatio: '210/297', maxHeight: '300px' }}
              >
                <div
                  className="grid h-full w-full p-2"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gap: '2px'
                  }}
                >
                  {Array.from({ length: totalCells }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleCell(idx)}
                      className={`rounded border transition-all flex items-center justify-center text-[9px] ${formtecSelectedCells.includes(idx) ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-gray-300 border-gray-100'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 메시지 입력 */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">인쇄 메시지</label>
            <textarea
              value={formtecMessage}
              onChange={e => setFormtecMessage(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm h-20 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="내용을 입력하세요..."
            />
          </div>

          {/* 스타일 조절 */}
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 border-r pr-3">
              <button onClick={() => setFormtecFontSize(Math.max(8, formtecFontSize - 1))}><Minus size={16} /></button>
              <span className="text-xs font-bold w-4 text-center">{formtecFontSize}</span>
              <button onClick={() => setFormtecFontSize(Math.min(72, formtecFontSize + 1))}><Plus size={16} /></button>
            </div>
            <button
              onClick={() => setFormtecIsBold(!formtecIsBold)}
              className={`p-1.5 rounded ${formtecIsBold ? 'bg-emerald-100 text-emerald-600' : ''}`}
            >
              <Bold size={16} />
            </button>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(a => (
                <button key={a} onClick={() => setFormtecTextAlign(a)} className={`p-1.5 rounded ${formtecTextAlign === a ? 'bg-emerald-100' : ''}`}>
                  {a === 'left' ? <AlignLeft size={16} /> : a === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* 인쇄 실행 */}
          <button
            onClick={onPrint}
            disabled={!formtecMessage.trim() || formtecSelectedCells.length === 0 || isGenerating}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            🖨️ {formtecSelectedCells.length}개 라벨 인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}
