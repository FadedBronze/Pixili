import { clear, fillPixel, fillPixelRect } from "../Components/PixelCanvas";
import { Brush } from "./brush";

export const pixel: Brush = {
  name: "pixel",
  defaultState: {
    brushName: "pixel",
    state: [
      {
        name: "pixel perfect",
        value: false,
      },
      {
        name: "scale",
        value: 1,
      },
    ],
  },
  action: ({
    ctx,
    pixelCanvasDimensions,
    layers,
    color,
    mousePos,
    layer,
    down,
    brushState,
  }) => {
    clear({
      layerName: "brush",
      ctx,
      pixelCanvasDimensions: pixelCanvasDimensions,
      layers: layers,
    });

    const size =
      (brushState.state.find(({ name }) => name === "scale")?.value as
        | number
        | undefined) ?? 1;

    fillPixelRect({
      color,
      ctx,
      layer: layers.get("brush")!,
      pixelCanvasDimensions,
      position: mousePos,
      size: { x: size, y: size },
    });

    if (!down) return;

    const drawLayer = layers.get(layer);
    if (drawLayer === undefined) return;

    fillPixelRect({
      color,
      ctx,
      layer: drawLayer,
      pixelCanvasDimensions,
      position: mousePos,
      size: { x: size, y: size },
    });
  },
};
