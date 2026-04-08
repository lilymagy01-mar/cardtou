import { create } from 'zustand';

export interface TextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  colorHex: string;
  fontFamily?: string;
}

export interface Dimension {
  widthMm: number;
  heightMm: number;
}

interface EditorState {
  currentDimension: Dimension;
  backgroundUrl: string | null;
  textBlocks: TextBlock[];
  selectedBlockId: string | null;
  
  // Actions
  setDimension: (dimension: Dimension) => void;
  setBackgroundUrl: (url: string | null) => void;
  addTextBlock: (block: Omit<TextBlock, 'id'>) => void;
  updateTextBlockPosition: (id: string, x: number, y: number) => void;
  updateTextBlockContent: (id: string, updates: Partial<TextBlock>) => void;
  removeTextBlock: (id: string) => void;
  setSelectedBlockId: (id: string | null) => void;
  saveDesign: () => void;
  loadDesign: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // 기본 A5(또는 105mm x 148mm 등) 카드 사이즈 기본값
  currentDimension: { widthMm: 105, heightMm: 148 },
  backgroundUrl: null,
  textBlocks: [],
  selectedBlockId: null,

  setDimension: (dimension) => set({ currentDimension: dimension }),
  
  setBackgroundUrl: (url) => set({ backgroundUrl: url }),
  
  addTextBlock: (block) => {
    const newId = `text-${Date.now()}`;
    set((state) => ({
      textBlocks: [...state.textBlocks, { ...block, id: newId }],
      selectedBlockId: newId,
    }));
  },

  updateTextBlockPosition: (id, x, y) => set((state) => ({
    textBlocks: state.textBlocks.map(b => 
      b.id === id ? { ...b, x, y } : b
    )
  })),

  updateTextBlockContent: (id, updates) => set((state) => ({
    textBlocks: state.textBlocks.map(b =>
      b.id === id ? { ...b, ...updates } : b
    )
  })),

  removeTextBlock: (id) => set((state) => ({
    textBlocks: state.textBlocks.filter(b => b.id !== id),
    selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
  })),

  setSelectedBlockId: (id) => set({ selectedBlockId: id }),

  saveDesign: () => {
    const state = useEditorStore.getState();
    const data = {
      currentDimension: state.currentDimension,
      backgroundUrl: state.backgroundUrl,
      textBlocks: state.textBlocks
    };
    localStorage.setItem('cardtou_design', JSON.stringify(data));
    alert('디자인이 브라우저에 임시 저장되었습니다.');
  },

  loadDesign: () => {
    const saved = localStorage.getItem('cardtou_design');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        set({
          currentDimension: parsed.currentDimension || { widthMm: 105, heightMm: 148 },
          backgroundUrl: parsed.backgroundUrl || null,
          textBlocks: parsed.textBlocks || [],
          selectedBlockId: null
        });
        alert('저장된 디자인을 불러왔습니다.');
      } catch (e) {
        console.error('Failed to load design:', e);
      }
    } else {
      alert('저장된 디자인이 없습니다.');
    }
  }
}));
