import mapboxgl from 'mapbox-gl';
import React, { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
const MAPBOX_KEY = process.env.REACT_APP_MAPBOX_API_KEY ?? '';

function Map() {
  let map = useRef<mapboxgl.Map | null>(null);
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        accessToken: MAPBOX_KEY,
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
        center: [-74.01, 40.72],
        zoom: 11,
        bearing: 0,
        pitch: 0
      });
    }
  }, []);
  // add layer hook 
  // useRemoteLayers([])
  // add point and polygon hook
  return (
    <div id="map" className='
        !absolute
        -z-50
        h-screen
        top-0
        bottom-0
        left-0
        right-0
    '>
    </div>
  );
}

export default Map;
