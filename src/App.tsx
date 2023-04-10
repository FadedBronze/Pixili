import { MouseEvent, useEffect, useRef, useState } from "react";

type Vector2 = {
  x: number;
  y: number;
};

type BrushStateProperty = {
  showInViewer: boolean;
  name: string;
  value: number | string | boolean;
};

type BrushState = {
  brushName: string;
  state: BrushStateProperty[];
};

function App() {
  const [pixelSize, setPixelSize] = useState({
    x: 16,
    y: 16,
  });

  const [zoom, setZoom] = useState(100);

  const [currentLayer, setCurrentLayer] = useState("layer 1");

  const [brush, setBrush] = useState("pixel");

  const [brushState, setBrushState] = useState<BrushState[]>([
    {
      brushName: "pixel",
      state: [
        {
          showInViewer: true,
          name: "pixel perfect",
          value: false,
        },
      ],
    },
  ]);

  const currentBrushState = brushState.find(
    ({ brushName }) => brushName === brush
  );

  return (
    <div className="App flex w-full h-screen">
      <div className="w-fit bg-slate-600 flex">
        <Brushes brush={brush} setBrush={setBrush}></Brushes>
      </div>
      <div className="grow bg-slate-900 flex flex-col">
        <div className="w-full h-fit bg-slate-800">
          {currentBrushState && (
            <PropertyViewer brushState={currentBrushState}></PropertyViewer>
          )}
        </div>
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

function PropertyViewer(props: { brushState: BrushState }) {
  return (
    <div className="p-2">
      {props.brushState.state.map((brushProperty) => (
        <BrushProperty brushProperty={brushProperty} key={brushProperty.name} />
      ))}
    </div>
  );
}

function BrushProperty(props: { brushProperty: BrushStateProperty }) {
  const { brushProperty } = props;
  const { name, showInViewer, value } = brushProperty;

  return (
    <>
      {typeof value == "boolean" && (
        <div>
          {name}
          <input type="checkbox"></input>
        </div>
      )}
    </>
  );
}

function Brushes(props: {
  brush: string;
  setBrush: (newBrush: string) => void;
}) {
  const select = (name: string) => props.setBrush(name);
  const selected = (name: string) => props.brush === name;

  return (
    <div className="p-4 flex flex-wrap grow w-full gap-2 justify-top flex-col align-center">
      <Brush name="pixel" select={select} selected={selected}></Brush>
      <Brush name="eraser" select={select} selected={selected}></Brush>
      <Brush name="lasso" select={select} selected={selected}></Brush>
      <Brush name="crop" select={select} selected={selected}></Brush>
    </div>
  );
}

function Brush(props: {
  selected: (name: string) => boolean;
  select: (name: string) => void;
  name: string;
}) {
  return (
    <button
      onClick={() => props.select(props.name)}
      className={`bg-slate-300 rounded-md flex justify-center items-center w-12 h-12 ${
        props.selected(props.name) ? "border-4 border-slate-100" : ""
      }`}
    >
      {props.name}
    </button>
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
