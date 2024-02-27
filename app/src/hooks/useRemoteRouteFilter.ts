import { useQuery } from "@tanstack/react-query";
import { SelectedRoute } from "../components/MainPage";

const BACKEND_URI = process.env.REACT_APP_PROD_BACKEND_URI ?? process.env.REACT_APP_DEV_BACKEND_URI;

export const useRemoteRouteFilter = (selectedRoutes: Array<SelectedRoute>) : { data: string[] , status: string}  => {
    const shouldEnableQuery = selectedRoutes.length > 0;
    const result = useQuery({
        queryKey: [`routeFilter-${JSON.stringify(selectedRoutes)}`],
        queryFn: async () => {
            let stopsOnRouteURL = new URL(`${BACKEND_URI}/stops-on-route`);

            const params = new URLSearchParams();
            selectedRoutes.forEach((route) => {
                params.append('cities', route.city); 
                params.append('routes', route.routeServiced);
            });

            stopsOnRouteURL.search = params.toString();

            const response = await fetch(stopsOnRouteURL);
            const data = await response.json();
            return data;
        },
        staleTime: 1000 * 60 * 60, // one hour,
        enabled: shouldEnableQuery,
    });
    return { data: result.data , status: result.status};
};
  