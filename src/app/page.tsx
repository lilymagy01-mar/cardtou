'use client';

import { useEditorStore } from '@/store/useEditorStore';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { 
  Type, 
  Image as ImageIcon, 
  Download, 
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
import { CATEGORY_LABELS, MESSAGE_SUGGESTIONS, QUOTE_SUGGESTIONS } from '@/lib/constants/ContentSuggestions';

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
    shopSettings,
    updateShopSettings,
    applyShopBranding
  } = useEditorStore();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isShopSettingsOpen, setIsShopSettingsOpen] = useState(false);
  const [activeSuggestionType, setActiveSuggestionType] = useState<'quote' | 'message'>('message');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  
  // Sidebar accordion states
  const [expandedSections, setExpandedSections] = useState<string[]>(['format', 'branding']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };
  
  // Suggestion Modal State
  const [selectedCategory, setSelectedCategory] = useState<string>('lover');
  const [selectedLang, setSelectedLang] = useState<'ko' | 'en'>('ko');

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

  const handleApplyTheme = async (theme: { name: string; bg: string; text: string; subText: string }) => {
    setIsGenerating(true);
    try {
      const isFolding = foldType === 'half';
      const midX = currentDimension.widthMm / 2;
      const centerY = currentDimension.heightMm / 2;

      // 1. AI 배경 생성 요청
      const themeKey = theme.name.split(' ')[0].toLowerCase();
      const aiTheme = themeKey.includes('로맨틱') ? 'romantic-pink' : 
                      themeKey.includes('모던') ? 'modern-white' :
                      themeKey.includes('빈티지') ? 'vintage-brown' : 'calm-blue';
      
      const aiResult = await AIConnector.generateBackground(aiTheme.split('-')[0]);
      
      // 2. 전체 데이터 초기화
      const fontMap: Record<string, string> = {
        'romantic-pink': "'Jua', sans-serif",
        'modern-white': "'Noto Sans KR', sans-serif",
        'vintage-brown': "'Nanum Pen Script', cursive",
        'calm-blue': "'Gugi', sans-serif"
      };
      const selectedFont = fontMap[aiTheme] || 'sans-serif';

      // --- OUTSIDE PAGE ---
      setActivePage('outside');
      // 기존 블록 삭제
      textBlocks.forEach(b => removeTextBlock(b.id));
      imageBlocks.forEach(b => removeImageBlock(b.id));

      if (isFolding) {
        setFrontBackgroundUrl(aiResult.imageUrl);
        setBackBackgroundUrl(null); // 뒷면은 깨끗하게 유지 (꽃집 커스텀용)
      } else {
        setBackgroundUrl(aiResult.imageUrl);
      }

      const isLandscape = currentDimension.widthMm > currentDimension.heightMm;

      // 앞면 문구 배치
      let frontX = midX;
      let frontY = centerY - 10;
      
      if (isFolding) {
        if (isLandscape) {
          frontX = midX + (midX / 2); // 우측 페이지
          frontY = centerY - 10;
        } else {
          frontX = midX;
          frontY = centerY + (centerY / 2); // 하단 페이지 (표지 정면)
        }
      }

      let mainText = theme.text;
      if (!mainText || mainText === theme.name) {
        if (aiTheme.includes('romantic')) mainText = "사랑합니다";
        else if (aiTheme.includes('vintage')) mainText = "감사합니다";
        else if (aiTheme.includes('modern')) mainText = "수고하셨습니다";
        else mainText = "평안을 빕니다";
      }

      const mainWidth = isFolding 
        ? (isLandscape ? (currentDimension.widthMm / 2 - (margins.left + margins.right)) : (currentDimension.widthMm - (margins.left + margins.right)))
        : (currentDimension.widthMm - (margins.left + margins.right));

      const mainSize = TypographyWizard.getOptimalFontSize(mainText, mainWidth, 100, 32, selectedFont);
      addTextBlock({ 
        text: mainText, 
        x: frontX,
        y: frontY, 
        fontSize: mainSize, 
        textAlign: 'center', 
        colorHex: aiTheme.includes('romantic') ? '#db2777' : '#1e293b',
        fontFamily: selectedFont,
        zIndex: 10,
        width: mainWidth
      });

      // 뒷면 로고 플레이스홀더
      if (isFolding) {
        let backX = midX / 2;
        let backY = currentDimension.heightMm - 20;

        if (!isLandscape) {
          backX = midX;
          // 세로형의 뒷면은 캔버스의 상단 절반. 접었을 때의 하단은 y=0 부근.
          backY = 30; 
        }

        addImageBlock({
          url: null,
          x: backX,
          y: backY,
          width: 30,
          height: 10,
          isPrintable: false,
          rotation: 180 // 세로형 상단(뒷면) 로고는 180도 회전 필수
        });
      }

      // --- INSIDE PAGE ---
      setActivePage('inside');
      // 기존 블록 삭제
      textBlocks.forEach(b => removeTextBlock(b.id));
      imageBlocks.forEach(b => removeImageBlock(b.id));
      setMargins({ top: 10, right: 10, bottom: 10, left: 10 });



      // 다시 메인(Outside) 페이지로 복귀
      setActivePage('outside');
      setIsAIModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('AI 테마 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

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

  const PAPER_PRESETS = [
    // Standard Sizes
    { label: 'A2 (420 x 594 mm)', widthMm: 420, heightMm: 594, id: 'a2', group: '표준 규격' },
    { label: 'A3 (297 x 420 mm)', widthMm: 297, heightMm: 420, id: 'a3', group: '표준 규격' },
    { label: 'A4 (210 x 297 mm)', widthMm: 210, heightMm: 297, id: 'a4', group: '표준 규격' },
    { label: 'A5 (148 x 210 mm)', widthMm: 148, heightMm: 210, id: 'a5', group: '표준 규격' },
    { label: 'B4 (250 x 353 mm)', widthMm: 250, heightMm: 353, id: 'b4', group: '표준 규격' },
    { label: 'B5 (176 x 250 mm)', widthMm: 176, heightMm: 250, id: 'b5', group: '표준 규격' },
    { label: '엽서 (105 x 148 mm)', widthMm: 105, heightMm: 148, id: 'postcard', group: '표준 규격' },
    // Formtec
    { label: 'A4 전면 (3101)', widthMm: 210, heightMm: 297, id: 'formtec-3101', group: '폼텍 라벨' },
    { label: '폼텍 2칸 (3102)', widthMm: 199.6, heightMm: 143.5, id: 'formtec-3102', group: '폼텍 라벨' },
    { label: '폼텍 4칸 (3104)', widthMm: 99.1, heightMm: 143.5, id: 'formtec-3104', group: '폼텍 라벨' },
    { label: '폼텍 6칸 (3107)', widthMm: 99.1, heightMm: 93.1, id: 'formtec-3107', group: '폼텍 라벨' },
    { label: '폼텍 8칸 (3108)', widthMm: 99.1, heightMm: 67.7, id: 'formtec-3108', group: '폼텍 라벨' },
    { label: '폼텍 12칸 (3109)', widthMm: 99.1, heightMm: 45.0, id: 'formtec-3109', group: '폼텍 라벨' },
  ];

  const selectedBlock = textBlocks.find(b => b.id === selectedBlockId);

  const handleAddText = () => {
    addTextBlock({
      text: '새로운 텍스트',
      x: 50,
      y: 50,
      fontSize: 24,
      colorHex: '#333333',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBackgroundUrl(dataUrl);
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
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = async () => {
    const { PrintCommander } = await import('@/lib/agents/printCommander');
    const { pages, activePage, backgroundUrl, textBlocks, currentDimension, foldType } = useEditorStore.getState();
    
    // 현재 작업 중인 페이지 데이터 최신화 (pages 객체 내)
    const currentPages = {
      ...pages,
      [activePage]: { backgroundUrl, textBlocks }
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
          fontFamily: b.fontFamily
        })),
        imageBlocks: p.imageBlocks?.map(b => ({
          url: b.url,
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          isPrintable: b.isPrintable
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
        @import url('https://fonts.googleapis.com/css2?family=Gugi&family=Jua&family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@400;700&display=swap');
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
          <button onClick={saveDesign} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md font-bold text-sm">
            현재 디자인 저장
          </button>
          <div className="w-[1px] h-8 bg-gray-200 mx-2" />
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition shadow-lg font-bold"
          >
            <Download size={18} /> 고해상도 인쇄 (PDF)
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
              <button 
                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-100 transition-all font-bold group"
                onClick={() => setIsAIModalOpen(true)}
              >
                <Sparkles size={16} className="text-white/80" />
                <span className="text-sm">AI 테마 도안</span>
              </button>
              <button 
                onClick={() => setIsGalleryOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-gray-50 text-gray-700 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition-all font-bold text-xs"
              >
                <Layers size={16} className="text-gray-400" /> 디자인 보관함
              </button>
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
                          if (presetId.startsWith('formtec-')) setFoldType('none');
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

            {/* 3. Inside Setting Section (Accordion) - Only if half fold & inside page */}
            {activePage === 'inside' && foldType === 'half' && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => toggleSection('inside_settings')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquareText size={16} className="text-emerald-500" />
                    <span className="text-sm font-bold text-gray-700">내지 편지 설정</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedSections.includes('inside_settings') ? 'rotate-180' : ''}`}>
                    <ArrowDown size={14} className="text-gray-400" />
                  </div>
                </button>
                
                {expandedSections.includes('inside_settings') && (
                  <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => { setActiveSuggestionType('quote'); setIsSuggestionModalOpen(true); }}
                        className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition font-bold text-xs"
                      >
                        <Sparkles size={14} className="text-emerald-500" /> 명언 라이브러리 (좌측)
                      </button>
                      <button 
                        onClick={() => { setActiveSuggestionType('message'); setIsSuggestionModalOpen(true); }}
                        className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl hover:bg-indigo-100 transition font-bold text-xs"
                      >
                        <MessageSquareText size={14} className="text-indigo-500" /> 추천 문구 (우측)
                      </button>
                    </div>

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
                            type="number" value={selectedBlock.fontSize}
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

      {/* Design Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Layers className="text-emerald-600" /> 내 디자인 보관함
              </h3>
              <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-6">
              {savedDesigns.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-400">
                  아직 저장된 디자인이 없습니다.
                </div>
              ) : (
                savedDesigns.map((design) => (
                  <div 
                    key={design.id} 
                    className="group border border-gray-100 rounded-2xl overflow-hidden hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative"
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
          </div>
        </div>
      )}

      {/* AI Theme Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="text-indigo-600 animate-pulse" /> AI 도안 자동 생성 (테마)
                </h3>
                <p className="text-sm text-gray-500 mt-1">원하는 분위기를 선택하면 AI가 배경과 조화로운 폰트를 설정해줍니다.</p>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-4">
              {[
                { name: '로맨틱 핑크', desc: '사랑스러운 분위기', bg: '/themes/romantic_pink.png', text: 'To my Darling', subText: 'You make my world brighter', color: 'from-pink-100 to-rose-200' },
                { name: '모던 화이트', desc: '깔끔하고 정돈된 느낌', bg: '/themes/modern_white.png', text: 'Simplicity', subText: 'The ultimate sophistication', color: 'from-slate-50 to-gray-200' },
                { name: '빈티지 리프', desc: '자연스럽고 편안함', bg: '/themes/vintage_leaf.png', text: 'Thank You', subText: 'For your endless support', color: 'from-green-50 to-emerald-200' },
                { name: '차분한 블루', desc: '신뢰와 평온함', bg: '/themes/calm_blue.png', text: 'Stay Calm', subText: 'Peace begins with a smile', color: 'from-blue-50 to-indigo-200' },
              ].map((theme) => (
                <button 
                  key={theme.name}
                  onClick={() => handleApplyTheme(theme)}
                  className="flex flex-col items-start p-6 rounded-2xl border border-gray-100 hover:border-indigo-500 hover:shadow-lg transition-all text-left bg-white group"
                >
                  <img src={theme.bg} alt={theme.name} className="w-full aspect-video rounded-xl mb-4 object-cover shadow-inner group-hover:scale-105 transition-transform duration-300" />
                  <div className="font-bold text-gray-800">{theme.name}</div>
                  <div className="text-xs text-gray-500">{theme.desc}</div>
                </button>
              ))}
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <p className="text-[10px] text-gray-400 italic">AI 생성 시 1건당 API 호출 비용이 발생할 수 있습니다.</p>
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
                          }
                          setIsSuggestionModalOpen(false);
                        }}
                        className={`p-6 text-left border border-gray-100 rounded-2xl transition-all bg-white group relative ${
                          activeSuggestionType === 'quote' ? 'hover:border-emerald-500 hover:shadow-xl' : 'hover:border-blue-500 hover:shadow-xl'
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
                   // Apply immediately if needed, or just let user click apply in sidebar
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
              >
                설정 저장하기
              </button>
            </div>
          </div>
        </div>
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
