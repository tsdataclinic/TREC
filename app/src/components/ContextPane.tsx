import { Layer } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
type Props = {
  layers: Record<string, Layer>;
  updateLayer: (layer: Layer) => void
}

function ContextPane({ layers, updateLayer } : Props) : JSX.Element {
  return (
    <div id="ContextPane" className="bg-white w-72 h-5/6 t-100 fixed z-50 right-5 rounded-md">
      {/* <div className="text-lg">Select transit routes</div> */}
      {Object.values(layers).map((layer) => {
        // if (layer && layer.data)
        return <div>
          <FontAwesomeIcon onClick={() => { 
              updateLayer({
                  ...layer,
                  isVisible: !layer.isVisible
              })
            }}
              size="1x"
              cursor={'pointer'}
              icon={layer.isVisible ? faEye : faEyeSlash}
              title={layer.isVisible ? 'Hide layer' : 'Show layer'}
            />
          {layer?.layerName}
        </div>
      })}
    </div>
  );
}

export default ContextPane;
