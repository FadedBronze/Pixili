import { clear, fillPixel } from "../Components/PixelCanvas";
import { Brush } from "./brush";

export const pixel: Brush = {
  name: "pixel",
  defaultState: {
    brushName: "pixel",
    state: [
      {
        showInViewer: true,
        name: "pixel perfect",
        value: false,
      },
      {
        showInViewer: true,
        name: "scale",
        value: 1,
      },
    ],
  },
  action: {
    down: ({ ctx, pixelCanvasDimensions, layers, layer, color, mousePos }) => {
      const drawLayer = layers.get(layer);

      if (drawLayer === undefined) return;

      fillPixel({
        ctx,
        pixelCanvasDimensions,
        layer: drawLayer,
        color,
        position: mousePos,
      });
    },
    hold: ({ ctx, pixelCanvasDimensions, layers, color, mousePos }) => {
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
        color,
        position: mousePos,
      });
    },
    up: ({}) => {},
  },
};
