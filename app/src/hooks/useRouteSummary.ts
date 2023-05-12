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
  detailedRoutes: SelectedRoute,
): Array<RouteSummary> => {
  const routeSummary = useMemo(() => {
    let routeSummary: any = {};
    if (remoteLayers[0].isSuccess && detailedRoutes) {
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
      // console.log(route_data)
      // Flattening this data so that we have scores for each stop on a route
      let route_features = route_data.routes.flatMap((r: any, index: any) => {
        return r.map((route: any) => {
          return {
            route,
            flood_risk: route_data.flood_risk[index],
            hospital_access: route_data.hospital_access[index],
            job_access: route_data.job_access[index],
            worker_vulnerability:
              route_data.worker_vulnerability[index],
          };
        });
      });

      route_features = route_features.filter(
        (route: any) => route.route == detailedRoutes.routeServiced,
      );

      // Aggregating this data to get count of stops and the count of different scores on each route.
      let routeStats = route_features.reduce(
        (summary: any, item: any) => {
          if (!summary[item.route])
            summary[item.route] = {
              count: 0,
              flood_risk: [0, 0, 0],
              hospital_access: [0, 0, 0],
              job_access: [0, 0, 0],
              worker_vulnerability: [0, 0, 0],
            };
          summary[item.route]['route'] = item.route;
          summary[item.route]['count'] += 1;
          summary[item.route]['flood_risk'][Math.max(0, item.flood_risk)] += 1;
          summary[item.route]['hospital_access'][
            Math.max(0, item.hospital_access)
          ] += 1;
          summary[item.route]['job_access'][Math.max(0, item.job_access)] += 1;
          summary[item.route]['worker_vulnerability'][
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

