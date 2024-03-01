import { useQuery } from "@tanstack/react-query";

const BACKEND_URI = process.env.REACT_APP_PROD_BACKEND_URI ?? process.env.REACT_APP_DEV_BACKEND_URI;


export type RouteRecord = {
    city: string;
    display_name: string;
    msa_id: string;
    route_types: Record<string, {
        route_type: string
        routes_serviced: Array<string>
    }>
}
export const useAvailableRoutes = () : Array<RouteRecord> => {
    const result = useQuery({
        queryKey: [`availableRoutes`],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URI}/available-routes`);
            const data = await response.json();
            return data;
        },
        staleTime: 1000 * 60 * 60, // one hour,
    });
    return result.data;
};
  