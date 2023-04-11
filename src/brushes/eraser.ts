import { clear, fillPixel, fillPixelRect } from "../Components/PixelCanvas";
import { Brush } from "./brush";

export const eraser: Brush = {
  name: "eraser",
  defaultState: {
    brushName: "eraser",
    state: [
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
      size: size,
      ctx,
      pixelCanvasDimensions,
      layer: layers.get("brush")!,
      color: "rgba(125, 125, 125, 0.5)",
      position: mousePos,
    });

    if (!down) return;

    const drawLayer = layers.get(layer);
    if (drawLayer === undefined) return;

    fillPixelRect({
      size: size,
      ctx,
      pixelCanvasDimensions,
      layer: drawLayer,
      color: "rgba(0, 0, 0, 0)",
      position: mousePos,
    });
  },
};
