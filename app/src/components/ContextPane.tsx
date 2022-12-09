import { Layer } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
type Props = {
  availableProperties: Set<string>;
  setSelectedProperties: React.Dispatch<React.SetStateAction<string[]>>;
  selectedProperties: Array<string>;
  layers: Record<string, Layer>;
  updateLayer: (layer: Layer) => void;
};

function ContextPane({
  layers,
  updateLayer,
  availableProperties,
  selectedProperties,
  setSelectedProperties,
}: Props): JSX.Element {
  return (
    <div
      id="ContextPane"
      className="bg-white w-96 h-5/6 t-100 fixed z-50 left-5 rounded-md"
    >
      {/* TODO - move map to centroid of selected area on select */}
      <select className="text-2xl">
        <option>New York City area</option>
        <option>Hampton Roads area</option>
      </select>
      <hr />
      {/* <div className="text-lg">Select transit routes</div> */}
      {Object.values(layers).map((layer) => {
        return (
          <div>
            <FontAwesomeIcon
              onClick={() => {
                updateLayer({
                  ...layer,
                  isVisible: !layer.isVisible,
                });
              }}
              size="1x"
              cursor={"pointer"}
              icon={layer.isVisible ? faEye : faEyeSlash}
              title={layer.isVisible ? "Hide layer" : "Show layer"}
            />
            {layer?.layerName}
          </div>
        );
      })}
      <hr />
      <div>
        <div>
          <label>
            Field 1:
            <select
              className="ml-2"
              onChange={(e) =>
                setSelectedProperties([e.target.value, selectedProperties[1]])
              }
              placeholder={"Select a field..."}
              defaultValue={selectedProperties[0]}
            >
              <option></option>
              {Array.from(availableProperties).map((p) => (
                <option selected={p === selectedProperties[0]}>{p}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Field 2:
            <select
              className="ml-2"
              onChange={(e) =>
                setSelectedProperties([selectedProperties[0], e.target.value])
              }
              placeholder={"Select a field..."}
              defaultValue={selectedProperties[1]}
            >
              <option></option>
              {Array.from(availableProperties).map((p) => (
                <option selected={p === selectedProperties[1]}>{p}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default ContextPane;
