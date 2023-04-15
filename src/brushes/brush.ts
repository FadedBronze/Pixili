import type { Vector2 } from "../App";
import { Layer, PixelCanvasDimensions } from "../Components/PixelCanvas";
import { pixel } from "../brushes/pixel";
import { eraser } from "../brushes/eraser";
import { bucket } from "./bucket";
import { select } from "./select";

export type BrushStateProperty = {
  name: string;
  value: number | boolean;
};

export type BrushState = {
  name: string;
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
  startingMousePos: Vector2;
}) => void;

export type Brush = {
  name: string;
  state: BrushStateProperty[];
  action: BrushAction;
};

export function brushes() {
  return [pixel, eraser, bucket, select]; // any new brushes must be added here
}

export const getStateAs = <T>(state: BrushState, query: string) => {
  return state.state.find(({ name }) => name === query)?.value as T | undefined;
};
