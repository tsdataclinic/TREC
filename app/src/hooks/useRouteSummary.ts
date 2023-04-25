import { RemoteLayer, SelectedRoute } from '../components/MainPage';
import { useMemo } from 'react';

export type RouteSummary = {
  route: String;
  count: Number;
  flood_risk: Array<number>;
  hospital_access: Array<number>;
  job_access: Array<number>;
  worker_vulnerability: Array<number>;
};

export const useRouteSummary = (
  remoteLayers: RemoteLayer[],
  detailedRoutes: SelectedRoute[],
): Array<RouteSummary> => {
  
  // Since there can be common stops in different routes
  // Summary(A+B) != Summary(A) + Summary(B)
  // Therefore we cannot reuse computation done for A and B separately to find A+B's summary
  const detailedRoutesServiced = detailedRoutes.flatMap(route => route.routeServiced);
  const combinedRouteName = detailedRoutesServiced.join(", ");

  const routeSummary = useMemo(() => {
    let routeSummary: any = {};
    if (remoteLayers[0].isSuccess && detailedRoutes.length > 0) {
      let route_data = {
        routes: remoteLayers[0].data.features.map(
          (a: any) => a.properties.routes_serviced,
        ),
        flood_risk: remoteLayers[0].data.features.map(
          (a: any) => a.properties.flood_risk_category,
        ),
        hospital_access: remoteLayers[0].data.features.map(
          (a: any) => a.properties.access_to_hospital_category,
        ),
        job_access: remoteLayers[0].data.features.map(
          (a: any) => a.properties.job_access_category,
        ),
        worker_vulnerability: remoteLayers[0].data.features.map(
          (a: any) => a.properties.worker_vulnerability_category,
        ),
      };
      
      // Flattening this data so that we have scores for each stop on a route
      // Also ensuring that each stop gets included at most once in case of multiple routes
      let stop_features = route_data.routes.map((r: any, index: any) => {
        return {
          routes: r,
          flood_risk: route_data.flood_risk[index],
          hospital_access: route_data.hospital_access[index],
          job_access: route_data.job_access[index],
          worker_vulnerability:
          route_data.worker_vulnerability[index],
        }
      });

      stop_features = stop_features.filter(
        (f: any) => f.routes.some((route: string) => detailedRoutesServiced.includes(route))
      );

      // Aggregating this data to get count of stops and the count of different scores on each route.
      let routeStats = stop_features.reduce(
        (summary: any, item: any) => {
          if (!summary[combinedRouteName])
            summary[combinedRouteName] = {
              count: 0,
              flood_risk: [0, 0, 0],
              hospital_access: [0, 0, 0],
              job_access: [0, 0, 0],
              worker_vulnerability: [0, 0, 0],
            };
          summary[combinedRouteName]['route'] = combinedRouteName;
          summary[combinedRouteName]['count'] += 1;
          summary[combinedRouteName]['flood_risk'][Math.max(0, item.flood_risk)] += 1;
          summary[combinedRouteName]['hospital_access'][
            Math.max(0, item.hospital_access)
          ] += 1;
          summary[combinedRouteName]['job_access'][Math.max(0, item.job_access)] += 1;
          summary[combinedRouteName]['worker_vulnerability'][
            Math.max(0, item.worker_vulnerability)
          ] += 1;
          return summary;
        },
        {
          key: {
            route: '',
            count: 0,
            flood_risk: [0, 0, 0],
            hospital_access: [0, 0, 0],
            job_access: [0, 0, 0],
            worker_vulnerability: [0, 0, 0],
          },
        },
      );
      routeSummary = Object.values(routeStats);
    }
    return routeSummary;
  }, [remoteLayers]);
  return routeSummary;
};

