import { useCallback, useEffect, useState } from 'react';
import ContextPane from './ContextPane';
import RouteSummaryPane from './RouteSidebar';
import Filter from './Filter';
import MapComponent from './MapComponent';
import {
  useRemoteLayers,
} from '../hooks/useRemoteLayer';
import { useSourceLayerConfigs } from '../utils/sourceLayerConfigs';
import { useRouteSummary } from '../hooks/useRouteSummary';
import * as Fathom from "fathom-client";
import { Cities } from '../libs/cities';
import { useAvailableCities } from '../hooks/useAvailableCities';
import { useAvailableRoutes } from '../hooks/useAvailableRoutes';
import { useRemoteRouteFilter } from '../hooks/useRemoteRouteFilter';
import usePrevious from '../hooks/usePrevious';
import { useRemoteRouteSummary } from '../hooks/useRemoteRouteSummary';
import Modal from './ui/Modal';

const BACKEND_URI = process.env.REACT_APP_PROD_BACKEND_URI ?? process.env.REACT_APP_DEV_BACKEND_URI;
const BACKEND_TILESERVER_URI = process.env.REACT_APP_PROD_TILESERVER_URI ?? process.env.REACT_APP_DEV_TILESERVER_URI;

export type Layer = {
  id: number;
  layerName: string;
  sourceLayer?: string;
  layerURL?: string;
  tileURL?: string;
  isVisible: boolean;
  hideToggle: boolean;
  city?: Cities;
};

export type RemoteLayer = {
  data: any;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void
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
  heat_risk_category: 'Heat Risk',
  fire_risk_category: 'Fire Risk',
};

// TODO - use reducer
const AVAILABLE_LAYERS: Record<string, Layer> = {
  '1': {
    id: 1,
    layerName: 'Transit Stops',
    tileURL: `${BACKEND_TILESERVER_URI}/stop_features`,
    sourceLayer: 'stop_features',
    isVisible: true,
    hideToggle: true,
  },
  '2': {
    id: 2,
    layerName: 'Hospitals',
    tileURL: `${BACKEND_TILESERVER_URI}/hospitals`,
    sourceLayer: 'hospitals',
    isVisible: true,
    hideToggle: false,
  },
  '3': {
    id: 3,
    layerName: '2050 Hampton Roads Floods (Projected)',
    layerURL: 'mapbox://indraneel-tsdataclinic.9hi3xl8q',
    isVisible: false,
    sourceLayer: 'hr_2050_flood_zones',
    hideToggle: false,
    city: Cities.HamptonRoads,
  },
  '4': {
    id: 4,
    layerName: '2050 NYC Floods (Projected)',
    layerURL: 'mapbox://indraneel-tsdataclinic.1ku89xc7',
    isVisible: false,
    sourceLayer: 'nyc_2050_flooding',
    hideToggle: false,
    city: Cities.NewYorkCity,
  },
  '5': {
    id: 5,
    layerName: 'Philadelphia Current FEMA Flood Layer',
    layerURL: 'mapbox://indraneel-tsdataclinic.5b5bn5hs',
    isVisible: false,
    sourceLayer: 'phi_processed_fema',
    hideToggle: false,
    city: Cities.Philadelphia,
  },
  '6': {
    id: 6,
    layerName: 'New Orleans Current FEMA Flood Layer',
    layerURL: 'mapbox://indraneel-tsdataclinic.6hr9lz8d',
    isVisible: false,
    sourceLayer: 'nola_processed_fema',
    hideToggle: false,
    city: Cities.NewOrleans,
  },
  '7': {
    id: 7,
    layerName: 'Pittsburgh Current FEMA Flood Layer',
    layerURL: 'mapbox://indraneel-tsdataclinic.5pmuaism',
    isVisible: false,
    sourceLayer: 'pitt_processed_fema',
    hideToggle: false,
    city: Cities.Pittsburgh,
  },
  '8': {
    id: 8,
    layerName: 'SF Current FEMA Flood Layer',
    layerURL: 'mapbox://indraneel-tsdataclinic.3c847icg',
    isVisible: false,
    sourceLayer: 'sf_processed_fema-125s1o',
    hideToggle: false,
    city: Cities.SanFrancisco,
  },
};


