import { useQueries } from "@tanstack/react-query";
import { useRemoteLayers } from "../hooks/useRemoteLayer";
import { Layer, RemoteLayer } from "../components/MainPage";

export const useRouteSummary = (
    availableLayers: Record<string, Layer>
  ): number => {
    let results = 0;
//     availableLayers: Record<string, Layer>
//   ): Array<RemoteLayer> => {
//     const queries = Object.values(availableLayers) //.filter(layer => layer.isVisible)
//       .map((layer: Layer) => {
//         const query = {
//           queryKey: [layer.id],
//           queryFn: () => fetchLayerFn(layer),
//           staleTime: 1000 * 60 * 60, // one hour,
//         };
//         return query;
//       });
//     const results = useQueries({
//       queries,
//     });
  
    return results;
  };