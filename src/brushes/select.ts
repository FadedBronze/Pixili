import { clear, fillPixel, fillPixelRect } from "../Components/PixelCanvas";
import { Brush } from "./brush";

export const select: Brush = {
  name: "select",
  state: [],
  action: ({
    ctx,
    pixelCanvasDimensions,
    layers,
    color,
    mousePos,
    layer,
    down,
    brushState,
    startingMousePos,
  }) => {
    clear({
      layerName: "brush",
      ctx,
      pixelCanvasDimensions: pixelCanvasDimensions,
      layers: layers,
    });

    //startingMousePos

    fillPixelRect({
      size: {
        x: startingMousePos.x - mousePos.x,
        y: startingMousePos.y - mousePos.y,
      },
      color: "rgba(125, 125, 125, 0.5)",
      ctx,
      layer: layers.get("brush")!,
      pixelCanvasDimensions,
      position: mousePos,
    });
  },
};
