import { COLORS } from '../utils/sourceLayerConfigs';
import Slider from './ui/Slider';

type Props = {
  selectedProperties: Array<string>;
  setFilter: (value: Record<string, any>) => void;
  filters: Record<string, any>;
};

function getFilterGridColors(
  prop0: number,
  prop1: number,
): Array<COLORS | string> {
  return [
    prop0 > 2 || prop1 > 0 ? 'gray' : COLORS.darkgreen,
    prop0 > 2 || prop1 > 1 ? 'gray' : COLORS.darkblue,
    prop0 > 2 || prop1 > 2 ? 'gray' : COLORS.darkred,
    prop0 > 1 || prop1 > 0 ? 'gray' : COLORS.mediumgreen,
    prop0 > 1 || prop1 > 1 ? 'gray' : COLORS.mediumblue,
    prop0 > 1 || prop1 > 2 ? 'gray' : COLORS.mediumred,
    prop0 > 0 || prop1 > 0 ? 'gray' : COLORS.lightgreen,
    prop0 > 0 || prop1 > 1 ? 'gray' : COLORS.lightblue,
    prop0 > 0 || prop1 > 2 ? 'gray' : COLORS.lightred,
  ];
}

function Filter({
  selectedProperties,
  setFilter,
  filters,
}: Props): JSX.Element {
  return (
    <div
      id="Filter"
      className="bg-white w-56 h-56 bottom-16 fixed z-5 right-4 flex flex-col justify-center items-center"
    >
      <div className="w-5/6 h-5/6 flex">
        <div className="w-1/3 h-2/3">
          <Slider
            value={[filters[selectedProperties[0]]]}
            onValueChange={(e: number[]) => {
              setFilter({
                [selectedProperties[0]]: Number.parseInt(`${e[0]}`),
              });
            }}
            orientation="vertical"
            label={selectedProperties[0]}
          />
        </div>
        <div className="w-2/3 h-2/3 grid gap-0 grid-cols-3 grid-rows-3">
          {getFilterGridColors(
            filters[selectedProperties[0]],
            filters[selectedProperties[1]],
          ).map(color => (
            <span style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
      <div className="w-5/6 h-1/6 flex justify-end">
        <div className="w-2/3 h-1/3">
          <Slider
            value={[filters[selectedProperties[1]]]}
            onValueChange={(e: number[]) => {
              setFilter({
                [selectedProperties[1]]: Number.parseInt(`${e[0]}`),
              });
            }}
            orientation="horizontal"
            label={selectedProperties[1]}
          />
        </div>
      </div>
    </div>
  );
}

export default Filter;
