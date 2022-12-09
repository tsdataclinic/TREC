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
}

export function useSourceLayerConfigs(
    // layers: Record<string, Layer>,
    // remoteLayers: RemoteLayer[],
    // remoteLayerPropertyValues: Record<any, any>
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
                    { name: 'circle-opacity', value: .66},
                    { name: 'circle-radius', value: {
                        stops: [
                            [1, .8],
                            [5, 1.12],
                            [15, 5],
                        ]
                    }},
                    { name: 'circle-color', value: [
                        'interpolate',
                        ['linear'],
                        ['get', 'risk_category'],
                        0, 
                            ['case',
                            ['==', ['get','access_to_hospital'], 'Low'], `${COLORS.lightblue}`,
                            ['==', ['get','access_to_hospital'], 'Medium'], `${COLORS.mediumblue}`,
                            `${COLORS.darkblue}`],
                        1, 
                        ['case',
                            ['==', ['get','access_to_hospital'], 'Low'], `${COLORS.lightgreen}`,
                            ['==', ['get','access_to_hospital'], 'Medium'], `${COLORS.mediumgreen}`,
                            `${COLORS.darkgreen}`],
                        2, 
                        ['case',
                            ['==', ['get','access_to_hospital'], 'Low'], `${COLORS.lightred}`,
                            ['==', ['get','access_to_hospital'], 'Medium'], `${COLORS.mediumred}`,
                            `${COLORS.darkred}`],
                    ]},
                ]
            }
        ],
        'hospitals': [
            {
                sourceId: 'hospitals',
                layerId: 'hospital-icon',
                layerType: 'symbol',
                layoutProperties: [
                    { name: 'icon-image', value: 'hospital-15', options: { sdf: true }},
                    { name: 'icon-size', value: 2}
                ],
                paintProperties: [
                    { name: 'icon-color', value: 'red'}
                ]
            }
        ],
      }
      return output;
    }, [])
    return output;
  }
