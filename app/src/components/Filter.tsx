import * as Slider from "@radix-ui/react-slider";
import { COLORS } from "../utils/sourceLayerConfigs";

type Props = {
  selectedProperties: Array<string>;
  setFilter: (value: Record<string, any>) =>  void;
  filters: Record<string, any>;
}

function getFilterGridColors(prop0: number, prop1: number) : Array<COLORS | string> {
  return [prop0 > 2 || prop1 > 0 ? 'gray' : COLORS.darkgreen, prop0 > 2 || prop1 > 1 ? 'gray' : COLORS.darkblue, prop0 > 2 || prop1 > 2 ? 'gray' : COLORS.darkred,
            prop0 > 1 || prop1 > 0 ? 'gray' : COLORS.mediumgreen, prop0 > 1 || prop1 > 1 ? 'gray' : COLORS.mediumblue, prop0 > 1 || prop1 > 2 ? 'gray' : COLORS.mediumred,
            prop0 > 0 || prop1 > 0 ? 'gray' : COLORS.lightgreen, prop0 > 0 || prop1 > 1 ? 'gray' : COLORS.lightblue, prop0 > 0 || prop1 > 2 ? 'gray' : COLORS.lightred];
}

function Filter({ selectedProperties, setFilter, filters} : Props) : JSX.Element {
  return (
    <div id="Filter" className=" bg-white w-56 h-56 bottom-16 fixed z-5 right-4 flex flex-col justify-center items-center">
      <div className="w-5/6 h-5/6 flex">
        <div className="w-1/3 h-2/3">
          <Slider.Root
            value={[filters[selectedProperties[0]]]}
            onValueChange={(e: number[]) => {
              setFilter({
                [selectedProperties[0]]: Number.parseInt(`${e[0]}`)
              })
            }}
            className="relative flex items-center touch-none w-7 h-full flex-col"
            min={0}
            max={2}
            orientation="vertical">
              <span className="text-xs">{selectedProperties[0]}</span>
              <Slider.Track className="bg-black relative flex-grow-1 w-1 h-48">
                <Slider.Range  className="absolute bg-black rounded-r-full h-full"/>
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-black rounded-full shadow-sm" />
          </Slider.Root>
        </div>
        <div className="w-2/3 h-2/3 grid gap-0 grid-cols-3 grid-rows-3">
          {
            getFilterGridColors(filters[selectedProperties[0]], filters[selectedProperties[1]]).map(color => <span style={{backgroundColor: color}} />)
          }
        </div>
      </div>
      <div className="w-5/6 h-1/6 flex justify-end">
        <div className="w-2/3 h-1/3">
          <Slider.Root
              value={[filters[selectedProperties[1]]]}
              onValueChange={(e: number[]) => {
                setFilter({
                  [selectedProperties[1]]: Number.parseInt(`${e[0]}`)
                })
              }}
              className="relative flex items-right touch-none h-7 w-full flex-col"
              min={0}
              max={2}
              orientation="horizontal">
              <span className="text-xs">{selectedProperties[1]}</span>
                <Slider.Track className="bg-black relative flex-grow-1 w-full h-1">
                  <Slider.Range  className="absolute bg-black rounded-r-full w-full"/>
                </Slider.Track>
                <Slider.Thumb className="block w-7 h-7 bg-black rounded-full shadow-sm" />
            </Slider.Root>
        </div>
      </div>
    </div>
  );
}

export default Filter;
