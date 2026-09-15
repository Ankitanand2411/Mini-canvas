import { nanoid } from 'nanoid';
import type { CanvasElement, ElementType } from '@/types/canvas';

const PALETTE = ['#18181b', '#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const LABELS: Record<ElementType, string> = {
  rect: 'Rectangle',
  circle: 'Circle',
  text: 'Text',
};

export function elementLabel(type: ElementType) {
  return LABELS[type];
}

export function createElement(
  type: ElementType,
  canvas: { width: number; height: number },
  existing: CanvasElement[],
): CanvasElement {
  const sameType = existing.filter((e) => e.type === type).length;
  // stagger new elements so they don't stack exactly on top of each other
  const offset = (existing.length % 6) * 24;
  const fill = PALETTE[existing.length % PALETTE.length];

  const base = {
    id: nanoid(10),
    name: `${LABELS[type]} ${sameType + 1}`,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
  };

  switch (type) {
    case 'rect': {
      const width = 240;
      const height = 160;
      return {
        ...base,
        type,
        x: Math.round(canvas.width / 2 - width / 2 + offset),
        y: Math.round(canvas.height / 2 - height / 2 + offset),
        width,
        height,
        fill,
        cornerRadius: 8,
      };
    }
    case 'circle': {
      const size = 180;
      return {
        ...base,
        type,
        x: Math.round(canvas.width / 2 - size / 2 + offset),
        y: Math.round(canvas.height / 2 - size / 2 + offset),
        width: size,
        height: size,
        fill,
      };
    }
    case 'text': {
      const width = 320;
      return {
        ...base,
        type,
        x: Math.round(canvas.width / 2 - width / 2 + offset),
        y: Math.round(canvas.height / 2 - 20 + offset),
        width,
        height: 40,
        fill: '#18181b',
        text: 'Double-click to edit',
        fontSize: 32,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontStyle: 'normal',
        align: 'left',
      };
    }
  }
}

export function duplicateElement(el: CanvasElement, existing: CanvasElement[]): CanvasElement {
  const sameType = existing.filter((e) => e.type === el.type).length;
  return {
    ...el,
    id: nanoid(10),
    name: `${LABELS[el.type]} ${sameType + 1}`,
    x: el.x + 20,
    y: el.y + 20,
  };
}

// Only the fields the API accepts; anything else on the object would fail validation.
const ELEMENT_KEYS: (keyof CanvasElement)[] = [
  'id', 'type', 'name', 'x', 'y', 'width', 'height', 'rotation', 'fill', 'stroke', 'strokeWidth',
  'opacity', 'cornerRadius', 'text', 'fontSize', 'fontFamily', 'fontStyle', 'align', 'visible', 'locked',
];

export function serializeElements(elements: CanvasElement[]): CanvasElement[] {
  return elements.map((el) => {
    const out: Partial<CanvasElement> = {};
    for (const key of ELEMENT_KEYS) {
      if (el[key] !== undefined) (out as Record<string, unknown>)[key] = el[key];
    }
    return out as CanvasElement;
  });
}
