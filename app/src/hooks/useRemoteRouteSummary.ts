import { useQuery } from "@tanstack/react-query";

const BACKEND_URI = process.env.REACT_APP_PROD_BACKEND_URI ?? process.env.REACT_APP_DEV_BACKEND_URI;

export type RouteSummaryResponse = {
    "route": string,
    "agency": string,
    "count": number,
    "flood_risk_category": [number, number, number],
    "heat_risk_category": [number, number, number],
    "fire_risk_category": [number, number, number],
    "access_to_hospital_category": [number, number, number],
    "job_access_category": [number, number, number],
    "worker_vulnerability_category": [number, number, number],
}

export const useRemoteRouteSummary = (city: string, route: string) : { data: RouteSummaryResponse , status: string}  => {
    const result = useQuery({
        queryKey: [`routeSummary-${route}`],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URI}/route-summary/${city}/${route}`);
            const data = await response.json();
            return data;
        },
        staleTime: 1000 * 60 * 60, // one hour,
    });
    return { data: result.data , status: result.status};
};
  