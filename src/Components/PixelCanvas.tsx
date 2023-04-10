import { MouseEvent, useEffect, useRef } from "react";
import { Vector2 } from "../App";
import { BrushState } from "../brushes/brush";
import { pixel } from "../brushes/pixel";
import { eraser } from "../brushes/eraser";

export type Layer = {
  data: string[][];
};

export type PixelCanvasDimensions = {
  zoom: number;
  pixelRatio: number;
  pixelSize: Vector2;
};

export default function PixelCanvas(props: {
  pixelSize: Vector2;
  zoom: number;
  setZoom: (scroll: number) => void;
  currentLayer: string;
  brushState?: BrushState;
}) {
  const brushes = [pixel, eraser];
  const mouseDownRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelCanvasDimensions = {
    zoom: props.zoom,
    pixelRatio: props.pixelSize.x / props.pixelSize.y,
    pixelSize: props.pixelSize,
  };

  const layers = useRef<Map<string, Layer>>(
    new Map([
      [
        "layer 1",
        {
          data: initLayer({
            pixelSize: pixelCanvasDimensions.pixelSize,
          }),
        },
      ],
      [
        "brush",
        {
          data: initLayer({
            pixelSize: pixelCanvasDimensions.pixelSize,
          }),
        },
      ],
    ])
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    for (let [_, layer] of layers.current) {
      refreshPixels({
        ctx,
        layer: layer,
        pixelCanvasDimensions: pixelCanvasDimensions,
      });
    }
  }, [props.zoom]);

  return (
    <div
      className="w-full grow flex justify-center items-center"
      onWheel={(e) => {
        props.setZoom(props.zoom + e.deltaY * 0.05);
      }}
    >
      <canvas
        onMouseMove={(e: MouseEvent) => {
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx === null || ctx === undefined) return;

          if (props.brushState === undefined) return;

          const mousePos = getMousePos(e);
          const pixelSize =
            (props.zoom * pixelCanvasDimensions.pixelRatio) / props.pixelSize.x;
          const mouseGridPos = {
            x: Math.abs(Math.floor(mousePos.x / pixelSize)),
            y: Math.abs(Math.floor(mousePos.y / pixelSize)),
          };

          const brush = brushes.find(
            ({ name }) => name === props.brushState?.brushName
          );

          brush?.action({
            ctx,
            brushState: props.brushState,
            layer: props.currentLayer,
            layers: layers.current,
            color: "red",
            mousePos: mouseGridPos,
            pixelCanvasDimensions,
            down: mouseDownRef.current,
          });
        }}
        onMouseDown={() => (mouseDownRef.current = true)}
        onMouseUp={() => (mouseDownRef.current = false)}
        ref={canvasRef}
        className="bg-black"
        width={pixelCanvasDimensions.pixelRatio * props.zoom}
        height={props.zoom}
      ></canvas>
    </div>
  );
}

const getMousePos = (e: MouseEvent) => {
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

const fillPixel = (params: {
  layer: Layer;
  position: Vector2;
  color: string;
  ctx: CanvasRenderingContext2D;
  pixelCanvasDimensions: PixelCanvasDimensions;
}) => {
  const { color, layer, position, ctx } = params;
  const pixelWidth =
    (params.pixelCanvasDimensions.zoom *
      params.pixelCanvasDimensions.pixelRatio) /
    params.pixelCanvasDimensions.pixelSize.x;
  ctx.fillStyle = color;

  ctx.fillRect(
    position.x * pixelWidth,
    position.y * pixelWidth,
    pixelWidth + 1,
    pixelWidth + 1
  );

  layer.data[position.x][position.y] = color;
};

const refreshPixels = (params: {
  layer: Layer;
  ctx: CanvasRenderingContext2D;
  pixelCanvasDimensions: PixelCanvasDimensions;
}) => {
  const { layer, ctx } = params;
  const pixelWidth =
    (params.pixelCanvasDimensions.zoom *
      params.pixelCanvasDimensions.pixelRatio) /
    params.pixelCanvasDimensions.pixelSize.x;

  for (let x = 0; x < layer.data.length; x++) {
    for (let y = 0; y < layer.data[x].length; y++) {
      if (layer.data[x][y] === "rgba(0, 0, 0, 0)") continue;
      ctx.fillStyle = layer.data[x][y];

      ctx.fillRect(
        x * pixelWidth,
        y * pixelWidth,
        pixelWidth + 1,
        pixelWidth + 1
      );
    }
  }
};

const initLayer = (params: { pixelSize: Vector2 }) => {
  const layer: string[][] = [];

  for (let x = 0; x < params.pixelSize.x; x++) {
    layer[x] = [];

    for (let y = 0; y < params.pixelSize.y; y++) {
      layer[x][y] = "rgba(0, 0, 0, 0)";
    }
  }

  return layer;
};

const clear = (params: {
  layers: Map<string, Layer>;
  layerName: string;
  ctx: CanvasRenderingContext2D;
  pixelCanvasDimensions: PixelCanvasDimensions;
}) => {
  const { layerName, ctx } = params;
  ctx.clearRect(
    0,
    0,
    params.pixelCanvasDimensions.zoom * params.pixelCanvasDimensions.pixelRatio,
    params.pixelCanvasDimensions.zoom
  );
  const foundLayer = params.layers.get(layerName);

  if (foundLayer !== undefined) {
    foundLayer.data = initLayer({
      pixelSize: params.pixelCanvasDimensions.pixelSize,
    });
  }

  for (let [_, layer] of params.layers) {
    refreshPixels({
      layer,
      ctx,
      pixelCanvasDimensions: params.pixelCanvasDimensions,
    });
  }
};

export { clear, fillPixel, initLayer, refreshPixels };
