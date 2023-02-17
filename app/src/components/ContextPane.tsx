import { Layer, PROPERTY_LABELS, SelectedRoute } from './MainPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Dropdown from './ui/Dropdown';
import { RouteRecord } from '../utils/availableRoutes';

type Props = {
  availableProperties: Set<string>;
  setSelectedProperties: React.Dispatch<React.SetStateAction<string[]>>;
  selectedProperties: Array<string>;
  layers: Record<string, Layer>;
  updateLayer: (layer: Layer) => void;
  regions: Record<string, [number, number]>;
  setSelectedRegion: React.Dispatch<React.SetStateAction<[number, number]>>;
  routes: Array<Record<string, RouteRecord>>;
  selectedRoutes: SelectedRoute[];
  setSelectedRoutes: React.Dispatch<React.SetStateAction<Array<SelectedRoute>>>;
};

function ContextPane({
  layers,
  updateLayer,
  availableProperties,
  selectedProperties,
  setSelectedProperties,
  regions,
  setSelectedRegion,
  routes,
  selectedRoutes,
  setSelectedRoutes,
}: Props): JSX.Element {
  return (
    <div
      id="ContextPane"
      className="bg-white w-1/5 min-w-fit max-w-sm h-full shadow flex flex-col"
    >
      <div className="p-5 border-b border-b-slate-400">
        <select
          onChange={e => {
            setSelectedRegion(regions[e.target.value]);
          }}
          className="text-2xl"
        >
          {Object.keys(regions).map(r => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="px-4 space-y-4 pt-4 flex flex-col h-full overflow-scroll">
        <div className="border-b border-b-slate-300 pb-4">
          {Object.values(layers).map(layer => {
            return (
              <div className="space-x-2">
                <FontAwesomeIcon
                  onClick={() => {
                    updateLayer({
                      ...layer,
                      isVisible: !layer.isVisible,
                    });
                  }}
                  size="1x"
                  cursor={'pointer'}
                  icon={layer.isVisible ? faEye : faEyeSlash}
                  title={layer.isVisible ? 'Hide layer' : 'Show layer'}
                />
                <span>{layer?.layerName}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col space-y-2">
          <label>
            <div>
              <b>Climate Risk:</b>
            </div>
            <Dropdown
              disabled={true}
              className="!w-full"
              onChange={value =>
                setSelectedProperties([value, selectedProperties[1]])
              }
              placeholder="Select a field..."
              defaultValue={selectedProperties[0]}
              options={Array.from(availableProperties)
                .filter(p => p !== selectedProperties[1])
                .map(p => ({
                  value: p,
                  displayValue: PROPERTY_LABELS[p],
                }))}
            />
          </label>
          <label className="space-y-2 w-full">
            <div>
              <b>Transit Destination:</b>
            </div>

            <Dropdown
              className="!w-full"
              onChange={value =>
                setSelectedProperties([selectedProperties[0], value])
              }
              placeholder="Select a field..."
              defaultValue={selectedProperties[1]}
              options={Array.from(availableProperties)
                .filter(p => p !== selectedProperties[0])
                .map(p => ({
                  value: p,
                  displayValue: PROPERTY_LABELS[p],
                }))}
            />
          </label>
        </div>
        <hr />
        <div className="text-lg flex justify-between">
          <b>Filter by Transit Line</b>
          <button onClick={() => setSelectedRoutes([])}>Reset</button>
        </div>
        <div className="grid grid-cols-4 p-3 pb-0 gap-1">
          {selectedRoutes.map(route => (
            <span
              key={`${route.city}_${route.routeServiced}`}
              className="text-xs py-1 px-2 uppercase rounded bg-slate-200 uppercase"
              title={`${route.routeServiced} - ${route.routeType} | ${route.city}`}
            >
              {route.routeServiced}
            </span>
          ))}
        </div>
        <div className="overflow-y-scroll flex-1">
          <ul>
            {routes.map(availableRoute =>
              Object.values(availableRoute).map(routeRecord => {
                return (
                  <details key={routeRecord.city}>
                    <summary>{routeRecord.city} lines</summary>
                    {routeRecord.route_types.map((type, index) => {
                      return (
                        <details
                          className="ml-2"
                          key={`${routeRecord.city}_${index}`}
                        >
                          <summary>{type.route_type}</summary>
                          <ul className="ml-4">
                            {type.routes_serviced.map((route, index) => (
                              <li key={`${index}_${route}`}>
                                <input
                                  className="mr-2"
                                  onChange={e => {
                                    let newRoutes = [...selectedRoutes];
                                    if (e.target.checked) {
                                      newRoutes.push({
                                        city: routeRecord.city,
                                        routeType: type.route_type,
                                        routeServiced: route,
                                      });
                                    } else {
                                      const routeIndex = newRoutes.findIndex(
                                        r =>
                                          r.city === routeRecord.city &&
                                          r.routeType === type.route_type &&
                                          r.routeServiced === route,
                                      );
                                      newRoutes.splice(routeIndex, 1);
                                    }
                                    setSelectedRoutes(newRoutes);
                                  }}
                                  checked={selectedRoutes
                                    .map(r => r.routeServiced)
                                    .includes(route)}
                                  id={`${index}_${route}`}
                                  type="checkbox"
                                />
                                <label htmlFor={`${index}`}>{route}</label>
                              </li>
                            ))}
                          </ul>
                        </details>
                      );
                    })}
                  </details>
                );
              }),
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ContextPane;
