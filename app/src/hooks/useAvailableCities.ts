import { useQuery } from "@tanstack/react-query";

const BACKEND_URI = process.env.REACT_APP_PROD_BACKEND_URI ?? process.env.REACT_APP_DEV_BACKEND_URI;

export type CityRecord = {
    msa_id: string,
    msa_name: string,
    center: [number, number]
}

export const useAvailableCities = () : {data: Array<CityRecord>, status: string} => {
    const result = useQuery({
        queryKey: [`availableCities`],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URI}/cities`);
            const data = await response.json();
            return data;
        },
        staleTime: 1000 * 60 * 60, // one hour,
    });
    return { data: result.data, status: result.status};
};
  