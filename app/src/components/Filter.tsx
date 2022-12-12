import * as Slider from "@radix-ui/react-slider";
import { COLORS } from "../utils/sourceLayerConfigs";

type Props = {
  selectedProperties: Array<string>;
  setFilter: (value: Record<string, any>) =>  void;
}

function Filter({ selectedProperties, setFilter} : Props) : JSX.Element {
  return (
    <div id="Filter" className=" bg-white w-56 h-56 bottom-16 fixed z-5 right-4 flex flex-col justify-center items-center">
      <div className="w-5/6 h-5/6 flex">
        <div className="w-1/3 h-2/3">
          <Slider.Root
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
          <span style={{backgroundColor: COLORS.darkgreen}}></span>
          <span style={{backgroundColor: COLORS.darkblue}}></span>
          <span style={{backgroundColor: COLORS.darkred}}></span>
          <span style={{backgroundColor: COLORS.mediumgreen}}></span>
          <span style={{backgroundColor: COLORS.mediumblue}}></span>
          <span style={{backgroundColor: COLORS.mediumred}}></span>
          <span style={{backgroundColor: COLORS.lightgreen}}></span>
          <span style={{backgroundColor: COLORS.lightblue}}></span>
          <span style={{backgroundColor: COLORS.lightred}}></span>
        </div>
      </div>
      <div className="w-5/6 h-1/6 flex justify-end">
        <div className="w-2/3 h-1/3">
          <Slider.Root
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
