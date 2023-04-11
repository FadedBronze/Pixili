import { Layer, clear, fillPixel } from "../Components/PixelCanvas";
import { Brush } from "./brush";

export const bucket: Brush = {
  name: "bucket",
  defaultState: {
    brushName: "bucket",
    state: [],
  },
  action: ({
    ctx,
    pixelCanvasDimensions,
    layers,
    mousePos,
    layer,
    down,
    color,
  }) => {
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
      color: "rgba(125, 125, 125, 0.5)",
      position: mousePos,
    });

    if (!down) return;
    const currentLayer = layers.get(layer)!.data;
    const replacingColor = "rgba(0, 0, 0, 0)";

    const flood_fill = (x: number, y: number) => {
      if (
        x > pixelCanvasDimensions.pixelCount.x - 1 ||
        x < 0 ||
        y > pixelCanvasDimensions.pixelCount.y - 1 ||
        y < 0
      )
        return;

      if (currentLayer[x][y] === color) return;

      if (currentLayer[x][y] !== replacingColor) return;
      currentLayer[x][y] = color;

      flood_fill(x + 1, y);
      flood_fill(x - 1, y);
      flood_fill(x, y + 1);
      flood_fill(x, y - 1);
    };

    flood_fill(mousePos.x, mousePos.y);
  },
};
