import { useQuery } from "@tanstack/react-query";

const BACKEND_URI = process.env.BACKEND_URI ?? 'http://localhost:8000';


export type RouteRecord = {
    city: string;
    display_name: string;
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
  