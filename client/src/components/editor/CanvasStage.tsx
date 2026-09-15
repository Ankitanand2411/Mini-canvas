'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Layer, Rect, Stage, Transformer } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { CanvasElement } from '@/types/canvas';
import { ElementNode } from './ElementNode';
import { TextEditor, type TextEditorTarget } from './TextEditor';

interface Props {
  width: number;
  height: number;
  scale: number;
  background: string;
  elements: CanvasElement[];
  selectedId: string | null;
  stageRef: RefObject<Konva.Stage | null>;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<CanvasElement>, options?: { transient?: boolean }) => void;
  onCommit: () => void;
}

const MIN_SIZE = 8;

export default function CanvasStage({
  width,
  height,
  scale,
  background,
  elements,
  selectedId,
  stageRef,
  onSelect,
  onChange,
  onCommit,
}: Props) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const [editing, setEditing] = useState<TextEditorTarget | null>(null);

  const selected = elements.find((e) => e.id === selectedId);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const selectable = selectedId && !editing && !selected?.locked && selected?.visible !== false;
    const node = selectable ? stage.findOne(`#${selectedId}`) : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedId, selected?.locked, selected?.visible, elements, editing, stageRef]);

  const handlePointerDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) onSelect(null);
  };

  const startTextEdit = (id: string) => {
    const stage = stageRef.current;
    const node = stage?.findOne<Konva.Text>(`#${id}`);
    const el = elements.find((item) => item.id === id);
    if (!stage || !node || !el) return;

    const box = node.getClientRect({ relativeTo: stage });
    setEditing({
      id,
      x: box.x * scale,
      y: box.y * scale,
      width: Math.max(box.width, el.width) * scale,
      height: box.height * scale,
      fontSize: (el.fontSize ?? 24) * scale,
      fontFamily: el.fontFamily ?? 'Inter, system-ui, sans-serif',
      fontStyle: el.fontStyle ?? 'normal',
      align: el.align ?? 'left',
      fill: el.fill,
      text: el.text ?? '',
    });
  };

  return (
    <div className="relative shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
      <Stage
        ref={stageRef}
        width={width * scale}
        height={height * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <Layer>
          <Rect x={0} y={0} width={width} height={height} fill={background} listening={false} />
          {elements.map((el) => (
            <ElementNode
              key={el.id}
              element={editing?.id === el.id ? { ...el, visible: false } : el}
              onSelect={onSelect}
              onChange={onChange}
              onEditText={startTextEdit}
            />
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            keepRatio={false}
            flipEnabled={false}
            ignoreStroke
            anchorSize={8}
            anchorCornerRadius={2}
            anchorStroke="#2563eb"
            anchorFill="#ffffff"
            borderStroke="#2563eb"
            rotateAnchorOffset={28}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={4}
            boundBoxFunc={(oldBox, newBox) =>
              Math.abs(newBox.width) < MIN_SIZE || Math.abs(newBox.height) < MIN_SIZE ? oldBox : newBox
            }
          />
        </Layer>
      </Stage>

      {editing && (
        <TextEditor
          target={editing}
          onChange={(text) => onChange(editing.id, { text }, { transient: true })}
          onClose={() => {
            onCommit();
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
