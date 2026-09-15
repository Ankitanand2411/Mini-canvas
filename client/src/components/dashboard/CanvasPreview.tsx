import type { Canvas } from '@/types/canvas';

// Cheap SVG rendering of a canvas for the list view, so we don't need Konva there.
export function CanvasPreview({ canvas }: { canvas: Canvas }) {
  return (
    <svg
      viewBox={`0 0 ${canvas.width} ${canvas.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden
    >
      <rect width={canvas.width} height={canvas.height} fill={canvas.background} />
      {canvas.elements
        .filter((el) => el.visible !== false)
        .map((el) => {
          const opacity = el.opacity ?? 1;
          if (el.type === 'circle') {
            const cx = el.x + el.width / 2;
            const cy = el.y + el.height / 2;
            return (
              <ellipse
                key={el.id}
                cx={cx}
                cy={cy}
                rx={el.width / 2}
                ry={el.height / 2}
                fill={el.fill}
                opacity={opacity}
                transform={`rotate(${el.rotation} ${cx} ${cy})`}
              />
            );
          }
          if (el.type === 'text') {
            const fontSize = el.fontSize ?? 24;
            return (
              <text
                key={el.id}
                x={el.x}
                y={el.y + fontSize}
                fontSize={fontSize}
                fontFamily={el.fontFamily ?? 'sans-serif'}
                fontWeight={el.fontStyle?.includes('bold') ? 700 : 400}
                fill={el.fill}
                opacity={opacity}
                transform={`rotate(${el.rotation} ${el.x} ${el.y})`}
              >
                {(el.text ?? '').split('\n')[0]}
              </text>
            );
          }
          return (
            <rect
              key={el.id}
              x={el.x}
              y={el.y}
              width={el.width}
              height={el.height}
              rx={el.cornerRadius ?? 0}
              fill={el.fill}
              opacity={opacity}
              transform={`rotate(${el.rotation} ${el.x} ${el.y})`}
            />
          );
        })}
    </svg>
  );
}
