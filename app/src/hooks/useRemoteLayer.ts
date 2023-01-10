import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { Layer, RemoteLayer } from "../components/MainPage";

export const fetchLayerFn = async (layer: Layer) => {
  if (layer.layerName && layer.layerURL) {
    if (layer.layerURL.includes('geojson')) {
      const res = await fetch(layer.layerURL);
      const json = await res.json();
      const result = {
        ...json,
        id: layer.id,
      };
      return result;
    }
    else { 
      const res = await fetch(layer.layerURL);
      const body = await res.text();
      const result = {
        body,
        id: layer.id,
      };
      return result;
    }
  }
};

export const useRemoteLayerPropertyValues = (
  remoteLayers: RemoteLayer[],
  selectedProperties: Array<string>
): Record<any, any> => {
  const result = useMemo(() => {
    let result: any = {};
    remoteLayers.forEach((rl) => {
      if (rl.isSuccess) {
        selectedProperties.forEach((key) => {
          if (!Object.keys(rl.data.features[0].properties).includes(key))
            return;
          const vals = rl.data.features.map((f: any) => f.properties[key]);
          if (!result[rl.data.id]) result[rl.data.id] = {};
          if (!result[rl.data.id][key]) result[rl.data.id][key] = new Set();
          vals.forEach((v: any) => result[rl.data.id][key].add(v));
        });
      }
    });
    return result;
  }, [remoteLayers, selectedProperties]);
  return result;
};

export const useRemoteLayers = (
  availableLayers: Record<string, Layer>
): Array<RemoteLayer> => {
  const queries = Object.values(availableLayers) //.filter(layer => layer.isVisible)
    .map((layer: Layer) => {
      const query = {
        queryKey: [layer.id],
        queryFn: () => fetchLayerFn(layer),
        staleTime: 1000 * 60 * 60, // one hour,
      };
      return query;
    });
  const results = useQueries({
    queries,
  });

  return results;
};
