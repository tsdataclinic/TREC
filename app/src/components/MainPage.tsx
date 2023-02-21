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
  access_to_hospital: 'Access to Hospital',
  jobs_cat: 'Access to Jobs',
  worker_vulnerability_cat: 'Vulnerable workers',
  risk_category: 'Flood Risk',
};

// TODO - use reducer
const AVAILABLE_LAYERS: Record<string, Layer> = {
  '1': {
    id: 1,
    layerName: 'Hospitals',
    layerURL: '/results/hospitals_v2.geojson',
    isVisible: true,
    hideToggle: false,
  },
  '2': {
    id: 2,
    layerName: 'Transit Stops',
    layerURL: '/results/stop_features_v6.geojson',
    isVisible: true,
    hideToggle: true,
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
      'risk_category',
      'access_to_hospital',
      'jobs_cat',
      'worker_vulnerability_cat',
    ]),
  );
  const [selectedProperties, setSelectedProperties] = useState<Array<string>>([
    'risk_category',
    'access_to_hospital',
  ]);
  const [filters, setFilters] = useState<Record<string, any>>({
    risk_category: 0,
    access_to_hospital: 0,
    jobs_cat: 0,
    worker_vulnerability_cat: 0,
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
          .map((f: any) => [
            '>=',
            ['get', f],
            isNaN(filters[f]) ? 0 : filters[f],
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
      <Filter
        filters={filters}
        setFilter={(value: Record<string, any>) =>
          setFilters({
            ...filters,
            ...value,
          })
        }
        selectedProperties={selectedProperties}
      />
    </main>
  );
}
