import { useQuery } from "@tanstack/react-query";

const BACKEND_URI = process.env.REACT_APP_PROD_BACKEND_URI ?? process.env.REACT_APP_DEV_BACKEND_URI;

export type CityRecord = {
    msa_id: string,
    msa_name: string,
    center: [number, number]
}

export const useCityFromPoint = (center: number[]) : {data: Array<CityRecord>, status: string} => {
    const lng = center[0];
    const lat = center[1];
    const qKey = `cityFromPoint_${lng.toPrecision(1)}_${lat.toPrecision(1)}`;
    console.log(qKey);
    const result = useQuery({
        queryKey: [qKey],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URI}/city-from-point/${lng}/${lat}`);
            const data = await response.json();
            return data;
        },
        staleTime: 1000 * 60 * 60, // one hour,
    });
    return { data: result.data, status: result.status};
};
  