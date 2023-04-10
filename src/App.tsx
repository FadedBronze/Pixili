import { useState } from "react";
import { BrushState, BrushStateProperty } from "./brushes/brush";
import { pixel } from "./brushes/pixel";
import PixelCanvas from "./Components/PixelCanvas";
import { eraser } from "./brushes/eraser";

export type Vector2 = {
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

  const [brush, setBrush] = useState("pixel");

  const [brushStates, setBrushStates] = useState<BrushState[]>([
    pixel.defaultState,
    eraser.defaultState,
  ]);

  const currentBrushState = brushStates.find(
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
        />
      </div>
      <div className="w-32 bg-slate-600"></div>
    </div>
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
          key={brushProperty.name}
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
  const { name, showInViewer, value } = brushProperty;

  return showInViewer ? (
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
                showInViewer: brushProperty.showInViewer,
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
                showInViewer: brushProperty.showInViewer,
                value: JSON.parse(e.currentTarget.value),
              });
            }}
            className="w-8 bg-slate-700"
          ></input>
        </div>
      )}
    </>
  ) : (
    <></>
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

export default App;
