import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useCallback, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Layer, RemoteLayer, SelectedRoute } from './MainPage';
import Tooltip from './Tooltip';
import { SLConfigType } from '../utils/sourceLayerConfigs';
import { Cities } from '../libs/cities';

const MAPBOX_KEY = process.env.REACT_APP_MAPBOX_API_KEY ?? '';

type MapProps = {
  layers: Record<string, Layer>;
  remoteLayers: Array<RemoteLayer>;
  sourceLayerConfigs: Record<string, any>;
  selectedCity: Cities;
  center: [number, number];
  setDetailedRoutes: React.Dispatch<React.SetStateAction<SelectedRoute>>;
};

function MapComponent({
  remoteLayers,
  layers,
  sourceLayerConfigs,
  selectedCity,
  center,
  setDetailedRoutes,
}: MapProps): JSX.Element {
  let map = useRef<mapboxgl.Map | null>(null);
  const tooltipRef = useRef(
    new mapboxgl.Popup({ offset: 15, maxWidth: '400px', closeButton: false }),
  );
  let [isMapLoaded, setIsMapLoaded] = useState(false);

  const paintLayer = useCallback(
    (layer: Layer, remoteLayer: RemoteLayer) => {
      if (!map.current) {
        return;
      }
      // if a layer isn't visible, remove it
      if (!layer.isVisible || remoteLayer.isLoading === true) {
        // remove layers
        sourceLayerConfigs[layer.layerName].forEach(
          (slConfig: SLConfigType) => {
            if (map.current?.getLayer(slConfig.layerId)) {
              map.current?.removeLayer(slConfig.layerId);
            }
          },
        );
        // remove source
        if (map.current?.getSource(layer.layerName)) {
          map.current.removeSource(layer.layerName);
        }
      } else {
        // if a layer is visible, add back the source if it
        // doesn't exist already
        if (!map.current?.getSource(layer.layerName)) {
          if (layer.layerURL.includes('geojson')) {
            map.current.addSource(layer.layerName, {
              type: 'geojson',
              data: remoteLayer.data,
            });
          } else if (layer.layerURL.includes('mapbox://')) {
            map.current.addSource(layer.layerName, {
              type: 'vector',
              url: layer.layerURL,
            });
          } else {
            map.current.addSource(layer.layerName, {
              type: 'vector',
              tiles: [layer.layerURL],
            });
          }
        }

        // add layers
        sourceLayerConfigs[layer.layerName].forEach(
          (slConfig: SLConfigType) => {
            if (!map.current) {
              return;
            }

            // add back the layer if it's not already in the map
            if (!map.current.getLayer(slConfig.layerId)) {
              if (layer.layerURL.includes('geojson')) {
                map.current.addLayer({
                  id: slConfig.layerId,
                  type: slConfig.layerType,
                  source: layer.layerName,
                });
              } else {
                map.current.addLayer({
                  id: slConfig.layerId,
                  type: slConfig.layerType,
                  source: layer.layerName,
                  'source-layer': layer.sourceLayer,
                });
              }
            }

            // reset the layout properties
            slConfig.layoutProperties.forEach((layoutProperty: any) => {
              if (map.current) {
                map.current.setLayoutProperty(
                  slConfig.layerId,
                  layoutProperty.name,
                  layoutProperty.value,
                  layoutProperty.options,
                );
              }
            });

            // reset the paint properties
            slConfig.paintProperties.forEach((paintProperty: any) => {
              if (map.current) {
                map.current.setPaintProperty(
                  slConfig.layerId,
                  paintProperty.name,
                  paintProperty.value,
                  paintProperty.options,
                );
              }
            });

            // update the filters
            if (slConfig.filters) {
              // first clear all filters
              map.current.setFilter(slConfig.layerId, null);

              // now reset them
              slConfig.filters.forEach(filter => {
                if (map.current) {
                  map.current.setFilter(slConfig.layerId, filter);
                }
              });
            }
          },
        );
      }
    },
    [map, sourceLayerConfigs],
  );

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        accessToken: MAPBOX_KEY,
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: center, // [-73.95, 40.72],
        zoom: 10,
        bearing: 0,
        pitch: 0,
        pitchWithRotate: false,
      });

      map.current.on('load', () => {
        if (!map.current) return;
        setIsMapLoaded(true);
        map.current.addControl(new mapboxgl.NavigationControl());
        map.current.addControl(new mapboxgl.GeolocateControl());
        // load svg icons if needed
        map.current.loadImage('/icons/H_wiki.png', (error, image) => {
          if (error) throw error;
          if (!image) throw error;
          if (!map.current?.hasImage('hospital-icon'))
            map.current?.addImage('hospital-icon', image);
        });
        Object.values(layers).forEach((layer, index) => paintLayer(layer, remoteLayers[index]));
      });

      map.current.on('click', e => {
        if (!map.current) {
          return;
        }
        const layerNames = Object.values(layers).map(l => l.layerName);
        const features = map.current
          .queryRenderedFeatures(e.point)
          .filter(f => layerNames.includes(f.source));
        if (features.length > 0) {
          const feature = features[0];
          const tooltipNode = document.createElement('div');
          const root = createRoot(tooltipNode);

          root.render(
            <Tooltip
              feature={feature}
              onDismiss={() => {
                tooltipRef.current.remove();
              }}
              setDetailedRoutes={setDetailedRoutes}
            />,
          );

          tooltipRef.current
            .setLngLat(e.lngLat)
            .setDOMContent(tooltipNode)
            .addTo(map.current);
        }
      });
    }
  }, [center, layers, paintLayer, remoteLayers, setDetailedRoutes]);

  useEffect(() => {
    if (map.current) {
      map.current.setCenter(center);
      map.current.setZoom(10);
    }
  }, [center]);

  useEffect(() => {
    if (isMapLoaded) {
      Object.values(layers).forEach((layer, layerIndex) => paintLayer(layer, remoteLayers[layerIndex]));
    }
  }, [isMapLoaded, layers, remoteLayers, sourceLayerConfigs, paintLayer]);

  return <div id="map" className="h-96 w-full sm:h-full" />;
}

export default MapComponent;
