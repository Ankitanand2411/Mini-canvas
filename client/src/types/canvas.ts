export type ElementType = 'rect' | 'circle' | 'text';

export type TextAlign = 'left' | 'center' | 'right';

export interface CanvasElement {
  id: string;
  type: ElementType;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  align?: TextAlign;
  visible?: boolean;
  locked?: boolean;
}

export interface Canvas {
  id: string;
  title: string;
  width: number;
  height: number;
  background: string;
  elements: CanvasElement[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export type CanvasInput = Partial<Pick<Canvas, 'title' | 'width' | 'height' | 'background' | 'elements'>>;

export interface User {
  id: string;
  name: string;
  email: string;
}
