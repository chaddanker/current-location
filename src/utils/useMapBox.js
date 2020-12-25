import keys from '../config/keys';

export const buildMap = (center, zoom, isDark, hasPosition) => {
    window.mapboxgl.accessToken = keys.mapBoxKey;
    const map = new window.mapboxgl.Map({
      container: 'map', // container id
      style: `mapbox://styles/mapbox/${isDark ? 'dark' : 'light'}-v10`, // style URL
      center, // starting position [lng, lat]
      zoom // starting zoom
    });    

    map.on('load', () => {
      map.resize();
    });

    hasPosition ? new window.mapboxgl.Marker()
    .setLngLat(center)
    .addTo(map) : null;
};