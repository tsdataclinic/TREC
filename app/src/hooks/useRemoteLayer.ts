import { useQueries } from "@tanstack/react-query";
import { Layer, RemoteLayer } from "../App";

export const fetchLayerFn = async (layer: Layer) => {
    if (layer.layerName && layer.layerURL) {
        const res = await fetch(layer.layerURL);
        const json = await res.json();
        const result = { 
          ...json,
          id: layer.id
        };
        return result;
    }
    return null;
}

export const useRemoteLayers = (availableLayers: Record<string, Layer>) : Array<RemoteLayer> => {
    const queries = Object.values(availableLayers).filter(layer => layer.isVisible).map(layer => {
      const query = {
        queryKey: [layer.id],
        queryFn: () => fetchLayerFn(layer)
      };
      return query;
    })
    const results = useQueries({
        queries
    });

    return results;
  }

