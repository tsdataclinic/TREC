import { useCallback, useEffect, useState } from "react";
import ContextPane from "./ContextPane";
import Filter from "./Filter";
import MapComponent from "./MapComponent";
import {
  useRemoteLayers,
  useRemoteLayerPropertyValues,
} from "../hooks/useRemoteLayer";
import { useSourceLayerConfigs } from "../utils/sourceLayerConfigs";

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
};

// TODO - use reducer
const AVAILABLE_LAYERS: Record<string, Layer> = {
  "1": {
    id: 1,
    layerName: "hospitals",
    layerURL: "/results/hospitals.geojson",
    isVisible: true,
  },
  "2": {
    id: 2,
    layerName: "stop_features",
    layerURL: "/results/stop_features.geojson",
    isVisible: true,
  },
};

const AVAILABLE_REGIONS : Record<string, [number, number]> = {
  "New York City": [-73.95, 40.72],
  "Hampton Roads": [-76.39, 36.96],
}

export default function MainPage(): JSX.Element {
  const [selectedRegion, setSelectedRegion] = useState<[number, number]>(AVAILABLE_REGIONS['New York City']);
  const [availableProperties, setAvailableProperties] = useState<Set<string>>(
    new Set([
      // "risk_score",
      // "risk_category",
      "access_to_hospital",
      // "route_type",
      // "routes_serviced",
      // "jobs",
      "jobs_cat",
    ])
  );
  const [selectedProperties, setSelectedProperties] = useState<Array<string>>([
    "risk_category",
    "access_to_hospital",
  ]);
  const [filters, setFilters] = useState<Record<string, any>>({
    "risk_category": 0,
    "access_to_hospital": 0,
    "jobs_cat": 0,
  });

  // const [selectedRoutes, setSelectedRoutes] = useState();
  // const [selectedRanges, setSelectedRanges] = useState([[], []])
  const [layers, setLayers] = useState(AVAILABLE_LAYERS);
  let remoteLayers = useRemoteLayers(layers);
  // let remoteLayerPropertyValues = useRemoteLayerPropertyValues(remoteLayers, selectedProperties);
  let sourceLayerConfigs = useSourceLayerConfigs(
    selectedProperties,
    [['all',
      ...Object.keys(filters).filter(f => selectedProperties.includes(f)).map((f: any) => ['>=', ['get', f], isNaN(filters[f]) ? 0 : filters[f]])
    ]]
  );

  const updateLayer = useCallback(
    (newLayer: Layer) => {
      let updatedLayers = { ...layers };
      updatedLayers[newLayer.id] = newLayer;
      setLayers(updatedLayers);
    },
    [layers]
  );

  return (
    <main className="h-full flex">
      <ContextPane
        regions={AVAILABLE_REGIONS}
        setSelectedRegion={setSelectedRegion}
        layers={layers}
        updateLayer={updateLayer}
        availableProperties={availableProperties}
        selectedProperties={selectedProperties}
        setSelectedProperties={setSelectedProperties}
      />
      <MapComponent
        center={selectedRegion}
        layers={layers}
        remoteLayers={remoteLayers}
        sourceLayerConfigs={sourceLayerConfigs}
      />
      <Filter
        filters={filters}
        setFilter={(value: Record<string, any>) => setFilters({
          ...filters,
          ...value
        })}
        selectedProperties={selectedProperties} />
    </main>
  );
}
