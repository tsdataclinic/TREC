import { useCallback, useEffect, useState } from 'react';
import ContextPane from './ContextPane';
import RouteSummaryPane from './RouteSidebar';
import Filter from './Filter';
import MapComponent from './MapComponent';
import {
  useRemoteLayers,
  useRemoteLayerPropertyValues,
} from '../hooks/useRemoteLayer';
import { useSourceLayerConfigs } from '../utils/sourceLayerConfigs';
import { AVAILABLE_ROUTES } from '../utils/availableRoutes';
import { RouteSummary, useRouteSummary } from '../hooks/useRouteSummary';
import * as Fathom from "fathom-client";

export type Layer = {
  id: number;
  layerName: string;
  sourceLayer?: string;
  layerURL: string;
  isVisible: boolean;
  hideToggle: boolean;
};

export type RemoteLayer = {
  data: any;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
};

export type SelectedRoute = {
  city: string;
  routeType: string;
  routeServiced: string;
};

export const PROPERTY_LABELS: Record<string, string> = {
  access_to_hospital_category: 'Access to Hospital',
  job_access_category: 'Access to Jobs',
  worker_vulnerability_category: 'Vulnerable workers',
  flood_risk_category: 'Flood Risk',
};

// TODO - use reducer
const AVAILABLE_LAYERS: Record<string, Layer> = {
  '1': {
    id: 1,
    layerName: 'Transit Stops',
    layerURL: '/results/stop_features.geojson',
    isVisible: true,
    hideToggle: true,
  },
  '2': {
    id: 2,
    layerName: 'Hospitals',
    layerURL: '/results/hospitals.geojson',
    isVisible: true,
    hideToggle: false,
  },
  // "2": {
  //   id: 2,
  //   layerName: "NYC Transit Stops",
  //   layerURL: "/results/NYC-stop_features_v3.geojson",
  //   isVisible: true,
  // },
  // "3": {
  //   id: 3,
  //   layerName: "Hampton Roads Transit Stops",
  //   layerURL: "/results/HR-stop_features_v3.geojson",
  //   isVisible: true,
  // },
  '4': {
    id: 4,
    layerName: '2050 Hampton Roads Floods (Projected)',
    layerURL: 'mapbox://indraneel-tsdataclinic.9hi3xl8q',
    isVisible: false,
    sourceLayer: 'hr_2050_flood_zones',
    hideToggle: false,
  },
  '5': {
    id: 5,
    layerName: '2050 NYC Floods (Projected)',
    layerURL: 'mapbox://indraneel-tsdataclinic.1ku89xc7',
    isVisible: false,
    sourceLayer: 'nyc_2050_flooding',
    hideToggle: false,
  },
};

const AVAILABLE_REGIONS: Record<string, [number, number]> = {
  'New York City': [-73.95, 40.72],
  'Hampton Roads': [-76.39, 36.96],
};

export default function MainPage(): JSX.Element {
  const [selectedRegion, setSelectedRegion] = useState<[number, number]>(
    AVAILABLE_REGIONS['New York City'],
  );
  const [availableProperties, setAvailableProperties] = useState<Set<string>>(
    new Set([
      'flood_risk_category',
      'access_to_hospital_category',
      'job_access_category',
      'worker_vulnerability_category',
    ]),
  );
  const [selectedProperties, setSelectedProperties] = useState<Array<string>>([
    'flood_risk_category',
    'access_to_hospital_category',
  ]);
  const [filters, setFilters] = useState<Record<string, any>>({
    flood_risk_category: [0, 2],
    access_to_hospital_category: [0, 2],
    job_access_category: [0, 2],
    worker_vulnerability_category: [0, 2],
  });

  const [selectedRoutes, setSelectedRoutes] = useState<Array<SelectedRoute>>(
    [],
  );
  const [detailedRoutes, setDetailedRoutes] = useState<SelectedRoute>({
    city: '',
    routeType: '',
    routeServiced: '',
  });

  const [layers, setLayers] = useState(AVAILABLE_LAYERS);
  let remoteLayers = useRemoteLayers(layers);
  // console.log(remoteLayers)
  let routeSummary = useRouteSummary(remoteLayers, detailedRoutes);
  // console.log(routeSummary)
  // let remoteLayerPropertyValues = useRemoteLayerPropertyValues(remoteLayers, selectedProperties);

  let sourceLayerConfigs = useSourceLayerConfigs(
    selectedProperties,
    // TODO - generate mapbox expressions inside hook body or in another function
    [
      [
        'all',
        ...Object.keys(filters)
          .filter(f => selectedProperties.includes(f))
          .map(x => { 
            return x
          })
          .map((f: any) => [
            'all',
            [
              '<=',
              ['get', f],
              isNaN(filters[f][1]) ? 0 : filters[f][1],
            ],
            [
              '>=',
              ['get', f],
              isNaN(filters[f][0]) ? 0 : filters[f][0],
            ]
          ]),

        ...(selectedRoutes.length > 0
          ? [
              [
                'any',
                ...selectedRoutes.map(selectedRoute => [
                  'all',
                  ['==', ['get', 'city'], selectedRoute.city],
                  ['==', ['get', 'route_type'], selectedRoute.routeType],
                  // ['in'] expression doesn't work properly in a comma-separated list, so used 'index-of' instead
                  [
                    'in',
                    selectedRoute.routeServiced,
                    ['get', 'routes_serviced'],
                  ],
                  // ['>=', ['index-of', selectedRoute.routeServiced, ['get', 'routes_serviced']], 0],
                ]),
              ],
            ]
          : []),
      ],
    ],
  );

  const updateLayer = useCallback(
    (newLayer: Layer) => {
      let updatedLayers = { ...layers };
      updatedLayers[newLayer.id] = newLayer;
      setLayers(updatedLayers);
    },
    [layers],
  );

  useEffect(() => {
    Fathom.load("LHGHXYKE")
  }, [])

  return (
    <main className="flex flex-col-reverse overflow-scroll sm:overflow-hidden sm:flex-row sm:h-full">
      <Filter
        filters={filters}
        setFilter={(value: Record<string, any>) => {
          setFilters({
            ...filters,
            ...value,
          })
        }
        }
        selectedProperties={selectedProperties}
      />
      <ContextPane
        regions={AVAILABLE_REGIONS}
        setSelectedRegion={setSelectedRegion}
        layers={layers}
        updateLayer={updateLayer}
        availableProperties={availableProperties}
        selectedProperties={selectedProperties}
        setSelectedProperties={setSelectedProperties}
        routes={AVAILABLE_ROUTES}
        selectedRoutes={selectedRoutes}
        setSelectedRoutes={setSelectedRoutes}
      />
      {detailedRoutes.city != '' && (
        <RouteSummaryPane
          routeSummary={routeSummary}
          detailedRoutes={detailedRoutes}
          setDetailedRoutes={setDetailedRoutes}
        />
      )}
      <MapComponent
        center={selectedRegion}
        layers={layers}
        remoteLayers={remoteLayers}
        sourceLayerConfigs={sourceLayerConfigs}
        setDetailedRoutes={setDetailedRoutes}
      />

    </main>
  );
}
