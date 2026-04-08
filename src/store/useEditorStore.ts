import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
export interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  colorHex: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  zIndex?: number;
  opacity?: number;
  isLocked?: boolean;
  width?: number; // 가로 너비 (mm)
  lineHeight?: number; // 줄 간격 (기본 1.0)
  rotation?: number; // 회전 (도)
}

export interface ImageBlock {
  id: string;
  url: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  isPrintable: boolean;
  zIndex?: number;
  rotation?: number; // 회전 (도)
}

export interface Dimension {
  widthMm: number;
  heightMm: number;
}

export type Orientation = 'landscape' | 'portrait';
export type FoldType = 'none' | 'half'; // none: Flat, half: Folding

export interface PageData {
  backgroundUrl: string | null;
  frontBackgroundUrl?: string | null;
  backBackgroundUrl?: string | null;
  textBlocks: TextBlock[];
  imageBlocks: ImageBlock[];
  margins?: { top: number; right: number; bottom: number; left: number };
}

export interface ShopSettings {
  name: string;
  tel: string;
  address: string;
  sns: string;
  logoUrl: string | null;
}

interface EditorState {
  currentDimension: Dimension;
  selectedPresetId: string; // 추가: 현재 선택된 용지 규격 ID
  orientation: Orientation;
  foldType: FoldType;
  
  // Current active page data (for easier access by components)
  activePage: 'outside' | 'inside';
  backgroundUrl: string | null;
  frontBackgroundUrl: string | null;
  backBackgroundUrl: string | null;
  textBlocks: TextBlock[];
  imageBlocks: ImageBlock[];
  margins: { top: number; right: number; bottom: number; left: number };
  
  // Full pages data
  pages: {
    outside: PageData;
    inside: PageData;
  };
  
  selectedBlockId: string | null;
  designId: string | null;
  showFoldingGuide: boolean;
  
  // New: Recipient and Sender info
  recipientName: string;
  senderName: string;
  showToField: boolean;
  showFromField: boolean;
  toBlockId: string | null;
  fromBlockId: string | null;
  suggestedMessageBlockId: string | null;
  suggestedQuoteBlockId: string | null;
  zoom: number;

  shopSettings: ShopSettings;

  // Actions
  setZoom: (zoom: number) => void;
  setRecipientName: (name: string) => void;
  setSenderName: (name: string) => void;
  setShowToField: (show: boolean) => void;
  setShowFromField: (show: boolean) => void;
  setToBlockId: (id: string | null) => void;
  setFromBlockId: (id: string | null) => void;
  setSuggestedMessageBlockId: (id: string | null) => void;
  setSuggestedQuoteBlockId: (id: string | null) => void;
  setActivePage: (page: 'outside' | 'inside') => void;
  setDimension: (dimension: Dimension, presetId: string) => void;
  setOrientation: (orientation: Orientation) => void;
  setFoldType: (foldType: FoldType) => void;
  setBackgroundUrl: (url: string | null) => void;
  setFrontBackgroundUrl: (url: string | null) => void;
  setBackBackgroundUrl: (url: string | null) => void;
  setMargins: (margins: { top: number; right: number; bottom: number; left: number }) => void;
  addTextBlock: (block: Omit<TextBlock, 'id'>) => string;
  updateTextBlockPosition: (id: string, x: number, y: number) => void;
  updateTextBlockContent: (id: string, updates: Partial<TextBlock>) => void;
  removeTextBlock: (id: string) => void;
  
  addImageBlock: (block: Omit<ImageBlock, 'id'>) => string;
  updateImageBlockPosition: (id: string, x: number, y: number) => void;
  updateImageBlockContent: (id: string, updates: Partial<ImageBlock>) => void;
  removeImageBlock: (id: string) => void;
  
  setSelectedBlockId: (id: string | null) => void;
  saveDesign: () => Promise<void>;
  loadDesign: (id?: string) => Promise<void>;
  listDesigns: () => Promise<any[]>;
  setDesignId: (id: string | null) => void;
  toggleFoldingGuide: () => void;

  updateShopSettings: (updates: Partial<ShopSettings>) => void;
  applyShopBranding: (target: 'front' | 'back') => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // 기본 카드 형태: 가로형 폴딩 (A5 Landscape: 210x148mm)
  currentDimension: { widthMm: 210, heightMm: 148 },
  selectedPresetId: 'a5',
  orientation: 'landscape',
  foldType: 'half',
  
