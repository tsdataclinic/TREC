import { useMemo } from 'react';
// import { Layer, RemoteLayer } from "../App";

export enum COLORS {
  'darkred' = 'rgba(102,55,67,1)',
  'mediumred' = 'rgba(157,110,123,1)',
  'lightred' = 'rgba(201,153,159,1)',
  'darkpurple' = 'rgba(117,128,157,1)',
  'mediumpurple' = 'rgba(166,151,183,1)',
  'lightpurple' = 'rgba(217,202,214,1)',
  'darkgreen' = 'rgba(100,165,189,1)',
  'mediumgreen' = 'rgba(150,195,196,1)',
  'lightgreen' = 'rgba(210,237,242,1)',
}

export type SLConfigType = {
  sourceId: string;
  layerId: string;
  layerType: 'circle' | 'symbol' | 'line' | 'fill';
  layoutProperties: Array<Record<string, any>>;
  paintProperties: Array<Record<string, any>>;
  filters: Array<any>;
};

export function useSourceLayerConfigs(
  // layers: Record<string, Layer>,
  // remoteLayers: RemoteLayer[],
  // remoteLayerPropertyValues: Record<any, any>
  selectedProperties: Array<string>,
  filters: Array<any>,
) {
  let output = useMemo(() => {
    let output: Record<string, any> = {};
    //   if (!remoteLayerPropertyValues) {
    //     return output;
    //   }
    output = {
      'Transit Stops': [
        {
          sourceId: 'stop_features',
          sourceLayer: 'stop_features',
          layerId: 'stop_features',
          layerType: 'circle',
          layoutProperties: [],
          paintProperties: [
            { name: 'circle-opacity', value: [
                'case',
                ['==', ['get', 'route_type'], 'Subway'],
                0,
                1
              ] 
            },
            { name: 'circle-stroke-color', value: 'grey' },
            { name: 'circle-stroke-width', value: [
                'case',
                ['==', ['get', 'route_type'], 'Subway'],
                0,
                1
              ]
            },
            {
              name: 'circle-radius',
              value: [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                0.1,
                7,
                0.5,
                14,
                5,
                15,
                10,
                16,
                12,
                17,
                20,
                19,
                25,
              ],
            },
            {
              name: 'circle-color',
              value: [
                'interpolate',
                ['linear'],
                ['get', selectedProperties[0]],
                0,
                [
                  'case',
                  ['==', ['get', selectedProperties[1]], 0],
                  `${COLORS.lightgreen}`,
                  ['==', ['get', selectedProperties[1]], 1],
                  `${COLORS.lightpurple}`,
                  `${COLORS.lightred}`,
                ],
                1,
                [
                  'case',
                  ['==', ['get', selectedProperties[1]], 0],
                  `${COLORS.mediumgreen}`,
                  ['==', ['get', selectedProperties[1]], 1],
                  `${COLORS.mediumpurple}`,
                  `${COLORS.mediumred}`,
                ],
                2,
                [
                  'case',
                  ['==', ['get', selectedProperties[1]], 0],
                  `${COLORS.darkgreen}`,
                  ['==', ['get', selectedProperties[1]], 1],
                  `${COLORS.darkpurple}`,
                  `${COLORS.darkred}`,
                ],
              ],
            },
          ],
          filters,
        },
      ],
      Hospitals: [
        {
          sourceId: 'hospitals',
          sourceLayer: 'hospitals',
          layerId: 'hospitals',
          layerType: 'symbol',
          layoutProperties: [
            {
              name: 'icon-image',
              value: 'hospital-icon',
              options: { sdf: true },
            },
            { name: 'icon-size', value: 0.04 },
          ],
          paintProperties: [],
          markers: [],
        },
      ],
      '2020 NYC Floods (Projected)': [
        {
          sourceId: 'nyc2050',
          layerId: 'nyc2050',
          layerType: 'fill',
          layoutProperties: [],
          paintProperties: [
            { name: 'fill-color', value: 'rgba(104, 207, 255, .95)' },
          ],
          markers: [],
        },
      ],
      '2050 NYC Floods (Projected)': [
        {
          sourceId: 'nyc_2050_flooding',
          layerId: 'nyc_2050_flooding',
          layerType: 'fill',
          layoutProperties: [],
          paintProperties: [
            { name: 'fill-opacity', value: 0.65 },
            {
              name: 'fill-color',
              value: [
                'case',
                ['==', ['get', 'Flooding_Category'], 'Deep flooding (>1ft)'],
                `#ff8e52`,
                ['==', ['get', 'Flooding_Category'], 'Future high tides'],
                `#ffc7a9`,
                `#ffddcb`
              ],
            },
          ],
          markers: [],
        },
      ],
      '2050 Hampton Roads Floods (Projected)': [
        {
          sourceId: 'hr2050',
          layerId: 'hr2050',
          layerType: 'fill',
          layoutProperties: [],
          paintProperties: [
            { name: 'fill-opacity', value: 0.65 },
            {
              name: 'fill-color',
              value: [
                'case',
                ['==', ['get', 'CLASS'], 'Low Lying'],
                `#ff8e52`,
                `#ffc7a9`,
              ],
            },
          ],
          markers: [],
        },
      ],
      'Philadelphia Current FEMA Flood Layer': [
        {
          sourceId: 'phi_processed_fema',
          layerId: 'phi_processed_fema',
          layerType: 'fill',
          layoutProperties: [],
          paintProperties: [
            { name: 'fill-opacity', value: 0.65 },
            {
              name: 'fill-color',
              value: [
                /**
                 * "1 PCT ANNUAL CHANCE FLOOD HAZARD CONTAINED IN CHANNEL"
                    "FLOODWAY"
                    "0.2 PCT ANNUAL CHANCE FLOOD HAZARD"
                    "AREA OF MINIMAL FLOOD HAZARD"
                    "AREA WITH REDUCED FLOOD RISK DUE TO LEVEE"
                    "1 PCT DEPTH LESS THAN 1 FOOT"
                 */
                'case',
                ['==', ['get', 'ZONE_SUBTY'], '1 PCT ANNUAL CHANCE FLOOD HAZARD CONTAINED IN CHANNEL'],
                `#ff8e52`,
                ['==', ['get', 'ZONE_SUBTY'], '0.2 PCT ANNUAL CHANCE FLOOD HAZARD'],
                `#ffc7a9`,
                `transparent`
              ],
            },
          ],
          markers: [],
        },
      ],
      'New Orleans Current FEMA Flood Layer': [
        {
          sourceId: 'nola_processed_fema',
          layerId: 'nola_processed_fema',
          layerType: 'fill',
          layoutProperties: [],
          paintProperties: [
            { name: 'fill-opacity', value: 0.65 },
            {
              name: 'fill-color',
              value: [
                /**
                 * "FLOODWAY"
                    "0.2 PCT ANNUAL CHANCE FLOOD HAZARD"
                    "AREA OF MINIMAL FLOOD HAZARD"
                    "AREA WITH REDUCED FLOOD RISK DUE TO LEVEE"
                 */
                'case',
                ['==', ['get', 'ZONE_SUBTY'], '0.2 PCT ANNUAL CHANCE FLOOD HAZARD'],
                `#ff8e52`,
                ['==', ['get', 'ZONE_SUBTY'], 'AREA WITH REDUCED FLOOD RISK DUE TO LEVEE'],
                `#ffc7a9`,
                `transparent`
              ],
            },
          ],
          markers: [],
        },
      ],
      'Pittsburgh Current FEMA Flood Layer': [
        {
          sourceId: 'pitt_processed_fema',
          layerId: 'pitt_processed_fema',
          layerType: 'fill',
          layoutProperties: [],
          paintProperties: [
            { name: 'fill-opacity', value: 0.65 },
            {
              name: 'fill-color',
              value: [
                /*
                  "FLOODWAY"
                  "AREA OF MINIMAL FLOOD HAZARD"
                  "0.2 PCT ANNUAL CHANCE FLOOD HAZARD"
                  "AREA WITH REDUCED FLOOD RISK DUE TO LEVEE"
                */
                'case',
                ['==', ['get', 'ZONE_SUBTY'], '0.2 PCT ANNUAL CHANCE FLOOD HAZARD'],
                `#ff8e52`,
                ['==', ['get', 'ZONE_SUBTY'], 'AREA WITH REDUCED FLOOD RISK DUE TO LEVEE'],
                `#ffc7a9`,
                `transparent`
              ],
            },
          ],
          markers: [],
        },
      ],
      'SF Current FEMA Flood Layer': [
        {
          sourceId: 'sf_processed_fema-125s1o',
          layerId: 'sf_processed_fema-125s1o',
          layerType: 'fill',
          layoutProperties: [],
          paintProperties: [
            { name: 'fill-opacity', value: 0.65 },
            {
              name: 'fill-color',
              value: [
                /*
                  "FLOODWAY"
                  "AREA OF MINIMAL FLOOD HAZARD"
                  "0.2 PCT ANNUAL CHANCE FLOOD HAZARD"
                  "AREA WITH REDUCED FLOOD RISK DUE TO LEVEE"
                */
                'case',
                ['==', ['get', 'ZONE_SUBTY'], '0.2 PCT ANNUAL CHANCE FLOOD HAZARD'],
                `#ff8e52`,
                ['==', ['get', 'ZONE_SUBTY'], 'AREA OF MINIMAL FLOOD HAZARD'],
                `#ffc7a9`,
                `transparent`
              ],
            },
          ],
          markers: [],
        },
      ],
    };
    return output;
  }, [filters, selectedProperties]);
  return output;
}
