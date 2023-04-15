import { useEffect, useState } from "react";
import { BrushState, BrushStateProperty, brushes } from "./brushes/brush";
import PixelCanvas from "./Components/PixelCanvas";
import { usePreventCtrlMousewheel } from "./hooks/usePreventCtrlMousewheel";

export type Vector2 = {
  x: number;
  y: number;
};

function App() {
  usePreventCtrlMousewheel();

  const [pixelSize, setPixelSize] = useState({
    x: 32,
    y: 32,
  });

  const [zoom, setZoom] = useState(100);

  const [currentLayer, setCurrentLayer] = useState("layer 1");

  const [brush, setBrush] = useState("pixel");

  const [color, setColor] = useState("#ffffff");

  const [brushStates, setBrushStates] = useState<BrushState[]>(
    brushes().map((brush) => brush.defaultState)
  );

  const currentBrushState = brushStates.find(
    ({ brushName }) => brushName === brush
  );

  return (
    <div className="App flex w-full h-screen">
      <div className="w-fit bg-slate-600 flex">
        <Brushes
          brush={brush}
          setBrush={setBrush}
          brushStates={brushStates}
        ></Brushes>
      </div>
      <div className="grow bg-slate-900 flex flex-col">
        <div className="w-full h-fit bg-slate-800">
          {currentBrushState && (
            <PropertyViewer
              currentBrushState={currentBrushState}
              setCurrentBrushState={(newState: BrushState) =>
                setBrushStates([
                  ...brushStates.filter(
                    ({ brushName }) => brushName !== newState.brushName
                  ),
                  newState,
                ])
              }
            ></PropertyViewer>
          )}
        </div>
        <PixelCanvas
          pixelSize={pixelSize}
          zoom={zoom}
          setZoom={setZoom}
          currentLayer={currentLayer}
          brushState={brushStates.find(({ brushName }) => brushName === brush)}
          color={color}
        />
      </div>
      <div className="w-44 bg-slate-600">
        <ColorViewer color={color} setColor={setColor} />
      </div>
    </div>
  );
}

function ColorViewer(props: {
  color: string;
  setColor: (value: string) => void;
}) {
  const [colors, setColors] = useState([
    "#FF00FF",
    "#FF0000",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#0000FF",
  ]);

  const [selectedColor, setSelectedColor] = useState("#0000FF");

  const addColor = (color: string) => {
    if (colors.includes(color.toLocaleUpperCase())) return;
    setColors([...colors, color.toLocaleUpperCase()]);
  };

  return (
    <div className="p-2">
      <div className="w-full flex justify-center items-center aspect-square border-b border-white">
        <input
          className=""
          type="color"
          value={props.color}
          onChange={(e) => {
            props.setColor(e.currentTarget.value);
          }}
        />
      </div>
      <div className="flex border-b border-white p-2 flex-wrap">
        {colors.map((color) => (
          <ColorOption
            selected={selectedColor === color}
            select={() => setSelectedColor(color)}
            delete={() =>
              setColors(colors.filter((newColor) => newColor !== color))
            }
            setColor={() => props.setColor(color)}
            color={color}
            key={color}
          />
        ))}
        <button
          className="w-1/4 aspect-square bg-slate-500 text-white"
          onClick={() => {
            addColor(props.color);
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ColorOption(props: {
  color: string;
  setColor: () => void;
  selected: boolean;
  select: () => void;
  delete: () => void;
}) {
  return (
    <button
      className={`w-1/4 aspect-square ${
        props.selected ? "border-2 border-white" : ""
      }`}
      onClick={() => {
        if (props.selected) props.delete();

        props.select();
        props.setColor();
      }}
      style={{
        backgroundColor: props.color,
      }}
    ></button>
  );
}

function PropertyViewer(props: {
  currentBrushState: BrushState;
  setCurrentBrushState: (newState: BrushState) => void;
}) {
  return (
    <div className="p-2 flex gap-2">
      {props.currentBrushState.state.map((brushProperty) => (
        <BrushProperty
          brushProperty={brushProperty}
          key={props.currentBrushState.brushName + "-" + brushProperty.name}
          setBrushPropertyState={(newState: BrushStateProperty) => {
            props.setCurrentBrushState({
              brushName: props.currentBrushState.brushName,
              state: [
                ...props.currentBrushState.state.map((oldState) => {
                  if (newState.name === oldState.name) {
                    return newState;
                  } else {
                    return oldState;
                  }
                }),
              ],
            });
          }}
        />
      ))}
    </div>
  );
}

function BrushProperty(props: {
  brushProperty: BrushStateProperty;
  setBrushPropertyState: (newState: BrushStateProperty) => void;
}) {
  const { brushProperty, setBrushPropertyState } = props;
  const { name, value } = brushProperty;

  return (
    <>
      {typeof value == "boolean" && (
        <div className="flex gap-2 text-slate-100 border-r pr-2">
          <p>{name}</p>
          <input
            type="checkbox"
            defaultChecked={value}
            onChange={(e) => {
              setBrushPropertyState({
                name: brushProperty.name,
                value: e.currentTarget.checked,
              });
            }}
          ></input>
        </div>
      )}
      {typeof value == "number" && (
        <div className="flex gap-2 text-slate-100 border-r pr-2 ">
          <p>{name}</p>
          <input
            defaultValue={value}
            type="number"
            onChange={(e) => {
              setBrushPropertyState({
                name: brushProperty.name,
                value: parseInt(e.currentTarget.value) ?? 1,
              });
            }}
            className="w-8 bg-slate-700"
          ></input>
        </div>
      )}
    </>
  );
}

function Brushes(props: {
  brush: string;
  setBrush: (newBrush: string) => void;
  brushStates: BrushState[];
}) {
  const select = (name: string) => props.setBrush(name);
  const selected = (name: string) => props.brush === name;

  return (
    <div className="p-4 flex flex-wrap grow w-full gap-2 justify-top flex-col align-center">
      {props.brushStates.map(({ brushName }) => (
        <Brush
          name={brushName}
          key={brushName}
          select={select}
          selected={selected}
        ></Brush>
      ))}
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

export default App;
