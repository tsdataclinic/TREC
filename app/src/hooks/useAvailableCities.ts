import { useQuery } from "@tanstack/react-query";

const BACKEND_URI = process.env.BACKEND_URI ?? 'http://localhost:8000';

export const useAvailableCities = () : Array<{
    "city": string,
    "display_name": string,
    "bbox": [[number, number], [number, number]],
    "center": [number, number]
}> | undefined => {
    const result = useQuery({
        queryKey: [`availableCities`],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URI}/cities`);
            const data = await response.json() as Array<{
                "city": string,
                "display_name": string,
                "bbox": string,
                "center": string
            }>;
            return data.map((region) => {
                const bounds = JSON.parse(region.bbox);
                const center = JSON.parse(region.center);
                // TODO - probably a better place to type the response.json
                return {
                    ...region,
                    bbox: [
                        bounds.coordinates[0][0],
                        bounds.coordinates[0][2],
                    ] as [[number, number], [number, number]],
                    center: center.coordinates as [number, number]
                }
            })
        },
        staleTime: 1000 * 60 * 60, // one hour,
    });
    return result.data;
};
  