  activePage: 'outside',
  backgroundUrl: null,
  frontBackgroundUrl: null,
  backBackgroundUrl: null,
  textBlocks: [],
  imageBlocks: [],
  margins: { top: 10, right: 10, bottom: 10, left: 10 },
  pages: {
    outside: { 
      backgroundUrl: null, 
      frontBackgroundUrl: null, 
      backBackgroundUrl: null, 
      textBlocks: [], 
      imageBlocks: [],
      margins: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    inside: { 
      backgroundUrl: null, 
      frontBackgroundUrl: null, 
      backBackgroundUrl: null, 
      textBlocks: [], 
      imageBlocks: [],
      margins: { top: 10, right: 10, bottom: 10, left: 10 }
    }
  },
  
  shopSettings: {
    name: '',
    tel: '',
    address: '',
    sns: '',
    logoUrl: null
  },

  selectedBlockId: null,
  designId: null,
  showFoldingGuide: true,
  
  recipientName: '받는 분',
  senderName: '보내는 분',
  showToField: false,
  showFromField: false,
  toBlockId: null,
  fromBlockId: null,
  suggestedMessageBlockId: null,
  suggestedQuoteBlockId: null,
  zoom: 3.0,

  setZoom: (zoom) => set({ zoom }),

  setActivePage: (page) => {
    const state = get();
    if (state.activePage === page) return;

    // 현재 페이지 데이터를 pages 객체에 저장
    const currentData: PageData = {
      backgroundUrl: state.backgroundUrl,
      frontBackgroundUrl: state.frontBackgroundUrl,
      backBackgroundUrl: state.backBackgroundUrl,
      textBlocks: state.textBlocks,
      imageBlocks: state.imageBlocks,
      margins: state.margins
    };

    const updatedPages = {
      ...state.pages,
      [state.activePage]: currentData
    };

    // 목적지 페이지 데이터를 현재 상태로 로드
    const targetData = updatedPages[page];

    set({
      activePage: page,
      pages: updatedPages,
      backgroundUrl: targetData.backgroundUrl || null,
      frontBackgroundUrl: targetData.frontBackgroundUrl || null,
      backBackgroundUrl: targetData.backBackgroundUrl || null,
      textBlocks: targetData.textBlocks,
      imageBlocks: targetData.imageBlocks,
      margins: targetData.margins || { top: 10, right: 10, bottom: 10, left: 10 },
      selectedBlockId: null // 페이지 전환 시 선택 해제
    });
  },

  toggleFoldingGuide: () => set((state) => ({ showFoldingGuide: !state.showFoldingGuide })),
  setDesignId: (id) => set({ designId: id }),
  setDimension: (dimension, presetId) => set((state) => {
    const scaleX = dimension.widthMm / state.currentDimension.widthMm;
    const scaleY = dimension.heightMm / state.currentDimension.heightMm;
    const scaleFont = Math.min(scaleX, scaleY);

    const isLandscape = dimension.widthMm > dimension.heightMm;

    const scaleTextBlocks = (blocks: TextBlock[]) => blocks.map(b => {
      let rotation = b.rotation || 0;
      if (isLandscape && rotation === 180) rotation = 0;
      return {
        ...b,
        x: b.x * scaleX,
        y: b.y * scaleY,
        width: b.width ? b.width * scaleX : undefined,
        fontSize: b.fontSize * scaleFont,
        rotation
      };
    });

    const scaleImageBlocks = (blocks: ImageBlock[]) => blocks.map(b => {
      let rotation = b.rotation || 0;
      if (isLandscape && rotation === 180) rotation = 0;
      return {
        ...b,
        x: b.x * scaleX,
        y: b.y * scaleY,
        width: b.width * scaleX,
        height: b.height * scaleY,
        rotation
      };
    });

    const updatedPages = {
      outside: {
        ...state.pages.outside,
        textBlocks: scaleTextBlocks(state.pages.outside.textBlocks),
        imageBlocks: scaleImageBlocks(state.pages.outside.imageBlocks)
      },
      inside: {
        ...state.pages.inside,
        textBlocks: scaleTextBlocks(state.pages.inside.textBlocks),
        imageBlocks: scaleImageBlocks(state.pages.inside.imageBlocks)
      }
    };

    return { 
      currentDimension: dimension, 
      selectedPresetId: presetId,
      textBlocks: scaleTextBlocks(state.textBlocks),
      imageBlocks: scaleImageBlocks(state.imageBlocks),
      pages: updatedPages
    };
  }),
  
  setOrientation: (orientation) => set((state) => {
    const { widthMm, heightMm } = state.currentDimension;
    const isCurrentlyLandscape = widthMm > heightMm;
    const wantLandscape = orientation === 'landscape';
    
    if (isCurrentlyLandscape === wantLandscape) return { orientation };

    const newDimension = { widthMm: heightMm, heightMm: widthMm };
    
    const scaleX = newDimension.widthMm / widthMm;
    const scaleY = newDimension.heightMm / heightMm;
    const scaleFont = Math.min(scaleX, scaleY);

    const scaleTextBlocks = (blocks: TextBlock[]) => blocks.map(b => {
      let rotation = b.rotation || 0;
      if (wantLandscape && rotation === 180) rotation = 0;
      return {
        ...b,
        x: b.x * scaleX,
        y: b.y * scaleY,
        width: b.width ? b.width * scaleX : undefined,
        fontSize: b.fontSize * scaleFont,
        rotation
      };
    });

    const scaleImageBlocks = (blocks: ImageBlock[]) => blocks.map(b => {
      let rotation = b.rotation || 0;
      if (wantLandscape && rotation === 180) rotation = 0;
      return {
        ...b,
        x: b.x * scaleX,
        y: b.y * scaleY,
        width: b.width * scaleX,
        height: b.height * scaleY,
        rotation
      };
    });

    const updatedPages = {
      outside: {
        ...state.pages.outside,
        textBlocks: scaleTextBlocks(state.pages.outside.textBlocks),
        imageBlocks: scaleImageBlocks(state.pages.outside.imageBlocks)
      },
      inside: {
        ...state.pages.inside,
        textBlocks: scaleTextBlocks(state.pages.inside.textBlocks),
        imageBlocks: scaleImageBlocks(state.pages.inside.imageBlocks)
      }
    };

    return { 
      orientation, 
      currentDimension: newDimension,
      textBlocks: scaleTextBlocks(state.textBlocks),
      imageBlocks: scaleImageBlocks(state.imageBlocks),
      pages: updatedPages
    };
  }),

  setFoldType: (foldType) => set({ foldType }),
  setRecipientName: (name) => set({ recipientName: name }),
  setSenderName: (name) => set({ senderName: name }),
  setShowToField: (show) => set({ showToField: show }),
  setShowFromField: (show) => set({ showFromField: show }),
  setToBlockId: (id) => set({ toBlockId: id }),
  setFromBlockId: (id) => set({ fromBlockId: id }),
  setSuggestedMessageBlockId: (id) => set({ suggestedMessageBlockId: id }),
  setSuggestedQuoteBlockId: (id) => set({ suggestedQuoteBlockId: id }),
  
  setBackgroundUrl: (url) => set({ backgroundUrl: url }),
  setFrontBackgroundUrl: (url) => set({ frontBackgroundUrl: url }),
  setBackBackgroundUrl: (url) => set({ backBackgroundUrl: url }),
  setMargins: (margins) => set({ margins }),
  
  addTextBlock: (block) => {
    const newId = `text-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    set((state) => {
      let rotation = block.rotation || 0;
      if (state.orientation === 'landscape' && rotation === 180) {
        rotation = 0;
      }
      return {
        textBlocks: [...state.textBlocks, { ...block, id: newId, rotation }],
        selectedBlockId: newId,
      };
    });
    return newId;
  },

  updateTextBlockPosition: (id, x, y) => set((state) => {
    const { margins, currentDimension, suggestedQuoteBlockId, suggestedMessageBlockId, foldType } = state;
    const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
    const block = state.textBlocks.find(b => b.id === id);
    if (!block) return {};
    
    let finalX = x;
    let finalY = y;
    const blockWidth = block.width || 0;

    // --- Clamping Logic ---
    let minX = margins.left;
    let maxX = currentDimension.widthMm - margins.right;
    let minY = margins.top;
    let maxY = currentDimension.heightMm - margins.bottom;

    // 접지선 고려 (Half Fold)
    if (foldType === 'half') {
      if (isLandscape) {
        // 가로형: 좌측/우측 구분
        const midX = currentDimension.widthMm / 2;
        if (x < midX) {
          maxX = midX - 2; // 접지선에서 2mm 여유
        } else {
          minX = midX + 2;
        }
      } else {
        // 세로형: 상단/하단 구분
        const midY = currentDimension.heightMm / 2;
        if (y < midY) {
          maxY = midY - 2;
        } else {
          minY = midY + 2;
        }
      }
    }

    // 텍스트 블록의 너비(width)를 고려한 X축 클램핑 (Center anchored)
    // x는 중심점이므로, x - width/2 >= minX, x + width/2 <= maxX
    const halfWidth = blockWidth / 2;
    const safeMinX = minX + halfWidth;
    const safeMaxX = maxX - halfWidth;
    
    // 안전 위계: 만약 블록 너비가 가용 영역보다 넓으면 영역 중앙에 강제 배치
    if (safeMinX > safeMaxX) {
      finalX = (minX + maxX) / 2;
    } else {
      finalX = Math.max(safeMinX, Math.min(x, safeMaxX));
    }

    // Y축 클램핑 (대략적인 높이 보정 - 텍스트는 높이를 알 수 없으므로 중심점 기준)
    finalY = Math.max(minY, Math.min(y, maxY));

    // --- 특수 블록 고정 위치 처리 (AI 테마/추천문구) ---
    if (id === suggestedQuoteBlockId) {
      if (foldType === 'half') {
        if (isLandscape) {
          finalX = (margins.left + (currentDimension.widthMm / 2)) / 2;
        } else {
          finalX = currentDimension.widthMm / 2;
          finalY = (margins.top + (currentDimension.heightMm / 2)) / 2;
        }
      } else {
        finalX = currentDimension.widthMm / 2;
      }
    } else if (id === suggestedMessageBlockId) {
      if (foldType === 'half') {
        if (isLandscape) {
          finalX = ((currentDimension.widthMm / 2) + (currentDimension.widthMm - margins.right)) / 2;
        } else {
          finalX = currentDimension.widthMm / 2;
          finalY = ((currentDimension.heightMm / 2) + (currentDimension.heightMm - margins.bottom)) / 2;
        }
      } else {
        finalX = currentDimension.widthMm / 2;
      }
    }

    const midY = currentDimension.heightMm / 2;
    
    return {
      textBlocks: state.textBlocks.map(b => {
        if (b.id !== id) return b;
        
        let rotation = b.rotation || 0;
        // 접지 카드(세로형) 뒷면의 경우 상단 영역은 인쇄 방향을 위해 180도 회전
        if (state.activePage === 'outside' && foldType === 'half') {
          if (!isLandscape) {
            rotation = finalY < midY ? 180 : 0;
          } else {
            // 가로형에서는 뒤집힘 방지 (0도로 초기화)
            if (rotation === 180) rotation = 0;
          }
        }
        
        return { ...b, x: finalX, y: finalY, rotation };
      })
    };
  }),

  updateTextBlockContent: (id, updates) => set((state) => ({
    textBlocks: state.textBlocks.map(b =>
      b.id === id ? { ...b, ...updates } : b
    )
  })),

  removeTextBlock: (id) => set((state) => ({
    textBlocks: state.textBlocks.filter(b => b.id !== id),
    selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
    // 특수 블록 ID 초기화
    toBlockId: state.toBlockId === id ? null : state.toBlockId,
    fromBlockId: state.fromBlockId === id ? null : state.fromBlockId,
    suggestedMessageBlockId: state.suggestedMessageBlockId === id ? null : state.suggestedMessageBlockId,
    suggestedQuoteBlockId: state.suggestedQuoteBlockId === id ? null : state.suggestedQuoteBlockId
  })),

  addImageBlock: (block) => {
    const newId = `image-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    set((state) => {
      let rotation = block.rotation || 0;
      if (state.orientation === 'landscape' && rotation === 180) {
        rotation = 0;
      }
      return {
        imageBlocks: [...state.imageBlocks, { ...block, id: newId, rotation }],
        selectedBlockId: newId,
      };
    });
    return newId;
  },

  updateImageBlockPosition: (id, x, y) => set((state) => {
    const { margins, currentDimension, foldType } = state;
    const block = state.imageBlocks.find(b => b.id === id);
    if (!block) return {};

    const isLandscape = currentDimension.widthMm > currentDimension.heightMm;
    const blockWidth = block.width || 0;
    const blockHeight = block.height || 0;

    let minX = margins.left;
    let maxX = currentDimension.widthMm - margins.right;
    let minY = margins.top;
    let maxY = currentDimension.heightMm - margins.bottom;

    // 접지선 고려 (Half Fold)
    if (foldType === 'half') {
      if (isLandscape) {
        const midX = currentDimension.widthMm / 2;
        if (x + blockWidth / 2 < midX) {
          maxX = midX - 1;
        } else {
          minX = midX + 1;
        }
      } else {
        const midY = currentDimension.heightMm / 2;
        if (y + blockHeight / 2 < midY) {
          maxY = midY - 1;
        } else {
          minY = midY + 1;
        }
      }
    }

    const clampedX = Math.max(minX, Math.min(x, maxX - blockWidth));
    const clampedY = Math.max(minY, Math.min(y, maxY - blockHeight));

    const midY = currentDimension.heightMm / 2;

    return {
      imageBlocks: state.imageBlocks.map((b: ImageBlock) => {
        if (b.id !== id) return b;

        let rotation = b.rotation || 0;
        // 접지 카드(세로형) 뒷면의 경우 상단 영역은 인쇄 방향을 위해 180도 회전
        if (state.activePage === 'outside' && state.foldType === 'half') {
          if (!isLandscape) {
            rotation = clampedY < midY ? 180 : 0;
          } else {
            // 가로형에서는 뒤집힘 방지 (0도로 초기화)
            if (rotation === 180) rotation = 0;
          }
        }

        return { ...b, x: clampedX, y: clampedY, rotation };
      })
    };
  }),

  updateImageBlockContent: (id, updates) => set((state) => ({
    imageBlocks: state.imageBlocks.map((b: ImageBlock) =>
      b.id === id ? { ...b, ...updates } : b
    )
  })),

  removeImageBlock: (id) => set((state) => ({
    imageBlocks: state.imageBlocks.filter((b: ImageBlock) => b.id !== id),
    selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
  })),

  setSelectedBlockId: (id) => set({ selectedBlockId: id }),

  saveDesign: async () => {
    const state = get();
    
    // 현재 작업 중인 페이지 데이터를 pages에 최종 업데이트
    const updatedPages = {
      ...state.pages,
      [state.activePage]: {
        backgroundUrl: state.backgroundUrl,
        frontBackgroundUrl: state.frontBackgroundUrl,
        backBackgroundUrl: state.backBackgroundUrl,
        textBlocks: state.textBlocks,
        imageBlocks: state.imageBlocks,
        margins: state.margins
      }
    };

    const data = {
      dimension: state.currentDimension,
      orientation: state.orientation,
      fold_type: state.foldType,
      background_url: updatedPages.outside.backgroundUrl, // 하위 호환성용
      text_blocks: updatedPages.outside.textBlocks,      // 하위 호환성용
      image_blocks: updatedPages.outside.imageBlocks,    // 추가
      pages: updatedPages
    };

    if (state.designId) {
      const { error } = await supabase.from('card_designs').update(data).eq('id', state.designId);
      if (error) {
        alert('저장 실패: ' + error.message);
      } else {
        alert('성공적으로 클라우드에 업데이트되었습니다!');
      }
    } else {
      const { data: inserted, error } = await supabase.from('card_designs').insert(data).select().single();
      if (error) {
        alert('저장 실패: ' + error.message);
      } else if (inserted) {
        set({ designId: inserted.id });
        alert(`성공적으로 클라우드에 저장되었습니다! 디자인 ID: ${inserted.id}`);
      }
    }
  },

  listDesigns: async () => {
    const { data, error } = await supabase.from('card_designs').select('id, created_at, background_url').order('created_at', { ascending: false });
    if (error) {
      console.error('List error:', error);
      return [];
    }
    return data || [];
  },

  loadDesign: async (id) => {
    const promptId = id || prompt('불러올 디자인 ID (UUID)를 입력하세요:');
    if (!promptId) return;

    const { data, error } = await supabase.from('card_designs').select('*').eq('id', promptId).single();
    
    if (error || !data) {
      alert('디자인을 불러올 수 없습니다: ' + (error?.message || '조회 실패'));
      return;
    }

    const loadedPages = data.pages || {
      outside: { 
        backgroundUrl: data.background_url || null, 
        textBlocks: data.text_blocks || [], 
        imageBlocks: data.image_blocks || [] 
      },
      inside: { backgroundUrl: null, textBlocks: [], imageBlocks: [] }
    };

    const orientation = data.orientation || 'landscape';
    const isLandscape = orientation === 'landscape';

    const sanitizeBlocks = (blocks: any[]) => blocks.map(b => ({
      ...b,
      rotation: (isLandscape && b.rotation === 180) ? 0 : (b.rotation || 0)
    }));

    const sanitizedPages = {
      outside: {
        ...loadedPages.outside,
        textBlocks: sanitizeBlocks(loadedPages.outside.textBlocks),
        imageBlocks: sanitizeBlocks(loadedPages.outside.imageBlocks)
      },
      inside: {
        ...loadedPages.inside,
        textBlocks: sanitizeBlocks(loadedPages.inside.textBlocks),
        imageBlocks: sanitizeBlocks(loadedPages.inside.imageBlocks)
      }
    };

    set({
      designId: data.id,
      currentDimension: data.dimension || { widthMm: 210, heightMm: 148 },
      orientation: orientation,
      foldType: data.fold_type || 'half',
      activePage: 'outside',
      pages: sanitizedPages,
      backgroundUrl: sanitizedPages.outside.backgroundUrl,
      textBlocks: sanitizedPages.outside.textBlocks,
      imageBlocks: sanitizedPages.outside.imageBlocks,
      selectedBlockId: null
    });
  },

  updateShopSettings: (updates) => set((state) => ({
    shopSettings: { ...state.shopSettings, ...updates }
  })),

  applyShopBranding: (target) => {
    const { 
      shopSettings, 
      currentDimension, 
      orientation, 
      foldType,
      addTextBlock,
      addImageBlock,
      setActivePage 
    } = get();

    // 1. 페이지를 Outside로 변경
    setActivePage('outside');

    const isLandscape = orientation === 'landscape';
    const isFolding = foldType === 'half';
    const { widthMm, heightMm } = currentDimension;
    
    let baseX = widthMm / 2;
    let baseY = heightMm - 20;
    let rotation = 0;

    if (isFolding) {
      if (isLandscape) {
        // 가로형: 좌측(Back), 우측(Front)
        baseX = (target === 'front') ? (widthMm * 0.75) : (widthMm * 0.25);
        baseY = heightMm - 20;
        rotation = 0;
      } else {
        // 세로형: 상단(Back), 하단(Front)
        baseX = widthMm / 2;
        if (target === 'front') {
          baseY = heightMm * 0.75 + 10;
          rotation = 0;
        } else {
          baseY = heightMm * 0.25 - 10;
          rotation = 180; // 뒷면은 뒤집혀야 함
        }
      }
    } else {
      // 접지 없음 (단면/엽서 등)
      baseX = widthMm / 2;
      baseY = heightMm - 20;
      rotation = 0;
    }

    // 로고 추가 (있는 경우)
    if (shopSettings.logoUrl) {
      addImageBlock({
        url: shopSettings.logoUrl,
        x: baseX,
        y: baseY - 15, // 텍스트 위에 배치
        width: 30,
        height: 10,
        isPrintable: true,
        rotation
      });
    }

    // 샵 이름 추가
    if (shopSettings.name) {
      addTextBlock({
        text: shopSettings.name,
        x: baseX,
        y: baseY,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: "'Pretendard', sans-serif",
        colorHex: '#374151',
        rotation
      } as any);
    }

    // 상세 정보 추가
    const details = [shopSettings.tel, shopSettings.address, shopSettings.sns].filter(Boolean).join(' | ');
    if (details) {
      addTextBlock({
        text: details,
        x: baseX,
        y: baseY + 8,
        fontSize: 8,
        textAlign: 'center',
        fontFamily: "'Pretendard', sans-serif",
        colorHex: '#6b7280',
        rotation
      } as any);
    }
  }
}));
