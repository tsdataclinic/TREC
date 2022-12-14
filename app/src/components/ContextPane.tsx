import { Layer } from './MainPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Dropdown from './ui/Dropdown';

type Props = {
  availableProperties: Set<string>;
  setSelectedProperties: React.Dispatch<React.SetStateAction<string[]>>;
  selectedProperties: Array<string>;
  layers: Record<string, Layer>;
  updateLayer: (layer: Layer) => void;
  regions: Record<string, [number, number]>;
  setSelectedRegion: React.Dispatch<React.SetStateAction<[number, number]>>;
};

function ContextPane({
  layers,
  updateLayer,
  availableProperties,
  selectedProperties,
  setSelectedProperties,
  regions,
  setSelectedRegion,
}: Props): JSX.Element {
  return (
    <div
      id="ContextPane"
      className="bg-white w-1/5 min-w-fit max-w-sm h-full shadow"
    >
      {/* TODO - move map to centroid of selected area on select */}
      <div className="p-4 border-b border-b-slate-400">
        <select
          onChange={e => {
            setSelectedRegion(regions[e.target.value]);
          }}
          className="text-2xl"
        >
          {Object.keys(regions).map(r => (
            <option value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="px-4 space-y-4 pt-4">
        {/* <div className="text-lg">Select transit routes</div> */}
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
            <select
              disabled={true}
              className="ml-2"
              onChange={e =>
                setSelectedProperties([e.target.value, selectedProperties[1]])
              }
              placeholder={'Select a field...'}
              defaultValue={selectedProperties[0]}
            >
              <option></option>
              {Array.from(availableProperties).map(p => (
                <option selected={p === selectedProperties[0]}>{p}</option>
              ))}
            </select>
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
              options={Array.from(availableProperties).map(p => ({
                value: p,
                displayValue: p,
              }))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default ContextPane;
