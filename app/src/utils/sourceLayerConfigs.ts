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
  minzoom?: number;
  maxzoom?: number;
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
          sourceId: 'stop_features_new',
          sourceLayer: 'stop_features_new',
          layerId: 'stop_features_new',
          layerType: 'circle',
          minzoom: 6,
          maxzoom: 20,
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
          sourceId: 'hospitals_new',
          sourceLayer: 'hospitals_new',
          layerId: 'hospitals_new',
          layerType: 'symbol',
          minzoom: 6,
          maxzoom: 20,
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
      'City Extents': [
        {
          sourceId: 'cities-extents',
          layerId: 'cities-extents',
          sourceLayer: 'cities-extents',
          layerType: 'fill',
          minzoom: 1,
          maxzoom: 6,
          layoutProperties: [],
          paintProperties: [
            { name: 'fill-color', value: 'gray' },
          ],
          markers: [],
        },
      ],
      'FEMA Flood Layer': [
        {
          sourceId: 'national_fema_raster_combined_clipped',
          layerId: 'national_fema_raster_combined_clipped',
          layerType: 'raster',
          layoutProperties: [],
          paintProperties: [
            // { name: 'fill-color', value: 'rgba(104, 207, 255, .95)' },
          ],
          markers: [],
        },
      ]
    };
    return output;
  }, [filters, selectedProperties]);
  return output;
}
