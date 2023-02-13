import { RemoteLayer, SelectedRoute } from "../components/MainPage";
import { useMemo } from "react";


export type RouteSummary = {
  route: String, 
  count: Number, 
  flood_risk: Array<number>,
  access_to_hospital: Array<number>,
  jobs_cat: Array<number>,
  worker_vulnerability_cat: Array<number>
};



export const useRouteSummary = (
    remoteLayers: RemoteLayer[],
    detailedRoutes: SelectedRoute,
  ): Array<RouteSummary> => {

    const routeSummary = useMemo(() => {
      let routeSummary: any = {};
        if (remoteLayers[1].isSuccess && detailedRoutes) {
          
          let route_data = {
            'routes': remoteLayers[1].data.features.map((a:any) => a.properties.routes_serviced.split(",")), 
            'flood_risk': remoteLayers[1].data.features.map((a:any) => a.properties.risk_category),
            'access_to_hospital': remoteLayers[1].data.features.map((a:any) => a.properties.access_to_hospital),
            'jobs_cat': remoteLayers[1].data.features.map((a:any) => a.properties.jobs_cat),
            'worker_vulnerability_cat': remoteLayers[1].data.features.map((a:any) => a.properties.worker_vulnerability_cat),
          }
          // console.log(route_data)
          // Flattening this data so that we have scores for each stop on a route
          let route_features = route_data.routes.flatMap((r:any, index:any) => {
            return r.map((route:any) => {
              return {
                route,
                flood_risk: route_data.flood_risk[index],
                access_to_hospital: route_data.access_to_hospital[index],
                jobs_cat: route_data.jobs_cat[index],
                worker_vulnerability_cat: route_data.worker_vulnerability_cat[index]
              }
            })
          })
          
          route_features = route_features.filter((route:any) => route.route  == detailedRoutes.routeServiced)
          
          // Aggregating this data to get count of stops and the count of different scores on each route.
          let routeStats = route_features.reduce( (summary:any, item:any) => {
            if (!summary[item.route]) summary[item.route] = {count:0, flood_risk:[0,0,0], access_to_hospital:[0,0,0],jobs_cat:[0,0,0], worker_vulnerability_cat:[0,0,0]}
            summary[item.route]['route'] = item.route;
            summary[item.route]['count'] +=1;
            summary[item.route]['flood_risk'][Math.max(0,item.flood_risk)] +=1;
            summary[item.route]['access_to_hospital'][Math.max(0,item.access_to_hospital)] +=1;
            summary[item.route]['jobs_cat'][Math.max(0,item.jobs_cat)] +=1;
            summary[item.route]['worker_vulnerability_cat'][Math.max(0,item.worker_vulnerability_cat)] +=1;
            return summary;
          }, {key:{route:'', count:0, flood_risk:[0,0,0],access_to_hospital:[0,0,0],jobs_cat:[0,0,0], worker_vulnerability_cat:[0,0,0]}})
          routeSummary = Object.values(routeStats)
        }
        return routeSummary;
    }, [remoteLayers]);
    return routeSummary;
};