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
  Maximize2,
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
  Info,
  Camera
} from 'lucide-react';
import { PhotoEditModal } from '@/components/photo-editor/PhotoEditModal';
import { useState, useEffect } from 'react';
import { AIConnector } from '@/lib/agents/aiConnector';
import { TypographyWizard } from '@/lib/agents/typographyWizard';
import { LABEL_CONFIGS } from '@/lib/agents/printCommander';
import { CATEGORY_LABELS, MESSAGE_SUGGESTIONS, QUOTE_SUGGESTIONS } from '@/lib/constants/ContentSuggestions';
import { GALLERY_CATEGORIES, FREE_TEMPLATES, CALLIGRAPHY_PHRASES, CALLIGRAPHY_FONTS } from '@/lib/constants/templates';
import { AI_THEME_LIBRARY } from '@/lib/constants/aiPrompts';

const PAPER_PRESETS = [
  // 용지 규격
  { id: 'a5', label: 'A5 (148x210mm)', widthMm: 210, heightMm: 148, group: '용지 규격' },
  { id: 'a4', label: 'A4 (210x297mm)', widthMm: 297, heightMm: 210, group: '용지 규격' },
  { id: 'a3', label: 'A3 (297x420mm)', widthMm: 420, heightMm: 297, group: '용지 규격' },
  { id: 'a2', label: 'A2 (420x594mm)', widthMm: 594, heightMm: 420, group: '용지 규격' },
  { id: 'a6', label: 'A6 (105x148mm)', widthMm: 148, heightMm: 105, group: '용지 규격' },
  { id: 'custom-card', label: '일반 카드 (100x150mm)', widthMm: 150, heightMm: 100, group: '용지 규격' },
  { id: 'postcard', label: '엽서 (105x148mm)', widthMm: 105, heightMm: 148, group: '용지 규격' },
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
    setSelectedBlockId,
    selectedBlockIds,
    selectAll,
    deselectAll,
    updateTextBlockPosition,
    updateImageBlockPosition,
    moveSelectedBlocks,
    pages,
  } = useEditorStore();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [aiModalType, setAiModalType] = useState<'theme' | 'magic' | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isShopSettingsOpen, setIsShopSettingsOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [activeSuggestionType, setActiveSuggestionType] = useState<'quote' | 'message'>('message');
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
  const [aiThemePrompt, setAiThemePrompt] = useState(''); 
  const [aiGeneratedMessages, setAiGeneratedMessages] = useState<{ message: string; tone: string }[]>([]);
  const [aiSelectedMessage, setAiSelectedMessage] = useState('');
  const [aiGeneratedImages, setAiGeneratedImages] = useState<{ url: string; seed: number }[]>([]); 
  const [activeAiThemeTab, setActiveAiThemeTab] = useState<string | null>(null);
  const [aiStep, setAiStep] = useState<'input' | 'messages' | 'complete'>('input');
  const [aiDesignStyle, setAiDesignStyle] = useState('photo'); 

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
  
  // Keyboard Shortcuts & Movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      // SELECT ALL (Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll();
        return;
      }

      // DESELECT ALL (Escape)
      if (e.key === 'Escape') {
        deselectAll();
        return;
      }

      // REMOVE SELECTED (Delete / Backspace)
      if (e.key === 'Delete' || (e.key === 'Backspace' && (e.ctrlKey || e.metaKey))) {
        selectedBlockIds.forEach(id => {
          if (id.startsWith('text-')) removeTextBlock(id);
          if (id.startsWith('image-')) removeImageBlock(id);
        });
        deselectAll();
        return;
      }

      // ARROW MOVEMENT
      const isArrow = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
      if (isArrow && selectedBlockIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        
        const dx = e.key === 'ArrowLeft' ? -step : (e.key === 'ArrowRight' ? step : 0);
        const dy = e.key === 'ArrowUp' ? -step : (e.key === 'ArrowDown' ? step : 0);
        
        moveSelectedBlocks(dx, dy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockIds, textBlocks, imageBlocks, selectAll, deselectAll, updateTextBlockPosition, updateImageBlockPosition, removeTextBlock, removeImageBlock, moveSelectedBlocks]);

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

  useEffect(() => {
    if (isFormtecMode) {
      const otherPage = activePage === 'outside' ? 'inside' : 'outside';
      const otherBlocks = pages[otherPage]?.textBlocks || [];

      const allTexts = [
        ...textBlocks.map(b => b.text),
        ...otherBlocks.map(b => b.text)
      ].filter(t => t && t.trim() !== '' && !t.includes('To.') && !t.includes('From.'));

      const combinedText = allTexts.join('\n').trim();

      setFormtecMessage(prev => {
        if (!prev) return combinedText;
        return prev;
      });
    }
  }, [isFormtecMode, activePage, textBlocks, pages]);

  useEffect(() => {
    if (selectedPresetId.startsWith('formtec-')) {
      setFormtecLabelType(selectedPresetId);
    }
  }, [selectedPresetId]);

  const [selectedCategory, setSelectedCategory] = useState<string>('lover');
  const [selectedLang, setSelectedLang] = useState<'ko' | 'en'>('ko');

  const loadTemplate = (imageUrl: string, categoryId?: string) => {
    const state = useEditorStore.getState();
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
      const randomRotation = (Math.random() * 8) - 4;
      const baseSize = Math.min(currentDimension.widthMm, currentDimension.heightMm) * 0.18;
      const safeWidth = currentDimension.widthMm * 0.7;
      const autoScaledSize = Math.min(baseSize, safeWidth / Math.max(randomPhrase.length, 1) * 1.8);

      useEditorStore.getState().addTextBlock({
        text: randomPhrase,
        x: targetX,
        y: targetY - 20,
        fontSize: autoScaledSize,
        colorHex: '#ffffff',
        fontFamily: randomFont,
        textAlign: 'center',
        zIndex: 50,
        rotation: randomRotation,
        strokeWidth: 0.5,
        strokeColor: '#000000',
        textShadow: 'rgba(0,0,0,0.85) 1px 2px 4px, rgba(0,0,0,0.7) 0px 4px 12px, rgba(0,0,0,0.5) 0px 0px 20px',
      });
    }

    state.setActivePage('inside');
    const inState = useEditorStore.getState();
    inState.textBlocks.forEach(b => inState.removeTextBlock(b.id));
    inState.imageBlocks.forEach(b => inState.removeImageBlock(b.id));

    state.setActivePage('outside');
    state.setDesignId(null);
    setIsGalleryOpen(false);
    setActiveGalleryTab('my_designs');
    state.applyShopBranding('back');
  };

  useEffect(() => {
    if (isGalleryOpen) {
      listDesigns().then(setSavedDesigns);
    }
  }, [isGalleryOpen, listDesigns]);

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

  useEffect(() => {
    const handleAutoFit = () => {
      const workspaceWidth = window.innerWidth - 320 - 80;
      const workspaceHeight = window.innerHeight - 48 - 80;
      const zoomW = workspaceWidth / currentDimension.widthMm;
      const zoomH = workspaceHeight / currentDimension.heightMm;
      const idealZoom = Math.min(zoomW, zoomH);
      const clampedZoom = Math.max(1, Math.min(6, idealZoom));
      setZoom(clampedZoom);
    };

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

    if (toBlockId) {
      removeTextBlock(toBlockId);
      setToBlockId(null);
    }

    if (newState) {
      const isFolding = foldType === 'half';
      const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
      const midX = currentDimension.widthMm / 2;
      let startX = midX;
      let startY = 30;
      let width = currentDimension.widthMm - (margins.left + margins.right);

      if (isFolding) {
        if (isLandscape) {
          startX = (midX + (currentDimension.widthMm - margins.right)) / 2;
          startY = 40;
          width = (currentDimension.widthMm / 2) - (margins.left + margins.right);
        } else {
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
        colorHex: '#ffffff',
        strokeWidth: 0.5,
        strokeColor: '#000000',
        fontFamily: "'Noto Sans KR', sans-serif",
        width: width,
        rotation: 0
      });
      setToBlockId(id);
    }
  };

  const handleToggleFromField = () => {
    const newState = !showFromField;
    setShowFromField(newState);

    if (fromBlockId) {
      removeTextBlock(fromBlockId);
      setFromBlockId(null);
    }

    if (newState) {
      const isFolding = foldType === 'half';
      const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
      const midX = currentDimension.widthMm / 2;
      let startX = midX;
      let startY = currentDimension.heightMm - 30;
      let width = currentDimension.widthMm - (margins.left + margins.right);

      if (isFolding) {
        if (isLandscape) {
          startX = (midX + (currentDimension.widthMm - margins.right)) / 2;
          startY = currentDimension.heightMm - margins.bottom - 10;
        } else {
          startX = currentDimension.widthMm - margins.right - 20;
          startY = currentDimension.heightMm - margins.bottom - 10;
          width = 40;
        }
      }

      const id = addTextBlock({
        text: `From. ${senderName || '보내는 사람'}`,
        x: startX,
        y: startY,
        fontSize: 14,
        textAlign: isLandscape ? 'center' : 'right',
        colorHex: '#ffffff',
        strokeWidth: 0.5,
        strokeColor: '#000000',
        fontFamily: "'Noto Sans KR', sans-serif",
        width: width,
        rotation: 0
      });
      setFromBlockId(id);
    }
  };

  const handleAISmartDesign = async (specificStyle?: string) => {
    setIsGenerating(true);
    setFrontBackgroundUrl(null);
    setBackgroundUrl(null);
    try {
      setActivePage('outside');
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: specificStyle || aiThemePrompt || 'Beautiful artistic cover',
          theme: activeAiThemeTab || 'modern',
          style: aiDesignStyle,
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
      
      if (images.length > 0) {
        const imageUrl = images[0].url;
        if (foldType === 'half') setFrontBackgroundUrl(imageUrl);
        else setBackgroundUrl(imageUrl);
      }
      setAiStep('complete');
    } catch (error: any) {
      console.error('AI Smart Design error:', error);
      alert(`디자인 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedBlock = textBlocks.find(b => b.id === selectedBlockId);

  const handleAddText = () => {
    const offset = (textBlocks.length % 5) * 6;
    addTextBlock({
      text: '내용을 입력하세요',
      x: (currentDimension.widthMm / 2) + offset,
      y: (currentDimension.heightMm / 2) + offset,
      fontSize: 24,
      colorHex: '#ffffff',
      strokeWidth: 0.5,
      strokeColor: '#000000',
      textAlign: 'center',
      fontFamily: "'Bagel Fat One', cursive"
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

  const handleFormtecPrint = async () => {
    if (formtecSelectedCells.length === 0) {
      alert('인쇄할 라벨 위치를 선택해 주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const { PrintCommander } = await import('@/lib/agents/printCommander');
      const currentDesign = {
        backgroundUrl: activePage === 'outside' && foldType === 'half' ? null : backgroundUrl,
        frontBackgroundUrl: activePage === 'outside' && foldType === 'half' ? frontBackgroundUrl : null,
        textBlocks: textBlocks.map(b => ({
          text: b.text,
          x: b.x,
          y: b.y,
          size: b.fontSize,
          colorHex: b.colorHex,
          textAlign: b.textAlign,
          fontFamily: b.fontFamily,
          rotation: b.rotation,
          textShadow: b.textShadow,
          opacity: b.opacity,
          strokeWidth: b.strokeWidth,
          strokeColor: b.strokeColor
        })),
        imageBlocks: imageBlocks.map(b => ({
          url: b.url,
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          isPrintable: b.isPrintable,
          rotation: b.rotation
        }))
      };

      if (formtecMessage.trim()) {
        (currentDesign.textBlocks as any[]).push({
          text: formtecMessage,
          x: currentDimension.widthMm / 2,
          y: currentDimension.heightMm / 2,
          size: formtecFontSize,
          colorHex: formtecTextColor,
          fontFamily: "'Nanum Pen Script', cursive",
          textAlign: formtecTextAlign,
          fontWeight: formtecIsBold ? 'bold' : 'normal',
          strokeWidth: 0
        });
      }

      const pdfBytes = await PrintCommander.generatePdf({
        paperSizeMm: { 
          width: currentDimension.widthMm, 
          height: currentDimension.heightMm 
        },
        pages: [currentDesign],
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
    const state = useEditorStore.getState();

    const currentPages = {
      ...state.pages,
      [activePage]: {
        ...state.pages[activePage],
        backgroundUrl,
        frontBackgroundUrl,
        backBackgroundUrl,
        textBlocks,
        imageBlocks
      }
    };

    const selectedPreset = PAPER_PRESETS.find(p => p.id === selectedPresetId);
    const labelType = selectedPreset?.id?.startsWith('formtec-') ? selectedPreset.id : undefined;

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
          rotation: b.rotation,
          textShadow: b.textShadow,
          opacity: b.opacity,
          strokeWidth: b.strokeWidth,
          strokeColor: b.strokeColor
        })),
        imageBlocks: p.imageBlocks?.map(b => ({
          url: b.url,
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          isPrintable: b.isPrintable,
          rotation: b.rotation
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
      <PhotoEditModal
        isOpen={isPhotoEditorOpen}
        onClose={() => setIsPhotoEditorOpen(false)}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Black+Han+Sans&family=Do+Hyeon&family=Sunflower:wght@300;500;700&family=Gowun+Batang&family=Yeon+Sung&family=Song+Myung&family=Nanum+Myeongjo&family=Gowun+Dodum&family=Nanum+Pen+Script&family=Gaegu&family=Poor+Story&family=Single+Day&family=Gamja+Flower&family=Black+And+White+Picture&family=Dongle&family=Jua&family=Noto+Sans+KR:wght@400;700&display=swap');
      `}</style>
      
      <header className="bg-white border-b border-gray-200 px-6 py-1 flex items-center justify-between shadow-sm z-30 h-12">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CardToYou
          </h1>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActivePage('outside')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activePage === 'outside' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              커버 (Outside)
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
            저장하기
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
            대량 라벨 인쇄
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-48px)]">
        <aside className="w-80 bg-white border-r border-gray-200 shrink-0 flex flex-col z-10 shadow-sm overflow-hidden sticky top-0 h-[calc(100vh-48px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            
            <div className="space-y-2 mb-4">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Quick Tools</h2>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleAddText}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all text-gray-600 group"
                >
                  <Type size={18} className="group-hover:text-indigo-600 text-gray-400" />
                  <span className="text-[10px] font-bold">텍스트</span>
                </button>
                <label className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-pink-50 hover:border-pink-100 hover:text-pink-700 transition-all text-gray-600 group cursor-pointer">
                  <ImageIcon size={18} className="group-hover:text-pink-600 text-gray-400" />
                  <span className="text-[10px] font-bold">사진 추가</span>
                  <input type="file" accept="image/*" className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        addImageBlock({
                          url: dataUrl,
                          x: currentDimension.widthMm / 2 - 25,
                          y: currentDimension.heightMm / 2 - 25,
                          width: 50,
                          height: 50,
                          isPrintable: true,
                          rotation: 0,
                        });
                      };
                      reader.readAsDataURL(file);
                    }} 
                  />
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-purple-50 hover:border-purple-100 hover:text-purple-700 transition-all text-gray-600 group cursor-pointer">
                  <Maximize2 size={18} className="group-hover:text-purple-600 text-gray-400" />
                  <span className="text-[10px] font-bold">배경 이미지</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <button
                onClick={() => setIsPhotoEditorOpen(true)}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-100 rounded-2xl hover:border-rose-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                  <Camera size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-gray-800">포토 커버 스튜디오</p>
                  <p className="text-[10px] text-gray-400 font-bold">사진 자동 보정 및 편집</p>
                </div>
              </button>

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
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white border-2 border-gray-100 text-gray-700 rounded-[2rem] hover:border-indigo-400 hover:text-indigo-600 transition-all font-black text-sm active:scale-95 shadow-sm"
                >
                  <Grid size={20} className="text-gray-400" />
                  <span>디자인 템플릿 갤러리</span>
                </button>
              </div>
            </div>

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
                          }
                        }
                      }}
                      className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <optgroup label="용지 규격">
                        {PAPER_PRESETS.filter(p => p.group === '용지 규격').map(preset => (
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

            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm p-3 mb-2">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setActiveSuggestionType('message'); setIsSuggestionModalOpen(true); }}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl hover:shadow-md hover:border-blue-400 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><MessageSquareText size={20} /></div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-800">추천 메시지 찾기</p>
                    <p className="text-[10px] text-gray-400 font-bold">감동, 축하, 사랑 테마 문구</p>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSuggestionType('quote'); setIsSuggestionModalOpen(true); }}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl hover:shadow-md hover:border-indigo-400 transition-all group"
                >
                  <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Sparkles size={20} /></div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-800">감성 명언 라이브러리</p>
                    <p className="text-[10px] text-gray-400 font-bold">격언, 명대사, 시 구절</p>
                  </div>
                </button>
              </div>
            </div>

            {activePage === 'inside' && foldType === 'half' && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => toggleSection('inside_settings')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-emerald-500" />
                    <span className="text-sm font-bold text-gray-700">명단 및 수발신자 설정</span>
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
                          placeholder="받는 사람 이름" className="w-full p-2.5 text-xs bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
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
                          placeholder="보내는 사람 이름" className="w-full p-2.5 text-xs bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${selectedBlockId ? 'ring-2 ring-blue-50 border-blue-100' : ''}`}>
              <button
                onClick={() => toggleSection('properties')}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                id="properties-accordion-header"
              >
                <div className="flex items-center gap-2">
                  <Settings size={16} className={selectedBlockId ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-700">선택 요소 속성 편집</span>
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
                      <p className="text-xs font-bold text-gray-400">편집할 요소를 선택해 주세요</p>
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

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase ml-0.5">STYLE PRESETS</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateTextBlockContent(selectedBlock.id, { 
                              colorHex: '#ffffff', 
                              strokeWidth: 1.5, 
                              strokeColor: '#000000',
                              fontFamily: "'Black Han Sans', sans-serif"
                            })}
                            className="py-2 px-3 bg-white border-2 border-slate-900 text-slate-900 rounded-xl text-[10px] font-black hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles size={12} /> 고대비 스타일
                          </button>
                          <button
                            onClick={() => updateTextBlockContent(selectedBlock.id, { 
                              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            })}
                            className="py-2 px-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-[10px] font-bold hover:bg-gray-100 transition-all"
                          >
                            입체 그림자 추가
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">SIZE</label>
                          <input
                            type="number" step="0.5"
                            value={Number((selectedBlock.fontSize || 14).toFixed(1))}
                            onChange={(e) => updateTextBlockContent(selectedBlock.id, { fontSize: Number(e.target.value) })}
                            className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">TEXT COLOR</label>
                          <div className="flex gap-2 items-center h-10 bg-gray-50 rounded-xl px-2 shadow-sm">
                            <input
                              type="color" value={selectedBlock.colorHex || '#000000'}
                              onChange={(e) => updateTextBlockContent(selectedBlock.id, { colorHex: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                            />
                            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">{selectedBlock.colorHex || '#000000'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-indigo-500 uppercase">STROKE WIDTH (테두리)</label>
                          <input
                            type="number" step="0.5" min="0" max="10"
                            value={selectedBlock.strokeWidth || 0}
                            onChange={(e) => updateTextBlockContent(selectedBlock.id, { strokeWidth: Number(e.target.value) })}
                            className="w-full p-2.5 bg-indigo-50/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-indigo-500 uppercase">STROKE COLOR</label>
                          <div className="flex gap-2 items-center h-10 bg-indigo-50/50 rounded-xl px-2 shadow-sm">
                            <input
                              type="color" value={selectedBlock.strokeColor || '#000000'}
                              onChange={(e) => updateTextBlockContent(selectedBlock.id, { strokeColor: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                            />
                            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">{selectedBlock.strokeColor || '#000000'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">OPACITY (투명도)</label>
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
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">줄 간격 (Line Height)</label>
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
                          <label className="block text-[10px] font-bold text-gray-400 uppercase">회전 (Rotation)</label>
                          <span className="text-[10px] font-bold text-blue-600">{Math.round(selectedBlock.rotation || 0)}°</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input type="range" min="-180" max="180" step="1" value={selectedBlock.rotation || 0} onChange={(e) => updateTextBlockContent(selectedBlock.id, { rotation: parseFloat(e.target.value) })} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                          <button onClick={() => updateTextBlockContent(selectedBlock.id, { rotation: 0 })} className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500 hover:bg-gray-200">초기화</button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">글꼴 (Font Family)</label>
                        <select value={selectedBlock.fontFamily || "sans-serif"} onChange={(e) => updateTextBlockContent(selectedBlock.id, { fontFamily: e.target.value })} className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                          <optgroup label="디자인 / 제목체 (Bold & Trendy)">
                            <option value="'Bagel Fat One', cursive">베이글팻원 (인기 1위!) ⭐</option>
                            <option value="'Black Han Sans', sans-serif">블랙한산스 (강렬한 임팩트)</option>
                            <option value="'Do Hyeon', sans-serif">도현체 (꽉 찬 제목)</option>
                            <option value="'Sunflower', sans-serif">해바라기 (세련된 제목) 🎉</option>
                            <option value="'Noto Sans KR', sans-serif">Noto Sans KR (깔끔한 고딕)</option>
                          </optgroup>
                          <optgroup label="명조 / 감성체 (Classic & Elegant)">
                            <option value="'Gowun Batang', serif">고운바탕 (따뜻한 명조)</option>
                            <option value="'Yeon Sung', serif">연성체 (정갈한 옛날 감성) 📜</option>
                            <option value="'Song Myung', serif">송명체 (클래식 붓글씨) 🖋️</option>
                            <option value="'Nanum Myeongjo', serif">나눔명조 (정중한)</option>
                            <option value="'Gowun Dodum', sans-serif">고운돋움 (부드러운 본문)</option>
                          </optgroup>
                          <optgroup label="손글씨 / 아트체 (Artistic & Handwritten)">
                            <option value="'Nanum Pen Script', cursive">나눔손글씨 (감성 손맛)</option>
                            <option value="'Gaegu', cursive">개구체 (위트있는 손서) 🎈</option>
                            <option value="'Poor Story', cursive">푸버스토리 (따뜻한 손길) ✨</option>
                            <option value="'Single Day', cursive">싱글데이 (경쾌한 글씨)</option>
                            <option value="'Gamja Flower', cursive">감자꽃체 (자연스러운 손길)</option>
                            <option value="'Black And White Picture', sans-serif">검정고무신 (빈티지 감성) 📺</option>
                            <option value="'Dongle', sans-serif">동글체 (트렌디 귀여움)</option>
                            <option value="'Jua', sans-serif">주아체 (배달 스타일)</option>
                            <option value="sans-serif">Pretendard (기본 고딕)</option>
                          </optgroup>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">정렬 및 레이어 정렬</label>
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

            <div className={`border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${expandedSections.includes('branding') ? 'ring-2 ring-indigo-50 border-indigo-100' : ''}`}>
              <button
                onClick={() => toggleSection('branding')}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Store size={16} className={expandedSections.includes('branding') ? 'text-indigo-500' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-700">상점 브랜딩 자동 배치</span>
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
                        <p className="text-xs font-bold text-gray-800 truncate">{shopSettings.name || '상점 정보 없음'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{shopSettings.tel || '연락처 없음'}</p>
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

          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400">v3.2 Professional AI</span>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">System Ready</span>
            </div>
          </div>
        </aside>

        <div className="flex-1 w-full flex flex-col items-center pt-2 overflow-auto bg-neutral-100/30">
          <EditorCanvas />
        </div>

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
              const workspaceWidth = window.innerWidth - 320 - 80;
              const fitZoom = (workspaceWidth / currentDimension.widthMm);
              setZoom(Math.max(1, Math.min(6, fitZoom)));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold text-gray-500 transition"
          >
            <Search size={14} /> 화면 맞춤
          </button>
        </div>
      </div>

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Save className="text-indigo-600" size={20} /> 디자인 저장
              </h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">현재 디자인을 어떤 카테고리에 저장하시겠습니까?</p>
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
                    await saveDesign();
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

      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Layers className="text-emerald-600" /> 디자인 보관함 & 템플릿
              </h3>
              <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <aside className="w-56 bg-gray-50/50 border-r border-gray-100 p-4 shrink-0 overflow-y-auto">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">테마 카테고리</label>
                <div className="flex flex-col gap-1">
                  {GALLERY_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveGalleryTab(category.id)}
                      className={`px-4 py-3 text-left text-sm font-bold rounded-xl transition-all ${activeGalleryTab === category.id ? 'bg-white shadow-md text-emerald-600 border border-emerald-100' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
                    >
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </aside>
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                {activeGalleryTab === 'my_designs' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {savedDesigns.length === 0 ? (
                      <div className="col-span-full py-20 text-center text-gray-400">저장된 디자인이 없습니다.</div>
                    ) : (
                      savedDesigns.map((design) => (
                        <div key={design.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative" onClick={() => { loadDesign(design.id); setIsGalleryOpen(false); }}>
                          <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                            {design.background_url ? <img src={design.background_url} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="text-xs text-gray-300">내용 없음</div>}
                          </div>
                          <div className="p-4 bg-white">
                            <div className="text-xs text-gray-400 mb-1">{new Date(design.created_at).toLocaleDateString()}</div>
                            <div className="text-sm font-bold text-gray-700 truncate">{design.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {FREE_TEMPLATES[activeGalleryTab]?.map((url, index) => (
                      <div key={index} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative" onClick={() => loadTemplate(url, activeGalleryTab)}>
                        <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden">
                          <img src={url} alt={`Template ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md font-bold">적용하기</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuggestionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {activeSuggestionType === 'quote' ? <><Sparkles className="text-emerald-600" /> 명언 라이브러리</> : <><MessageSquareText className="text-blue-600" /> 추천 메시지</>}
                </h3>
              </div>
              <button onClick={() => setIsSuggestionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <aside className="w-56 bg-gray-50/50 border-r border-gray-100 p-4 shrink-0 overflow-y-auto">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">카테고리</label>
                <div className="flex flex-col gap-1">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button key={key} onClick={() => setSelectedCategory(key)} className={`px-4 py-2.5 text-left text-sm font-bold rounded-xl transition-all ${selectedCategory === key ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}>{label}</button>
                  ))}
                </div>
              </aside>
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-50 flex justify-end">
                  <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button onClick={() => setSelectedLang('ko')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${selectedLang === 'ko' ? 'bg-white text-blue-600' : 'text-gray-500'}`}>한국어</button>
                    <button onClick={() => setSelectedLang('en')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${selectedLang === 'en' ? 'bg-white text-blue-600' : 'text-gray-500'}`}>English</button>
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
                          const isLabel = selectedPresetId.startsWith('formtec-');

                          if (activeSuggestionType === 'quote') {
                            if (isFolding) {
                              if (isLandscape) {
                                startX = (margins.left + (currentDimension.widthMm / 2)) / 2;
                                width = (currentDimension.widthMm / 2) - (margins.left + margins.right);
                              } else {
                                startY = (margins.top + (currentDimension.heightMm / 2)) / 2;
                              }
                            }
                            if (suggestedQuoteBlockId) removeTextBlock(suggestedQuoteBlockId);
                            const id = addTextBlock({
                              text: suggestion.content + (suggestion.author ? `\n\n- ${suggestion.author} -` : ''),
                              x: startX, y: startY, fontSize: 16, textAlign: 'center', colorHex: '#ffffff', strokeWidth: 0.5, strokeColor: '#000000',
                              fontFamily: "'Nanum Pen Script', cursive", opacity: 0.8, width: width, lineHeight: 1.6
                            });
                            setSuggestedQuoteBlockId(id);
                            if (!isLabel) setActivePage('inside');
                            else setSelectedBlockId(id);
                          } else {
                            if (isFolding) {
                              if (isLandscape) {
                                startX = ((currentDimension.widthMm / 2) + (currentDimension.widthMm - margins.right)) / 2;
                                width = (currentDimension.widthMm / 2) - (margins.left + margins.right);
                              } else {
                                startY = ((currentDimension.heightMm / 2) + (currentDimension.heightMm - margins.bottom)) / 2;
                              }
                            }
                            if (suggestedMessageBlockId) removeTextBlock(suggestedMessageBlockId);
                            const id = addTextBlock({
                              text: suggestion.content,
                              x: startX, y: startY, fontSize: 20, textAlign: 'center', colorHex: '#ffffff', strokeWidth: 0.5, strokeColor: '#000000',
                              fontFamily: "'Nanum Pen Script', cursive", opacity: 1.0, width: width, lineHeight: 1.6
                            });
                            setSuggestedMessageBlockId(id);
                            if (!isLabel) setActivePage('inside');
                            else setSelectedBlockId(id);
                          }
                          setIsSuggestionModalOpen(false);
                        }}
                        className={`p-6 text-left border border-gray-100 rounded-2xl transition-all bg-white group hover:shadow-xl ${activeSuggestionType === 'quote' ? 'hover:border-emerald-500' : 'hover:border-blue-500'}`}
                      >
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{suggestion.content}</p>
                        {suggestion.author && <p className="text-xs text-gray-400 mt-4 text-right">― {suggestion.author}</p>}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isShopSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200"><Store size={24} className="text-white" /></div>
                <div><h3 className="text-xl font-bold text-gray-800">상점 브랜딩 설정</h3></div>
              </div>
              <button onClick={() => setIsShopSettingsOpen(false)} className="p-2 hover:bg-white/80 rounded-full transition shadow-sm bg-white"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">브랜드 로고</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                    {shopSettings.logoUrl ? <img src={shopSettings.logoUrl} className="w-full h-full object-contain p-2" alt="Logo" /> : <ImageIcon size={32} className="text-gray-200" />}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-gray-700">로고 이미지 업로드</p>
                    <p className="text-xs text-gray-400">배경 없는 투명 PNG 권장</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600" />
                  <input type="text" placeholder="매장 이름" value={shopSettings.name} onChange={(e) => updateShopSettings({ name: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="relative group">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600" />
                  <input type="text" placeholder="매장 연락처" value={shopSettings.tel} onChange={(e) => updateShopSettings({ tel: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="relative group">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600" />
                  <input type="text" placeholder="매장 주소" value={shopSettings.address} onChange={(e) => updateShopSettings({ address: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex gap-3">
              <button onClick={() => setIsShopSettingsOpen(false)} className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold shadow-sm transition">닫기</button>
              <button onClick={() => setIsShopSettingsOpen(false)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg transition">설정 저장하기</button>
            </div>
          </div>
        </div>
      )}

      {isAiWizardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAiWizardOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
              <button onClick={() => setIsAiWizardOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              <div className="flex items-center gap-3 mb-2"><Sparkles className="animate-pulse" size={24} /><h2 className="text-2xl font-black">AI 스마트 디자인</h2></div>
              <p className="text-white/80 text-sm font-medium">단 한 번의 터치로 표지 이미지를 생성합니다.</p>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {aiStep === 'input' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">스타일 테마</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'romantic', label: '💕 로맨틱', color: 'border-pink-50 text-pink-700' },
                        { id: 'modern', label: '🏢 모던/심플', color: 'border-slate-50 text-slate-700' },
                        { id: 'luxury', label: '💎 럭셔리', color: 'border-amber-50 text-amber-700' },
                        { id: 'cute', label: '🧸 귀여운/3D', color: 'border-yellow-50 text-yellow-700' },
                        { id: 'retro', label: '📻 레트로', color: 'border-orange-50 text-orange-700' },
                        { id: 'artistic', label: '🎨 예술적 異상', color: 'border-purple-50 text-purple-700' }
                      ].map(t => (
                        <button key={t.id} onClick={() => setActiveAiThemeTab(activeAiThemeTab === t.id ? null : t.id)} className={`p-3 rounded-xl border text-sm font-bold transition-all ${activeAiThemeTab === t.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 ' + t.color}`}>{t.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <textarea value={aiThemePrompt} onChange={e => setAiThemePrompt(e.target.value)} placeholder="예) 수채화 풍의 장미 정원" className="w-full p-4 border border-gray-200 rounded-2xl text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <button onClick={() => handleAISmartDesign()} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-lg">AI 디자인 시작하기</button>
                </div>
              )}
              {aiStep === 'complete' && aiGeneratedImages.length > 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {aiGeneratedImages.map((img, idx) => (
                      <div key={idx} onClick={() => foldType === 'half' ? setFrontBackgroundUrl(img.url) : setBackgroundUrl(img.url)} className={`relative cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${((foldType === 'half' ? frontBackgroundUrl === img.url : backgroundUrl === img.url)) ? 'border-indigo-600 scale-105' : 'border-transparent opacity-80'}`}>
                        <img src={img.url} alt="AI" className="w-full aspect-square object-cover" />
                        {((foldType === 'half' ? frontBackgroundUrl === img.url : backgroundUrl === img.url)) && <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg"><CheckCircle2 size={14} /></div>}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <button onClick={() => setAiStep('input')} className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm">다시 설정</button>
                    <button onClick={() => setIsAiWizardOpen(false)} className="bg-black text-white py-4 rounded-2xl font-black text-sm">완료 및 편집</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isFormtecMode && (
        <FormtecModal
          isOpen={isFormtecMode} onClose={() => setIsFormtecMode(false)} config={LABEL_CONFIGS[formtecLabelType]} formtecLabelType={formtecLabelType} formtecSelectedCells={formtecSelectedCells}
          setFormtecSelectedCells={setFormtecSelectedCells} formtecMessage={formtecMessage} setFormtecMessage={setFormtecMessage} formtecFontSize={formtecFontSize} setFormtecFontSize={setFormtecFontSize}
          formtecIsBold={formtecIsBold} setFormtecIsBold={setFormtecIsBold} formtecTextAlign={formtecTextAlign} setFormtecTextAlign={setFormtecTextAlign} formtecBgColor={formtecBgColor}
          setFormtecBgColor={setFormtecBgColor} formtecTextColor={formtecTextColor} setFormtecTextColor={setFormtecTextColor} onPrint={handleFormtecPrint} isGenerating={isGenerating} setIsGenerating={setIsGenerating}
        />
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative"><div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" /><Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={32} /></div>
          <p className="mt-6 text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent animate-pulse">AI 아티스트가 멋진 디자인을 생성하고 있습니다...</p>
        </div>
      )}
    </main>
  );
}

function FormtecModal({ isOpen, onClose, config, formtecLabelType, formtecSelectedCells, setFormtecSelectedCells, formtecMessage, setFormtecMessage, formtecFontSize, setFormtecFontSize, formtecIsBold, setFormtecIsBold, formtecTextAlign, setFormtecTextAlign, formtecBgColor, setFormtecBgColor, formtecTextColor, setFormtecTextColor, onPrint, isGenerating, setIsGenerating }: any) {
  if (!isOpen) return null;
  const rows = config ? Math.ceil(config.cells / config.cols) : 1;
  const cols = config ? config.cols : 1;
  const totalCells = config ? config.cells : 1;
  const toggleCell = (idx: number) => setFormtecSelectedCells((prev: any) => prev.includes(idx) ? prev.filter((c: any) => c !== idx) : [...prev, idx]);
  const selectAll = () => setFormtecSelectedCells(Array.from({ length: totalCells }, (_, i) => i));
  const clearAll = () => setFormtecSelectedCells([]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">라벨지 인쇄 설정</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={24} className="text-gray-400" /></button>
          </div>
          <p className="text-xs text-gray-500 mt-1">인쇄할 위치를 선택하고 메시지를 입력해 주세요.</p>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600">인쇄 위치 선택 <span className="text-emerald-600">({formtecSelectedCells.length}/{totalCells})</span></label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold">전체 선택</button>
                <button onClick={clearAll} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-500 rounded-md font-bold">전체 해제</button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
              <div className="bg-white rounded-lg border border-gray-300 mx-auto shadow-sm overflow-hidden" style={{ aspectRatio: '210/297', maxHeight: '300px' }}>
                <div className="grid h-full w-full p-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: '2px' }}>
                  {Array.from({ length: totalCells }).map((_, idx) => (
                    <div key={idx} onClick={() => toggleCell(idx)} className={`border border-dashed transition-all cursor-pointer flex items-center justify-center text-[8px] font-bold ${formtecSelectedCells.includes(idx) ? 'bg-emerald-500 border-emerald-600 text-white shadow-inner scale-95' : 'bg-gray-50 border-gray-200 text-gray-300 hover:bg-gray-100'}`}>{idx + 1}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-600">추가 메시지</label>
            <textarea value={formtecMessage} onChange={(e) => setFormtecMessage(e.target.value)} placeholder="캔버스 내용 외에 추가로 출력할 메시지를 입력하세요." className="w-full p-3 bg-gray-50 border-none rounded-2xl text-sm min-h-[80px] focus:ring-2 focus:ring-emerald-500 shadow-inner" />
          </div>
        </div>
        <div className="p-5 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold transition">취소</button>
          <button onClick={onPrint} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg transition">라벨 인쇄 시작</button>
        </div>
      </div>
    </div>
  );
}
