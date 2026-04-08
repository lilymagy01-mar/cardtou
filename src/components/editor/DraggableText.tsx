'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TextBlock, useEditorStore } from '@/store/useEditorStore';

interface DraggableTextProps {
  block: TextBlock;
}

export const DraggableText: React.FC<DraggableTextProps> = ({ block }) => {
  const { selectedBlockId, setSelectedBlockId } = useEditorStore();
  const isSelected = selectedBlockId === block.id;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id,
    data: block,
  });

  // 드래그 중인 변위(transform)를 기존 (x,y) 좌표에 더해서 위치를 임시 시각화 시킵니다.
  // 실제 좌표는 onDragEnd에서 zustand 스토어에 업데이트됩니다.
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${block.x}px`,
    top: `${block.y}px`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    color: block.colorHex,
    fontSize: `${block.fontSize}px`,
    fontFamily: block.fontFamily || 'sans-serif',
    whiteSpace: 'pre-wrap',
    cursor: 'grab',
    userSelect: 'none',
    padding: '4px',
    border: transform ? '2px dashed #3b82f6' : (isSelected ? '2px solid #3b82f6' : '1px solid transparent'),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedBlockId(block.id);
      }}
      className={transform ? 'bg-white/50 rounded z-50' : 'hover:border-blue-300 rounded z-10'}
    >
      {block.text}
    </div>
  );
};
