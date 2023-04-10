import {
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";

type Vector2 = {
  x: number;
  y: number;
};

function App() {
  const [pixelSize, setPixelSize] = useState({
    x: 16,
    y: 16,
  });

  const [zoom, setZoom] = useState(100);

  const [currentLayer, setCurrentLayer] = useState("layer 1");

  return (
    <div className="App flex w-full h-screen">
      <div className="w-32 bg-slate-600"></div>
      <div className="grow bg-slate-900 flex flex-col">
        <div className="w-full h-32 bg-slate-800"></div>
        <PixelCanvas
          pixelSize={pixelSize}
          zoom={zoom}
          setZoom={setZoom}
          currentLayer={currentLayer}
        />
      </div>
      <div className="w-32 bg-slate-600"></div>
    </div>
  );
}

type Layer = {
  data: string[][];
};

function PixelCanvas(props: {
  pixelSize: Vector2;
  zoom: number;
  setZoom: (scroll: number) => void;
  currentLayer: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelRatio = props.pixelSize.x / props.pixelSize.y;

  const initLayer = () => {
    const layer: string[][] = [];

    for (let x = 0; x < props.pixelSize.x; x++) {
      layer[x] = [];

      for (let y = 0; y < props.pixelSize.y; y++) {
        layer[x][y] = "rgba(0, 0, 0, 0)";
      }
    }

    return layer;
  };

  const layers = useRef<Map<string, Layer>>(
    new Map([
      ["layer 1", { data: initLayer() }],
      ["brush", { data: initLayer() }],
    ])
  );

  const fillPixel = (params: {
    layer: Layer;
    position: Vector2;
    color: string;
    ctx: CanvasRenderingContext2D;
  }) => {
    const { color, layer, position, ctx } = params;
    const pixelWidth = (props.zoom * pixelRatio) / props.pixelSize.x;
    ctx.fillStyle = color;

    ctx.fillRect(
      position.x * pixelWidth,
      position.y * pixelWidth,
      pixelWidth + 0.02,
      pixelWidth + 0.02
    );

    layer.data[position.x][position.y] = color;
  };

  const refreshPixels = (params: {
    layer: Layer;
    ctx: CanvasRenderingContext2D;
  }) => {
    const { layer, ctx } = params;
    const pixelWidth = (props.zoom * pixelRatio) / props.pixelSize.x;

    for (let x = 0; x < layer.data.length; x++) {
      for (let y = 0; y < layer.data[x].length; y++) {
        if (layer.data[x][y] === "rgba(0, 0, 0, 0)") continue;
        ctx.fillStyle = layer.data[x][y];

        ctx.fillRect(
          x * pixelWidth,
          y * pixelWidth,
          pixelWidth + 0.02,
          pixelWidth + 0.02
        );
      }
    }
  };

  const clear = (params: {
    layerName: string;
    ctx: CanvasRenderingContext2D;
  }) => {
    const { layerName, ctx } = params;
    ctx.clearRect(0, 0, props.zoom * pixelRatio, props.zoom);
    const foundLayer = layers.current.get(layerName);

    if (foundLayer !== undefined) {
      foundLayer.data = initLayer();
    }

    for (let [_, layer] of layers.current) {
      refreshPixels({ layer, ctx });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    for (let [_, layer] of layers.current) {
      refreshPixels({
        ctx,
        layer: layer,
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
        onMouseMove={(e) => {
          const canvas = canvasRef.current;

          if (canvas === null) return;

          const ctx = canvas.getContext("2d");

          if (ctx === null) return;

          clear({
            layerName: "brush",
            ctx,
          });

          const getMousePos = (e: MouseEvent) => {
            const rect = (
              e.target as HTMLCanvasElement
            ).getBoundingClientRect();

            return {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            };
          };

          // const mousePos = getMousePos(e);
          // const pixelSize = (props.zoom * pixelRatio) / props.pixelSize.x;

          //Math.abs(Math.floor(mousePos.x / pixelSize))
        }}
        ref={canvasRef}
        className="bg-black"
        width={pixelRatio * props.zoom}
        height={props.zoom}
      ></canvas>
    </div>
  );
}

export default App;
