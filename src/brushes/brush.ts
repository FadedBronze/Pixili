import type { Vector2 } from "../App";
import { Layer } from "../Components/PixelCanvas";

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
  layer: Layer;
  mousePos?: Vector2;
  color?: string;
}) => void;

export type BrushAction = {
  name: string;
  down: BrushActionFunction;
  hold: BrushActionFunction;
  up: BrushActionFunction;
};

export type Brush = {
  name: string;
  defaultBrushState: BrushState;
  brushAction: BrushAction;
};

import { pixel } from "./pixel";
export const brushActions = [pixel];
