import L from 'leaflet';
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css';
import 'leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js';

// Person Icon Marker
export const personIcon = L.ExtraMarkers.icon({
  icon: 'fa-user',
  markerColor: 'blue',
  shape: 'circle',
  prefix: 'fa'
});

// House Icon Marker
export const houseIcon = L.ExtraMarkers.icon({
  icon: 'fa-home',
  markerColor: 'green',
  shape: 'circle',
  prefix: 'fa'
});

// Exclamation Mark Icon Marker (Alert/Warning)
export const alertIcon = L.ExtraMarkers.icon({
  icon: 'fa-exclamation',
  markerColor: 'red',
  shape: 'circle',
  prefix: 'fa'
});