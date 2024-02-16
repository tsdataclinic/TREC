import { COLORS } from '../utils/sourceLayerConfigs';
import { PROPERTY_LABELS } from './MainPage';
import Slider from './ui/Slider';

type Props = {
  selectedProperties: Array<string>;
  setFilter: (value: Record<string, any>) => void;
  filters: Record<string, any>;
};

export function getFilterGridColors(
  prop0: number[],
  prop1: number[],
): Array<COLORS | string> {
  return [
    (prop0[1] < 2 || prop0[0] > 2) || (prop1[1] < 0 || prop1[0] > 0) ? 'white' : COLORS.darkgreen,
    (prop0[1] < 2 || prop0[0] > 2) || (prop1[1] < 1 || prop1[0] > 1) ? 'white' : COLORS.darkpurple,
    (prop0[1] < 2 || prop0[0] > 2) || (prop1[1] < 2 || prop1[0] > 2) ? 'white' : COLORS.darkred,
    (prop0[1] < 1 || prop0[0] > 1) || (prop1[1] < 0 || prop1[0] > 0) ? 'white' : COLORS.mediumgreen,
    (prop0[1] < 1 || prop0[0] > 1) || (prop1[1] < 1 || prop1[0] > 1) ? 'white' : COLORS.mediumpurple,
    (prop0[1] < 1 || prop0[0] > 1) || (prop1[1] < 2 || prop1[0] > 2) ? 'white' : COLORS.mediumred,
    (prop0[1] < 0 || prop0[0] > 0) || (prop1[1] < 0 || prop1[0] > 0) ? 'white' : COLORS.lightgreen,
    (prop0[1] < 0 || prop0[0] > 0) || (prop1[1] < 1 || prop1[0] > 1) ? 'white' : COLORS.lightpurple,
    (prop0[1] < 0 || prop0[0] > 0) || (prop1[1] < 2 || prop1[0] > 2) ? 'white' : COLORS.lightred,
  ];
}

function Filter({
  selectedProperties,
  setFilter,
  filters,
}: Props): JSX.Element {
  const colorGrid = (
    <div className="w-full h-full grid gap-0 grid-cols-3 grid-rows-3">
      {getFilterGridColors(
        filters[selectedProperties[0]],
        filters[selectedProperties[1]],
      ).map((color, i) => (
        <span key={i} className="border-gray-95 border-2" style={{ backgroundColor: color }} />
      ))}
    </div>
  );

  return (
    <div
      id="Filter"
      className="bg-white w-60 h-60 flex flex-col mt-5 mx-auto sm:bottom-16 sm:fixed sm:z-10 sm:right-4"
    >
      <div className="grid grid-cols-4 grid-rows-4 h-full p-3 pb-0">
        <div className="row-span-3">
          <Slider
            value={filters[selectedProperties[0]]}
            onValueChange={(e: number[]) => {
              setFilter({
                [selectedProperties[0]]: e // Number.parseInt(`${e[0]}`),
              });
            }}
            orientation="vertical"
            label={PROPERTY_LABELS[selectedProperties[0]]}
          />
        </div>
        <div className="col-span-3 row-span-3">{colorGrid}</div>
        <div className="col-start-2 col-span-3 pt-1">
          <Slider
            value={filters[selectedProperties[1]]}
            onValueChange={(e: number[]) => {
              setFilter({
                [selectedProperties[1]]: e //Number.parseInt(`${e[0]}`),
              });
            }}
            orientation="horizontal"
            label={PROPERTY_LABELS[selectedProperties[1]]}
          />
        </div>
      </div>
    </div>
  );
}

export default Filter;
