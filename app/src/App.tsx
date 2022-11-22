import { useEffect, useState } from 'react';
import ContextPane from './components/ContextPane';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import { useRemoteLayers } from './hooks/useRemoteLayer';
import { SOURCE_LAYER_CONFIG } from './utils/sourceLayerConfigs';

export type Layer = {
  id: number;
  layerName: string;
  layerURL: string;
  isVisible: boolean;
  sourceLayerConfig: Array<any>
};

export type RemoteLayer = {
  data: any;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// TODO - use the state/reducer pattern
const AVAILABLE_LAYERS: Record<string, Layer> = {
  "1": { id: 1, layerName: 'hospitals', layerURL: '/results/hospitals.geojson', isVisible: true, sourceLayerConfig: SOURCE_LAYER_CONFIG['hospitals']},
  "2": { id: 2, layerName: 'hampton_roads_stops', layerURL: '/results/hampton_roads/stops_w_hosp.geojson', isVisible: true, sourceLayerConfig: SOURCE_LAYER_CONFIG['hampton_roads_stops']},
  "3": { id: 3, layerName: 'nyc_stops', layerURL: '/results/nyc/stops_w_hosp.geojson', isVisible: true, sourceLayerConfig: SOURCE_LAYER_CONFIG['nyc_stops']},
  // "1": { id: 1, layerName: 'hospitals', layerURL: '/nyc/hospitals.geojson' , isVisible: true},
  // "2": { id: 2, layerName: 'nta_pct', layerURL: '/nyc/nta_pct.geojson', isVisible: true},
  // "3": { id: 3, layerName: 'routes_w_hosp', layerURL: '/nyc/routes_w_hosp.geojson', isVisible: false},
  // "4": { id: 4, layerName: 'stops_w_hosp', layerURL: '/nyc/stops_w_hosp.geojson', isVisible: true},

};

function App() {
  const [layers, setLayers] = useState(AVAILABLE_LAYERS);
  let remoteLayers = useRemoteLayers(layers);

  const updateLayer = (newLayer: Layer) => {
    let updatedLayers = { ...layers };
    updatedLayers[newLayer.id] = newLayer;
    setLayers(updatedLayers);
  }

  return <div>
    <Header />
    <main>
      <ContextPane layers={layers} updateLayer={updateLayer} />
      <MapComponent layers={layers} remoteLayers={remoteLayers} />
    </main>
  </div>
}

export default App;
