import { useCallback, useState } from 'react';
import ContextPane from './components/ContextPane';
import Filter from './components/Filter';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import { useRemoteLayers, useRemoteLayerPropertyValues } from './hooks/useRemoteLayer';
import { useSourceLayerConfigs } from './utils/sourceLayerConfigs';

export type Layer = {
  id: number;
  layerName: string;
  layerURL: string;
  isVisible: boolean;
};

export type RemoteLayer = {
  data: any;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// TODO - use reducer
const AVAILABLE_LAYERS: Record<string, Layer> = {
  "1": {
    id: 1,
    layerName: 'hospitals',
    layerURL: '/results/hospitals.geojson',
    isVisible: true
  },
  "2": {
    id: 2,
    layerName: 'stop_features',
    layerURL: '/results/stop_features.geojson',
    isVisible: true
  },
};

function App() {
  const [availableProperties, setAvailableProperties] = useState<Set<string>>(
    new Set(["risk_score", "risk_category", "access_to_hospital", "route_type", "routes_serviced", "jobs", "jobs_cat"])
  );
  const [selectedProperties, setSelectedProperties] = useState<Array<string>>(['risk_category', 'access_to_hospital']);
  // const [selectedRanges, setSelectedRanges] = useState([[], []])
  const [layers, setLayers] = useState(AVAILABLE_LAYERS);
  let remoteLayers = useRemoteLayers(layers);
  // let remoteLayerPropertyValues = useRemoteLayerPropertyValues(remoteLayers, selectedProperties);
  let sourceLayerConfigs = useSourceLayerConfigs();//(layers, remoteLayers, remoteLayerPropertyValues);

  const updateLayer = useCallback((newLayer: Layer) => {
    let updatedLayers = { ...layers };
    updatedLayers[newLayer.id] = newLayer;
    setLayers(updatedLayers);
  }, [layers]);

  return <div>
    <Header />
    <main>
      <ContextPane
        layers={layers}
        updateLayer={updateLayer}
        availableProperties={availableProperties}
        selectedProperties={selectedProperties}
        setSelectedProperties={setSelectedProperties} />
      <MapComponent
        layers={layers}
        remoteLayers={remoteLayers}
        sourceLayerConfigs={sourceLayerConfigs} />
      <Filter 
        selectedProperties={selectedProperties} />
    </main>
  </div>
}

export default App;

