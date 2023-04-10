import { MouseEvent, useEffect, useRef, useState } from "react";
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
  pixelCount: Vector2;
};

export default function PixelCanvas(props: {
  pixelSize: Vector2;
  zoom: number;
  setZoom: (scroll: number) => void;
  currentLayer: string;
  brushState?: BrushState;
  color: string;
}) {
  const brushes = [pixel, eraser];
  const mouseDownRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelCanvasDimensions = {
    zoom: props.zoom,
    pixelRatio: props.pixelSize.x / props.pixelSize.y,
    pixelSize: props.pixelSize,
    pixelCount: props.pixelSize,
  };
  const [rerenderPixels, setRerenderPixels] = useState(false);

  const layers = useRef<Map<string, Layer>[]>([
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
    ]),
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx === null || ctx === undefined) return;

    refreshALL(ctx);
  }, [props.zoom, rerenderPixels]);

  const refreshALL = (ctx: CanvasRenderingContext2D) => {
    for (let [_, layer] of layers.current[0]) {
      refreshPixels({
        ctx,
        layer: layer,
        pixelCanvasDimensions: pixelCanvasDimensions,
      });
    }
  };

  const draw = (e: MouseEvent) => {
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
      layers: layers.current[0],
      color: props.color,
      mousePos: mouseGridPos,
      pixelCanvasDimensions,
      down: mouseDownRef.current,
    });
  };

  return (
    <div
      className="w-full grow flex justify-center items-center"
      onWheel={(e) => {
        props.setZoom(props.zoom + e.deltaY * 0.05);
      }}
    >
      <canvas
        onMouseMove={(e: MouseEvent) => {
          draw(e);
        }}
        onMouseDown={(e) => {
          mouseDownRef.current = true;

          const present = new Map(
            JSON.parse(JSON.stringify(Array.from(layers.current[0])))
          ) as Map<string, Layer>;

          layers.current.unshift(present);
          draw(e);
        }}
        onKeyDown={(e) => {
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx === null || ctx === undefined) return;

          if (e.key == "z" && e.ctrlKey && !mouseDownRef.current) {
            layers.current.splice(0, 1);
            layers.current[0].get("brush")!.data = initLayer({
              pixelSize: pixelCanvasDimensions.pixelSize,
            });
            setRerenderPixels(!rerenderPixels);
          }
        }}
        tabIndex={0}
        onMouseUp={() => (mouseDownRef.current = false)}
        ref={canvasRef}
        className="bg-black"
        width={pixelCanvasDimensions.pixelRatio * props.zoom}
        height={props.zoom}
      ></canvas>
    </div>
  );
}

//canvas methods

const getMousePos = (e: MouseEvent) => {
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

const fillPixelRect = (params: {
  layer: Layer;
  position: Vector2;
  color: string;
  ctx: CanvasRenderingContext2D;
  pixelCanvasDimensions: PixelCanvasDimensions;
  size: number;
}) => {
  const { layer, pixelCanvasDimensions, color, position, size, ctx } = params;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      fillPixel({
        ctx,
        pixelCanvasDimensions,
        layer: layer,
        color,
        position: {
          x: position.x + i,
          y: position.y + j,
        },
      });
    }
  }
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

  if (
    position.x > params.pixelCanvasDimensions.pixelCount.x - 1 ||
    position.y > params.pixelCanvasDimensions.pixelCount.y - 1
  )
    return;

  ctx.fillRect(
    position.x * pixelWidth,
    position.y * pixelWidth,
    pixelWidth,
    pixelWidth
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

export { clear, fillPixel, initLayer, refreshPixels, fillPixelRect };
