import keys from '../config/keys';
import mapboxgl from 'mapbox-gl';

export const buildMap = (center, zoom, isDark, hasPosition) => {
    mapboxgl.accessToken = keys.mapBoxKey;
    const map = new mapboxgl.Map({
      container: 'map', // container id
      style: `mapbox://styles/mapbox/${isDark ? 'dark' : 'light'}-v10`, // style URL
      center, // starting position [lng, lat]
      zoom // starting zoom
    });    

    map.on('load', () => {
      map.resize();
    });

    hasPosition ? new mapboxgl.Marker()
    .setLngLat(center)
    .addTo(map) : null;
};