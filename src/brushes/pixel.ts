import { Brush } from "./brush";

export const pixel: Brush = {
  name: "pixel",
  defaultBrushState: {
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
  brushAction: {
    name: "pixel",
    down: ({ mousePos, color }) => {},
    hold: ({}) => {},
    up: ({}) => {},
  },
};
