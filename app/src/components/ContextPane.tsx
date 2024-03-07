import { Layer, PROPERTY_LABELS, SelectedRoute } from './MainPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCircleInfo, faArrowRotateLeft, faShuffle, faDownload, } from '@fortawesome/free-solid-svg-icons';
import Dropdown from './ui/Dropdown';
import { Cities } from '../libs/cities';
import { RouteRecord } from '../hooks/useAvailableRoutes';
import Select from './ui/Select';
import { CityRecord } from '../hooks/useAvailableCities';
import Button from './ui/Button';

type Props = {
  availableProperties: Set<string>;
  setSelectedProperties: React.Dispatch<React.SetStateAction<string[]>>;
  selectedProperties: Array<string>;
  layers: Record<string, Layer>;
  updateLayer: (layer: Layer) => void;
  cities: Array<CityRecord> | undefined;
  availableCitiesLoadingStatus: string;
  selectedCity: CityRecord;
  setSelectedCity: React.Dispatch<React.SetStateAction<CityRecord>>;
  routes: RouteRecord[];
  selectedRoutes: SelectedRoute[];
  setSelectedRoutes: React.Dispatch<React.SetStateAction<Array<SelectedRoute>>>;
  setIsInstructionalModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  downloadCityDataURI: string | undefined;
};

function ContextPane({
  layers,
  updateLayer,
  availableProperties,
  selectedProperties,
  setSelectedProperties,
  cities,
  availableCitiesLoadingStatus,
  selectedCity,
  setSelectedCity,
  routes,
  selectedRoutes,
  setSelectedRoutes,
  setIsInstructionalModalOpen,
  downloadCityDataURI
}: Props): JSX.Element {
  return (
    <div
      id="ContextPane"
      className="bg-white w-full min-w-fit h-fit shadow flex flex-col sm:overflow-y-hidden sm:h-full sm:max-w-sm sm:w-1/5"
    >
      <div className="p-5 border-b border-b-slate-400 w-full flex flex-col items-center justify-between space-y-4">
        <Select
          selectedCity={selectedCity}
          onChange={e => {
            setSelectedCity(e);
          }}
          className="text-xl w-full max-w-full block  whitespace-nowrap text-ellipsis"
          defaultValue={'Jump to a city...'}
          options={cities ?? []}
          isLoading={availableCitiesLoadingStatus}
        />
        <div className='flex flex-row w-full justify-evenly'>
          <Button
            onClick={() => {
              if (cities) {
                setSelectedCity(cities[Math.floor(Math.random()*cities.length)]);
              }
            }}
            className="flex items-center space-x-2">
            <FontAwesomeIcon
              className=""
              size="1x"
              cursor={'pointer'}
              icon={faShuffle}
            />
            <label>Random</label>
          </Button>
          <a
            aria-disabled={downloadCityDataURI ? false : true}
            className={`flex items-center px-2 ${downloadCityDataURI ? '' : 'text-gray-400 cursor-not-allowed' }`}
            href={downloadCityDataURI}>
            <FontAwesomeIcon
              className="mr-2"
              size="1x"
              cursor={'pointer'}
              icon={faDownload}
            />
            Download city data
          </a>
        </div>
      </div>

      <div className="p-4 space-y-4 pt-4 flex flex-col h-full sm:overflow-y-hidden">
        <div className="border-b border-b-slate-300 pb-4">
          {Object.values(layers)
            .filter(layer => !layer.hideToggle)
            .map(layer => {
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
          <label className="space-y-2">
            <div>
              <b>Climate Risk:</b>
            </div>
            <Dropdown
              disabled={false}
              className="!w-full"
              onChange={value =>
                setSelectedProperties([value, selectedProperties[1]])
              }
              placeholder="Select a field..."
              defaultValue={selectedProperties[0]}
              options={Array.from(availableProperties).slice(0, 3)
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
              onChange={value => {
                const hospitalLayer = Object.values(layers).find(
                  (layer: Layer) =>
                    layer.layerName.toLowerCase().includes('hospital'),
                );
                if (hospitalLayer) {
                  updateLayer({
                    ...hospitalLayer,
                    isVisible: value === 'access_to_hospital_category',
                  });
                }

                setSelectedProperties([selectedProperties[0], value]);
              }}
              placeholder="Select a field..."
              defaultValue={selectedProperties[1]}
              options={Array.from(availableProperties).slice(3, 6)
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
          <b>Filter Transit Lines ({selectedRoutes.length} of 3)</b>
          <button onClick={() => setSelectedRoutes([])}>Reset</button>
        </div>
        {selectedRoutes.length > 0 ? (
          <div className="grid grid-cols-4 px-3 gap-1">
            {selectedRoutes.map(route => (
              <span
                key={`${route.city}_${route.routeServiced}`}
                className="text-xs py-1 px-2 rounded bg-slate-200 uppercase"
                title={`${route.routeServiced} - ${route.routeType} | ${route.city}`}
              >
                {route.routeServiced}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex-1 sm:overflow-y-scroll">
          {!selectedCity.msa_name && <div>Select a city to see its transit lines!</div>}
          <ul>
            {routes && 
              routes.map(route => {
                if (route.msa_id === selectedCity?.msa_id) {
                  return <details key={route.city} className="pb-2">
                    <summary className="pb-1">{route.display_name} lines</summary>
                    {
                      Object.values(route.route_types).map((route_type_obj) => {
                        if (route_type_obj.route_type === 'Subway') return <></>;
                        return <details
                          className="ml-2 pb-1"
                          key={`${route.city}_${route_type_obj}`}
                        >
                          <summary>{route_type_obj.route_type}</summary>
                          <ul className="ml-4">
                            {route_type_obj.routes_serviced.map((route_serviced, index) => (
                              <li key={`${index}_${route_serviced}`}>
                                <label>
                                  <input
                                    className='mr-2'
                                    onChange={e => {
                                      let newRoutes = [...selectedRoutes];
                                      if (e.target.checked) {
                                        newRoutes.push({
                                          city: route.city,
                                          msa_id: route.msa_id,
                                          routeType: route_type_obj.route_type,
                                          routeServiced: route_serviced,
                                        });
                                      } else {
                                        const routeIndex = newRoutes.findIndex(
                                          r =>
                                            r.city === route.city &&
                                            r.routeType === route_type_obj.route_type &&
                                            r.routeServiced === route_serviced,
                                        );
                                        newRoutes.splice(routeIndex, 1);
                                      }
                                      setSelectedRoutes(newRoutes);
                                    }}
                                    disabled={selectedRoutes.length > 2 && !selectedRoutes
                                      .map(r => r.routeServiced)
                                      .includes(route_serviced)}
                                    checked={selectedRoutes
                                      .map(r => r.routeServiced)
                                      .includes(route_serviced)}
                                    id={`${index}_${route_serviced}`}
                                    type='checkbox'
                                  />
                                  {route_serviced}
                                </label>
                              </li>
                            ))}
                          </ul>
                        </details>
                      })
                    }
                  </details>
                }
                return <></>
              })
            }
          </ul>
        </div>
        <div>
          <FontAwesomeIcon
              onClick={() => setIsInstructionalModalOpen(true)}
              size="2x"
              cursor={'pointer'}
              icon={faCircleInfo}
              title={'Help'}
            />
        </div>
      </div>
    </div>
  );
}

export default ContextPane;
