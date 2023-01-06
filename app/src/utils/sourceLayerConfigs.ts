import { useMemo } from "react";
// import { Layer, RemoteLayer } from "../App";

export enum COLORS {
    'darkred' = 'rgba(102,55,67,1)',
    'mediumred' ='rgba(157,110,123,1)',
    'lightred' = 'rgba(191,143,149,1)',
    'darkblue' = 'rgba(117,128,157,1)',
    'mediumblue' = 'rgba(166,151,183,1)',
    'lightblue' = 'rgba(217,202,214,1)',
    'darkgreen' = 'rgba(145,185,196,1)',
    'mediumgreen' = 'rgba(202,227,235,1)',
    'lightgreen' = 'rgba(225,232,235,1)',
}

export type SLConfigType = {
    sourceId: string;
    layerId: string;
    layerType: "circle"|"symbol"|"line"|"fill";
    layoutProperties: Array<Record<string, any>>,
    paintProperties: Array<Record<string, any>>,
    filters: Array<any>
}

export function useSourceLayerConfigs(
    // layers: Record<string, Layer>,
    // remoteLayers: RemoteLayer[],
    // remoteLayerPropertyValues: Record<any, any>
    selectedProperties: Array<string>,
    filters: Array<any>
) {
    let output = useMemo(() => {
      let output: Record<string, any> = {};
    //   if (!remoteLayerPropertyValues) {
    //     return output;
    //   }
      output = {
        'stop_features': [
            {
                sourceId: 'stop_features',
                layerId: 'stop_features-icon',
                layerType: 'symbol',
                layoutProperties: [
                    { name: 'icon-image', value: ['match', ['get', 'route_type'], 
                            'Bus', 'bus-11',
                            'Subway', 'rail-11',
                            'bus-11'
                        ], options: { sdf: true }}
                ],
                paintProperties: [
                    // { name: 'icon-color', value: 'red'},
                    // { name: 'icon-opacity', value: ['match', ['get', 'risk_category'], 1, 1, .25] },
                ]
            },
            {
                sourceId: 'stop_features',
                layerId: 'stop_features-risk_category',
                layerType: 'circle',
                layoutProperties: [
                ],
                paintProperties: [
                    { name: 'circle-stroke-color', value: 'grey'},
                    { name: 'circle-stroke-width', value: 1},
                    { name: 'circle-radius', value: [
                        'interpolate', 
                        ['linear'], 
                        ['zoom'],
                        0, .1,
                        7, .5,
                        14, 5,
                        15, 10,
                        16, 12,
                        17, 20,
                        19, 25
                    ]},
                    { name: 'circle-color', value: [
                        'interpolate',
                        ['linear'],
                        ['get', selectedProperties[0]],
                        0, 
                            ['case',
                            ['==', ['get',selectedProperties[1]], 0], `${COLORS.lightgreen}`,
                            ['==', ['get',selectedProperties[1]], 1], `${COLORS.lightblue}`,
                            `${COLORS.lightred}`],
                        1, 
                        ['case',
                            ['==', ['get',selectedProperties[1]], 0], `${COLORS.mediumgreen}`,
                            ['==', ['get',selectedProperties[1]], 1], `${COLORS.mediumblue}`,
                            `${COLORS.mediumred}`],
                        2, 
                        ['case',
                            ['==', ['get',selectedProperties[1]], 0], `${COLORS.darkgreen}`,
                            ['==', ['get',selectedProperties[1]], 1], `${COLORS.darkblue}`,
                            `${COLORS.darkred}`],
                    ]},
                ],
                filters
            }
        ],
        'hospitals': [
            {
                sourceId: 'hospitals',
                layerId: 'hospital-icon',
                layerType: 'symbol',
                layoutProperties: [
                    { name: 'icon-image', value: 'hospital-icon', options: { sdf: true }},
                    { name: 'icon-size', value: .06 }
                ],
                paintProperties: [
                ],
                markers: []
            }
        ],
      }
      return output;
    }, [filters, selectedProperties])
    return output;
  }
