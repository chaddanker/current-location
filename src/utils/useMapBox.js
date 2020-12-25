import keys from '../config/keys';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

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

export const getAddress = async (coords) => {
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?access_token=pk.eyJ1IjoiY2hhZGRhbmtlciIsImEiOiJjazcxc2E1bnIwMmE0M21ud2oxOTdhNTlvIn0.vPS-2MWv9PRKcuRmmJG13w`);
    return response.data.features[0].place_name;
}