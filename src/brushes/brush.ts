import type { Vector2 } from "../App";
import { Layer, PixelCanvasDimensions } from "../Components/PixelCanvas";

export type BrushStateProperty = {
  showInViewer: boolean;
  name: string;
  value: number | string[] | boolean;
};

export type BrushState = {
  brushName: string;
  state: BrushStateProperty[];
};

export type BrushActionFunction = (params: {
  brushState: BrushState;
  ctx: CanvasRenderingContext2D;
  layer: string;
  layers: Map<string, Layer>;
  mousePos: Vector2;
  color: string;
  pixelCanvasDimensions: PixelCanvasDimensions;
}) => void;

export type BrushAction = {
  down: BrushActionFunction;
  hold: BrushActionFunction;
  up: BrushActionFunction;
};

export type Brush = {
  name: string;
  defaultState: BrushState;
  action: BrushAction;
};
