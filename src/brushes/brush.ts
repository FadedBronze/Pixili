import type { Vector2 } from "../App";
import { Layer, PixelCanvasDimensions } from "../Components/PixelCanvas";
import { pixel } from "../brushes/pixel";
import { eraser } from "../brushes/eraser";
import { bucket } from "./bucket";

export type BrushStateProperty = {
  name: string;
  value: number | boolean;
};

export type BrushState = {
  brushName: string;
  state: BrushStateProperty[];
};

export type BrushAction = (params: {
  brushState: BrushState;
  ctx: CanvasRenderingContext2D;
  layer: string;
  layers: Map<string, Layer>;
  mousePos: Vector2;
  color: string;
  pixelCanvasDimensions: PixelCanvasDimensions;
  down: boolean;
}) => void;

export type Brush = {
  name: string;
  defaultState: BrushState;
  action: BrushAction;
};

export function brushes() {
  return [pixel, eraser, bucket]; // any new brushes must be added here
}