export default function MainPage(): JSX.Element {
  const availableRoutes = useAvailableRoutes();
  const availableCities = useAvailableCities();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [isInstructionalModalOpen, setIsInstructionalModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<Cities>(Cities.NewYorkCity);
  const previousSelectedCity = usePrevious(selectedCity);
  const [availableProperties, setAvailableProperties] = useState<Set<string>>(
    new Set([
      'flood_risk_category',
      'fire_risk_category',
      'heat_risk_category',
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
    fire_risk_category: [0, 2],
    heat_risk_category: [0, 2],
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
  let remoteLayers = useRemoteLayers(layers, selectedCity);
  let {data: remoteSelectedRoutes, status: remoteRouteFilterStatus } = useRemoteRouteFilter(selectedRoutes);
  let {data: routeSummaryNew, status} = useRemoteRouteSummary(detailedRoutes.city, detailedRoutes.routeServiced);

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

        ...(selectedRoutes.length > 0 && remoteRouteFilterStatus === 'success'
          ? [
              [
                "in",
                ["get", "stop_id"],
                ["literal", remoteSelectedRoutes]
              ]
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
    // reset selected lines 
    setSelectedRoutes([]);
  }, [selectedCity])

  useEffect(() => {
    Fathom.load("LHGHXYKE")
  }, [])

  return (
    <>
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
        cities={availableCities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        layers={layers}
        updateLayer={updateLayer}
        availableProperties={availableProperties}
        selectedProperties={selectedProperties}
        setSelectedProperties={setSelectedProperties}
        routes={availableRoutes}
        selectedRoutes={selectedRoutes}
        setSelectedRoutes={setSelectedRoutes}
        setIsInstructionalModalOpen={setIsInstructionalModalOpen}
        
      />
      {detailedRoutes.city !== '' && (
        <RouteSummaryPane
          status={status}
          routeSummary={routeSummaryNew}
          detailedRoutes={detailedRoutes}
          setDetailedRoutes={setDetailedRoutes}
        />
      )}
      <MapComponent
        center={availableCities && availableCities.find((region) => region.display_name === selectedCity)?.center}
        bounds={availableCities && availableCities.find((region) => region.display_name === selectedCity)?.bbox}
        layers={layers}
        remoteLayers={remoteLayers}
        sourceLayerConfigs={sourceLayerConfigs}
        setDetailedRoutes={setDetailedRoutes}
        selectedCity={selectedCity}
        previousSelectedCity={previousSelectedCity}
      />
    </main>
    { isWelcomeModalOpen && 
      <Modal
        isOpen={isWelcomeModalOpen}
        onDismiss={() => setIsWelcomeModalOpen(false)}
        title='Transit Resilience for Essential Commuting (TREC)'
        onDissmissText='Explore!'
        isCentered={true}
      >
        <p className="text-cyan-500 text-l font-extrabold">
        Where do climate risks likely impact commuters’ abilities to access essential services?
        </p>
        <br />
        <p>
        TREC seeks to answer this question by intersecting climate risk data with the human experience in transit systems across the US.
        </p>
        <br />
        <p>
        You can explore whether a bus station is not only at risk of experiencing a climate threat,
        but also vital for providing access to essential services. Can essential workers make it to job
        centers amidst extreme rainfall? Can an ill commuter arrive at a hospital amidst a wildfire?
        </p>
        <br />
        <p>
        See where climate risks impact the experience of commuters to help prioritize
        infrastructure for improvements or advocate for local community needs.
        </p>
      </Modal>
    }
    { isInstructionalModalOpen && 
      <Modal
        isOpen={isInstructionalModalOpen}
        onDismiss={() => setIsInstructionalModalOpen(false)}
        title=''
        onDissmissText='Dismiss'
        isCentered={false}
      >
        <p className="text-cyan-500 text-l font-extrabold">
        How to use TREC
        </p>
        <br />
        <p>
        <b>1. Where</b>
        </p>
        <p>
        Choose a US city to explore
        </p>
        <p>
        <b>2. What</b>
        </p>
        <p>
        Select a climate risk and a transit destination to focus on
        </p>
        <p>
        <b>3. Prioritize</b>
        </p>
        <p>
        Adjust the filter to hone in on stations with low, medium, or high risk and access
        </p>
        <br />
      </Modal>
    }
    </>
  );
}
