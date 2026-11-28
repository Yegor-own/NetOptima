<script lang="ts">
    import { MapLibre, Marker, MapEvents, GeoJSON, LineLayer } from 'svelte-maplibre';
    import type { MapMouseEvent } from 'maplibre-gl';
    import { networkStore } from '#lib/state/network.svelte';

    async function onMapClick(e: MapMouseEvent) {
        if (networkStore.mode !== 'add_node') return;
        const name = prompt('Название узла:');
        if (name) {
            await networkStore.addNode(name, e.lngLat.lat, e.lngLat.lng);
        }
    }
</script>

<MapLibre
    style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    class="h-full w-full"
    center={[35.91, 56.85]}
    zoom={5}
>
    <MapEvents onclick={onMapClick} />

    <!-- 1. Слой потенциальных каналов (серый пунктир) -->
    <GeoJSON id="candidate-links" data={networkStore.candidateLinksGeoJson}>
        <LineLayer
            id="candidate-links-layer"
            paint={{
                'line-color': '#64748b',
                'line-width': 2,
                'line-dasharray': [2, 2],
                'line-opacity': 0.7
            }}
        />
    </GeoJSON>

    <!-- 2. Слой построенных каналов после оптимизации (яркий неон) -->
    <GeoJSON id="result-links" data={networkStore.resultLinksGeoJson}>
        <LineLayer
            id="result-links-layer"
            paint={{
                'line-color': '#10b981',
                'line-width': 4
            }}
        />
    </GeoJSON>

    <!-- 3. Узлы -->
    {#each networkStore.nodes as node (node.id)}
        {@const isSelected = networkStore.linkStartNode?.id === node.id}
        <Marker lngLat={[node.lng, node.lat]}>
            <button
                type="button"
                onclick={(e) => {
                    e.stopPropagation();
                    networkStore.handleNodeClick(node);
                }}
                class="relative flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-125
                    {isSelected ? 'border-amber-400 bg-amber-500 scale-125' : 'border-cyan-400 bg-slate-900'}"
            >
                <span class="pointer-events-none absolute left-5 whitespace-nowrap rounded border border-slate-700 bg-slate-900/90 px-2 py-0.5 text-xs font-medium text-white">
                    {node.name}
                </span>
            </button>
        </Marker>
    {/each}
</MapLibre>