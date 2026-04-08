'use client';

import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useEditorStore } from '@/store/useEditorStore';
import { DraggableText } from './DraggableText';
import { DraggableImage } from './DraggableImage';
import { Trash2 } from 'lucide-react';

export const EditorCanvas: React.FC = () => {
  const { 
    currentDimension, 
    textBlocks, 
    imageBlocks,
    zoom,
    updateTextBlockPosition, 
    updateImageBlockPosition,
    setSelectedBlockId,
    backgroundUrl,
    frontBackgroundUrl,
    backBackgroundUrl,
    margins,
    selectedBlockId,
    foldType,
    showFoldingGuide,
    orientation,
    activePage,
    removeTextBlock,
    removeImageBlock
  } = useEditorStore();

  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    visible: boolean;
    targetId: string;
    type: 'text' | 'image';
  }>({ x: 0, y: 0, visible: false, targetId: '', type: 'text' });

  const handleContextMenu = (e: React.MouseEvent, id: string, type: 'text' | 'image') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate position relative to the container
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
      targetId: id,
      type
    });
    
    setSelectedBlockId(id);
  };

  // Close context menu on click anywhere
  React.useEffect(() => {
    const closeMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (active && delta) {
      const blockId = active.id as string;
      const tBlock = textBlocks.find(b => b.id === blockId);
      const iBlock = imageBlocks.find(b => b.id === blockId);
      
      if (tBlock) {
        updateTextBlockPosition(blockId, tBlock.x + delta.x / zoom, tBlock.y + delta.y / zoom);
      } else if (iBlock) {
        updateImageBlockPosition(blockId, iBlock.x + delta.x / zoom, iBlock.y + delta.y / zoom);
      }
    }
  };

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.altKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const currentZoom = useEditorStore.getState().zoom;
        const newZoom = Math.max(1, Math.min(10, currentZoom + delta));
        useEditorStore.getState().setZoom(newZoom);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // mm 단위를 줌 배수를 적용하여 화면 표시
  const canvasWidthPx = currentDimension.widthMm * zoom;
  const canvasHeightPx = currentDimension.heightMm * zoom;

  const isLandscape = orientation === 'landscape';

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={containerRef}
        className="flex-1 w-full flex justify-center items-center p-8 bg-gray-100 rounded-lg shadow-inner overflow-auto h-full min-h-0"
      >
        <DndContext onDragEnd={handleDragEnd}>
          <div
            onClick={() => useEditorStore.getState().setSelectedBlockId(null)}
            style={{
              position: 'relative',
              width: `${canvasWidthPx}px`,
              height: `${canvasHeightPx}px`,
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              overflow: 'hidden',
            }}
            className="ring-1 ring-gray-200"
          >
            {/* Background Layers */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', flexDirection: isLandscape ? 'row' : 'column' }}>
              {foldType === 'half' ? (
                <>
                  <div style={{ 
                    flex: 1, 
                    backgroundImage: backBackgroundUrl ? `url(${backBackgroundUrl})` : undefined, 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRight: isLandscape ? '0.5px solid rgba(0,0,0,0.05)' : 'none',
                    borderBottom: !isLandscape ? '0.5px solid rgba(0,0,0,0.05)' : 'none'
                  }} />
                  <div style={{ 
                    flex: 1, 
                    backgroundImage: frontBackgroundUrl ? `url(${frontBackgroundUrl})` : undefined, 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                </>
              ) : (
                <div style={{ 
                  flex: 1, 
                  backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined, 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
              )}
            </div>

            {/* Margin Guides */}
            {activePage === 'inside' && foldType === 'half' ? (
              <>
                {/* First Page Safe Area (Left for Landscape, Top for Portrait) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: `${margins.top * zoom}px`,
                    left: `${margins.left * zoom}px`,
                    width: isLandscape ? `${(currentDimension.widthMm / 2 - margins.left) * zoom}px` : undefined,
                    right: isLandscape ? undefined : `${margins.right * zoom}px`,
                    height: !isLandscape ? `${(currentDimension.heightMm / 2 - margins.top) * zoom}px` : undefined,
                    bottom: isLandscape ? `${margins.bottom * zoom}px` : undefined,
                    border: '1px dashed rgba(59, 130, 246, 0.4)',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                {/* Second Page Safe Area (Right for Landscape, Bottom for Portrait) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: isLandscape ? `${margins.top * zoom}px` : `${(currentDimension.heightMm / 2) * zoom}px`,
                    left: isLandscape ? `${(currentDimension.widthMm / 2) * zoom}px` : `${margins.left * zoom}px`,
                    right: `${margins.right * zoom}px`,
                    bottom: `${margins.bottom * zoom}px`,
                    border: '1px dashed rgba(59, 130, 246, 0.4)',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
              </>
            ) : activePage === 'inside' ? (
              <div 
                style={{
                  position: 'absolute',
                  top: `${margins.top * zoom}px`,
                  left: `${margins.left * zoom}px`,
                  right: `${margins.right * zoom}px`,
                  bottom: `${margins.bottom * zoom}px`,
                  border: '1px dashed rgba(59, 130, 246, 0.3)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            ) : null}
            {textBlocks.map(block => (
              <DraggableText 
                key={block.id} 
                {...block} 
                isSelected={selectedBlockId === block.id}
                zoom={zoom}
                onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, block.id, 'text')}
              />
            ))}

            {imageBlocks.map(block => (
              <DraggableImage 
                key={block.id} 
                {...block} 
                isSelected={selectedBlockId === block.id}
                zoom={zoom}
                onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, block.id, 'image')}
              />
            ))}

            {/* 접지 가이드 (Fold Line Only) */}
            {foldType === 'half' && showFoldingGuide && (
              <div 
                style={{
                  position: 'absolute',
                  left: isLandscape ? '50%' : 0,
                  top: !isLandscape ? '50%' : 0,
                  right: 0,
                  bottom: 0,
                  width: isLandscape ? '1px' : '100%',
                  height: !isLandscape ? '1px' : '100%',
                  borderLeft: isLandscape ? '1px dashed #d1d5db' : undefined,
                  borderTop: !isLandscape ? '1px dashed #d1d5db' : undefined,
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
            )}
          </div>
        </DndContext>
      </div>

      {/* Context Menu Overlay */}
      {contextMenu.visible && (
        <div 
          className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            left: `${contextMenu.x}px`, 
            top: `${contextMenu.y}px`,
            minWidth: '120px'
          }}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (contextMenu.type === 'text') removeTextBlock(contextMenu.targetId);
              else removeImageBlock(contextMenu.targetId);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors text-xs font-bold"
          >
            <Trash2 size={14} />
            삭제하기
          </button>
        </div>
      )}

      {/* 하단 영역 안내 레이블 (캔버스 밖으로 이동) */}
      {foldType === 'half' && showFoldingGuide && (
        <div 
          className="flex mx-auto" 
          style={{ 
            width: `${canvasWidthPx}px`, 
            flexDirection: isLandscape ? 'row' : 'column',
            marginTop: '-10px' // p-8로 인한 간격 조정
          }}
        >
          <div className="flex-1 flex items-center justify-center p-2">
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              {activePage === 'outside' ? '뒷면 (BACK)' : isLandscape ? '내지 왼쪽' : '내지 위쪽'}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center p-2 border-l border-gray-100" style={{ borderLeft: isLandscape ? '1px solid #f3f4f6' : 'none', borderTop: !isLandscape ? '1px solid #f3f4f6' : 'none' }}>
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              {activePage === 'outside' ? '앞면 (FRONT)' : isLandscape ? '내지 오른쪽' : '내지 아래쪽'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
