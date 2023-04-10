import { clear, fillPixel } from "../Components/PixelCanvas";
import { Brush } from "./brush";

export const eraser: Brush = {
  name: "eraser",
  defaultState: {
    brushName: "eraser",
    state: [
      {
        showInViewer: true,
        name: "scale",
        value: 1,
      },
    ],
  },
  action: ({ ctx, pixelCanvasDimensions, layers, mousePos, layer, down }) => {
    clear({
      layerName: "brush",
      ctx,
      pixelCanvasDimensions: pixelCanvasDimensions,
      layers: layers,
    });

    fillPixel({
      ctx,
      pixelCanvasDimensions,
      layer: layers.get("brush")!,
      color: "white",
      position: mousePos,
    });

    if (!down) return;

    const drawLayer = layers.get(layer);
    if (drawLayer === undefined) return;

    fillPixel({
      ctx,
      pixelCanvasDimensions,
      layer: drawLayer,
      color: "rgba(0, 0, 0, 0)",
      position: mousePos,
    });
  },
};
