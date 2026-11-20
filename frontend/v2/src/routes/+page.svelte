<script lang="ts">
    import "../app.css";
    import { MapLibre, LineLayer, MapEvents, Marker, GeoJSON} from 'svelte-maplibre';
    import type { LngLat, MapMouseEvent, LngLatBoundsLike } from 'maplibre-gl';
    import * as maplibregl from 'maplibre-gl';
    import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

    maplibregl.setWorkerUrl(maplibreWorkerUrl);

    let bounds: LngLatBoundsLike = $state([-32, -8, 63, 41]);
    let displayBounds = $derived(bounds.map((b) => b.toFixed(4)).join(', '));

    let markers: { lngLat: LngLat }[] = $state([]);

    function addMarker(e: MapMouseEvent) {
        markers = [...markers, { lngLat: e.lngLat }];
    }

    let lineData = $derived({
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: markers.map((marker) => [marker.lngLat.lng, marker.lngLat.lat]),
        }
    });
</script>


<MapLibre
  center={[30.247694, 59.834662]}
  zoom={15}
  class="map w-2/3 h-screen"
  standardControls
  style="https://tiles.openfreemap.org/styles/bright"
>
  <!-- MapEvents gives you access to map events even from other components inside the map,
  where you might not have access to the top-level `MapLibre` component. In this case
  it would also work to just use on:click on the MapLibre component itself. -->
  <MapEvents onclick={addMarker} />
  <GeoJSON id="line-source" data={lineData}>
    <LineLayer
      id="connecting-line"
      layout={{ 'line-cap': 'round', 'line-join': 'round' }}
      paint={{ 'line-color': '#ff3e00', 'line-width': 4 }}
    />
  </GeoJSON>

  {#each markers as marker}
    <Marker
        lngLat={marker.lngLat}
        class="h-4 w-4 rounded-full border-3 border-mauve-700 bg-mauve-300 text-black shadow-2xl focus:outline-2 focus:outline-black"
    />
  {/each}
</MapLibre>

<style>
    @import "tailwindcss";
    @theme {
    --color-marker-bg: #CBB279;
    --color-marker-border: #E1D4BB;
    }
</style>