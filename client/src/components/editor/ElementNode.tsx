'use client';

import { Ellipse, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { CanvasElement } from '@/types/canvas';

interface Props {
  element: CanvasElement;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<CanvasElement>) => void;
  onEditText: (id: string) => void;
}

const round = (n: number) => Math.round(n * 10) / 10;

export function ElementNode({ element: el, onSelect, onChange, onEditText }: Props) {
  const interactive = !el.locked;

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    const node = e.target as Konva.Shape;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const rotation = round(node.rotation());

    if (el.type === 'circle') {
      const width = Math.max(1, round(el.width * scaleX));
      const height = Math.max(1, round(el.height * scaleY));
      // ellipse position is its centre; the model stores the top-left corner
      onChange(el.id, { x: round(node.x() - width / 2), y: round(node.y() - height / 2), width, height, rotation });
      return;
    }

    if (el.type === 'text') {
      const textNode = node as Konva.Text;
      onChange(el.id, {
        x: round(node.x()),
        y: round(node.y()),
        width: Math.max(20, round(node.width() * scaleX)),
        height: round(textNode.height() * scaleY),
        fontSize: Math.max(4, round((el.fontSize ?? 24) * scaleY)),
        rotation,
      });
      return;
    }

    onChange(el.id, {
      x: round(node.x()),
      y: round(node.y()),
      width: Math.max(1, round(node.width() * scaleX)),
      height: Math.max(1, round(node.height() * scaleY)),
      rotation,
    });
  };

  const common = {
    id: el.id,
    name: 'element',
    rotation: el.rotation,
    opacity: el.opacity ?? 1,
    visible: el.visible !== false,
    draggable: interactive,
    listening: el.visible !== false,
    onClick: () => onSelect(el.id),
    onTap: () => onSelect(el.id),
    onDragStart: () => onSelect(el.id),
    onTransformEnd: handleTransformEnd,
  };

  if (el.type === 'circle') {
    return (
      <Ellipse
        {...common}
        x={el.x + el.width / 2}
        y={el.y + el.height / 2}
        radiusX={el.width / 2}
        radiusY={el.height / 2}
        fill={el.fill}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth ?? 0}
        onDragEnd={(e) =>
          onChange(el.id, { x: round(e.target.x() - el.width / 2), y: round(e.target.y() - el.height / 2) })
        }
      />
    );
  }

  if (el.type === 'text') {
    return (
      <Text
        {...common}
        x={el.x}
        y={el.y}
        width={el.width}
        text={el.text ?? ''}
        fontSize={el.fontSize ?? 24}
        fontFamily={el.fontFamily ?? 'Inter, system-ui, sans-serif'}
        fontStyle={el.fontStyle ?? 'normal'}
        align={el.align ?? 'left'}
        lineHeight={1.25}
        fill={el.fill}
        onDragEnd={(e) => onChange(el.id, { x: round(e.target.x()), y: round(e.target.y()) })}
        onDblClick={() => interactive && onEditText(el.id)}
        onDblTap={() => interactive && onEditText(el.id)}
      />
    );
  }

  return (
    <Rect
      {...common}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      fill={el.fill}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth ?? 0}
      cornerRadius={el.cornerRadius ?? 0}
      onDragEnd={(e) => onChange(el.id, { x: round(e.target.x()), y: round(e.target.y()) })}
    />
  );
}
