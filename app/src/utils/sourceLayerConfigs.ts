export type SLConfigType = {
    sourceId: string;
    layerId: string;
    layerType: "circle"|"symbol"|"line"|"fill";
    layoutProperties: Array<Record<string, any>>,
    paintProperties: Array<Record<string, any>>,
}

export const SOURCE_LAYER_CONFIG : Record<string, Array<SLConfigType>> = {
    'hampton_roads_stops': [
        {
            sourceId: 'hampton_roads_stops',
            layerId: 'hampton_roads_stops-icon',
            layerType: 'symbol',
            layoutProperties: [
                { name: 'icon-image', value: ['match', ['get', 'route_type'], 
                        'bus', 'bus-15',
                        'subway', 'rail-15',
                        'bus-15'
                    ], options: { sdf: true }}
            ],
            paintProperties: [
                { name: 'icon-color', value: 'red'},
                { name: 'icon-opacity', value: ['match', ['get', 'access_to_hospital'], 1, 1, .25] },
            ]
        },
        {
            sourceId: 'hampton_roads_stops',
            layerId: 'hampton_roads_stops-access_to_hospital',
            layerType: 'circle',
            layoutProperties: [
            ],
            paintProperties: [
                { name: 'circle-opacity', value: 0.2 },
                { name: 'circle-radius', value: {
                    stops: [
                        [1, 5],
                        [15, 25],
                    ]
                }},
                { name: 'circle-color', value: ['match', ['get', 'access_to_hospital'], 1, 'rgba(94, 201, 98, .5)', 'rgba(68, 1, 84, .05)'] },
            ]
        }
    ],
    'nyc_stops': [
        {
            sourceId: 'nyc_stops',
            layerId: 'nyc_stops-icon',
            layerType: 'symbol',
            layoutProperties: [
                { name: 'icon-image', value: ['match', ['get', 'route_type'], 
                        'bus', 'bus-11',
                        'subway', 'rail-11',
                        'bus-11'
                    ], options: { sdf: true }}
            ],
            paintProperties: [
                { name: 'icon-color', value: 'red'},
                { name: 'icon-opacity', value: ['match', ['get', 'access_to_hospital'], 1, 1, .25] },
            ]
        },
        {
            sourceId: 'nyc_stops',
            layerId: 'nyc_stops-access_to_hospital',
            layerType: 'circle',
            layoutProperties: [
            ],
            paintProperties: [
                { name: 'circle-opacity', value: 0.1 },
                { name: 'circle-radius', value: {
                    stops: [
                        [1, 1],
                        [5, 2],
                        [15, 13],
                    ]
                }},
                { name: 'circle-color', value: ['match', ['get', 'access_to_hospital'], 1, 'rgba(94, 201, 98, .33)', 'rgba(68, 1, 84, .33)'] },
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