import mapboxgl from "mapbox-gl";
import { useEffect, useState, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Layer, RemoteLayer } from "./MainPage";
import { createRoot } from "react-dom/client";
import Tooltip from "./Tooltip";
import { SLConfigType } from "../utils/sourceLayerConfigs";

const MAPBOX_KEY = process.env.REACT_APP_MAPBOX_API_KEY ?? "";

type MapProps = {
  layers: Record<string, Layer>;
  remoteLayers: Array<RemoteLayer>;
  sourceLayerConfigs: Record<string, any>;
};

function MapComponent({
  remoteLayers,
  layers,
  sourceLayerConfigs,
}: MapProps): JSX.Element {
  let map = useRef<mapboxgl.Map | null>(null);
  const tooltipRef = useRef(new mapboxgl.Popup({ offset: 15 }));
  let [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        accessToken: MAPBOX_KEY,
        container: "map",
        style: "mapbox://styles/mapbox/light-v11",
        center: [-73.95, 40.72],
        zoom: 11,
        bearing: 0,
        pitch: 0,
      });

      map.current.on("load", () => {
        if (!map.current) return;
        setIsMapLoaded(true);
        // load svg icons if needed
      });

      map.current.on("click", (e) => {
        if (!map.current) {
          return;
        }
        const layerNames = Object.values(layers).map((l) => l.layerName);
        const features = map.current
          .queryRenderedFeatures(e.point)
          .filter((f) => layerNames.includes(f.source));
        if (features.length > 0) {
          const feature = features[0];

          const tooltipNode = document.createElement("div");
          const root = createRoot(tooltipNode);

          root.render(<Tooltip feature={feature} />);

          tooltipRef.current
            .setLngLat(e.lngLat)
            .setDOMContent(tooltipNode)
            .addTo(map.current);
        }
      });
    }
  }, [layers]);

  useEffect(() => {
    if (isMapLoaded) {
      Object.values(layers).forEach((layer: Layer) => {
        if (!map.current) return;
        if (layer.isVisible) {
          // add source if it doesn't exist
          if (!map.current?.getSource(layer.layerName)) {
            map.current.addSource(layer.layerName, {
              type: "geojson",
              data: layer.layerURL,
            });
          }
          // add layers
          sourceLayerConfigs[layer.layerName].forEach(
            (slConfig: SLConfigType) => {
              if (!map.current) return;
              if (!map.current.getLayer(slConfig.layerId)) {
                map.current.addLayer({
                  id: slConfig.layerId,
                  type: slConfig.layerType,
                  source: layer.layerName,
                });

                slConfig.layoutProperties.forEach((layoutProperty: any) => {
                  if (map.current) {
                    map.current.setLayoutProperty(
                      slConfig.layerId,
                      layoutProperty.name,
                      layoutProperty.value,
                      layoutProperty.options
                    );
                  }
                });
                slConfig.paintProperties.forEach((paintProperty: any) => {
                  if (map.current) {
                    map.current.setPaintProperty(
                      slConfig.layerId,
                      paintProperty.name,
                      paintProperty.value,
                      paintProperty.options
                    );
                  }
                });
              }
            }
          );
        } else {
          // remove layers
          sourceLayerConfigs[layer.layerName].forEach(
            (slConfig: SLConfigType) => {
              if (map.current?.getLayer(slConfig.layerId)) {
                map.current?.removeLayer(slConfig.layerId);
              }
            }
          );
          // remove source
          if (map.current?.getSource(layer.layerName)) {
            map.current.removeSource(layer.layerName);
          }
        }
      });
    }
  }, [isMapLoaded, layers, remoteLayers, sourceLayerConfigs]);

  return <div id="map" className="-z-50 h-full w-full" />;
}

export default MapComponent;
