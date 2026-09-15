'use client';

import { useEffect, useRef } from 'react';

export interface TextEditorTarget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  align: string;
  fill: string;
  text: string;
}

interface Props {
  target: TextEditorTarget;
  onChange: (text: string) => void;
  onClose: () => void;
}

// A textarea laid over the Konva text node so editing happens in place.
export function TextEditor({ target, onChange, onClose }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const bold = target.fontStyle.includes('bold');
  const italic = target.fontStyle.includes('italic');

  return (
    <textarea
      ref={ref}
      defaultValue={target.text}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
          e.preventDefault();
          onClose();
        }
      }}
      spellCheck={false}
      className="absolute m-0 resize-none overflow-hidden border-0 bg-transparent p-0 outline-none ring-2 ring-blue-500/60"
      style={{
        left: target.x,
        top: target.y,
        width: target.width,
        minHeight: target.height,
        fontSize: target.fontSize,
        fontFamily: target.fontFamily,
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? 'italic' : 'normal',
        textAlign: target.align as 'left' | 'center' | 'right',
        color: target.fill,
        lineHeight: 1.25,
      }}
    />
  );
}
