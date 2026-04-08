'use client';

import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useEditorStore } from '@/store/useEditorStore';
import { DraggableText } from './DraggableText';

export const EditorCanvas: React.FC = () => {
  const { currentDimension, textBlocks, updateTextBlockPosition, backgroundUrl } = useEditorStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (active && delta) {
      const blockId = active.id as string;
      const block = textBlocks.find(b => b.id === blockId);
      
      if (block) {
        // 드롭 완료 시 기존(x, y)에 델타(delta) 이동량을 합산해 상태 반영
        updateTextBlockPosition(blockId, block.x + delta.x, block.y + delta.y);
      }
    }
  };

  // 임시적으로 mm 단위를 3배수(픽셀 렌더링용)로 뻥튀기하여 화면 표시 (실제 각도기 팩토리 연동 필요)
  const canvasWidthPx = currentDimension.widthMm * 3;
  const canvasHeightPx = currentDimension.heightMm * 3;

  return (
    <div className="flex justify-center items-center p-8 bg-gray-100 rounded-lg shadow-inner overflow-auto h-[600px]">
      <DndContext onDragEnd={handleDragEnd}>
        <div
          onClick={() => useEditorStore.getState().setSelectedBlockId(null)}
          style={{
            position: 'relative',
            width: `${canvasWidthPx}px`,
            height: `${canvasHeightPx}px`,
            backgroundColor: backgroundUrl ? 'transparent' : '#ffffff',
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
          }}
          className="ring-1 ring-gray-200"
        >
          {textBlocks.map(block => (
            <DraggableText key={block.id} block={block} />
          ))}
        </div>
      </DndContext>
    </div>
  );
};
