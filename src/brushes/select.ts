import { clear, fillPixel, fillPixelRect } from "../Components/PixelCanvas";
import { Brush } from "./brush";

const selectData = {
  selecting: false,
};

export const select: Brush<typeof selectData> = {
  name: "select",
  state: [],
  data: selectData,
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
    brushData,
  }) => {
    const data = brushData.data as typeof selectData;

    clear({
      layerName: "brush",
      ctx,
      pixelCanvasDimensions: pixelCanvasDimensions,
      layers: layers,
    });

    //startingMousePos

    if (down) {
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
    }
  },
};
