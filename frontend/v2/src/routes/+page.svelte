<script lang="ts">
    import "../app.css";
    import { onMount } from 'svelte';
    import * as maplibregl from 'maplibre-gl';
    import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
    import { networkStore } from '#lib/state/network.svelte';
    import MapView from '#lib/components/MapView.svelte';
    import DemandsPanel from '#lib/components/DemandsPanel.svelte';

    maplibregl.setWorkerUrl(maplibreWorkerUrl);

    onMount(() => {
        networkStore.loadAll();
    });
</script>

<main class="relative h-screen w-screen overflow-hidden bg-slate-950">
    <MapView />

    <div class="absolute top-4 left-4 z-10 flex gap-2 rounded-xl border border-slate-700 bg-slate-900/85 p-2 backdrop-blur-md">
        <button onclick={() => networkStore.setMode('view')} class="rounded-lg px-3 py-1.5 text-sm text-white {networkStore.mode === 'view' ? 'bg-cyan-600' : 'hover:bg-slate-800'}">
            Просмотр
        </button>
        <button onclick={() => networkStore.setMode('add_node')} class="rounded-lg px-3 py-1.5 text-sm text-white {networkStore.mode === 'add_node' ? 'bg-cyan-600' : 'hover:bg-slate-800'}">
            + Узел
        </button>
        <button onclick={() => networkStore.setMode('add_link')} class="rounded-lg px-3 py-1.5 text-sm text-white {networkStore.mode === 'add_link' ? 'bg-amber-600' : 'hover:bg-slate-800'}">
            + Канал {networkStore.linkStartNode ? `(от ${networkStore.linkStartNode.name})` : ''}
        </button>
        <button onclick={() => networkStore.runOptimization()} disabled={networkStore.isCalculating} class="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500">
            {networkStore.isCalculating ? 'Считаю...' : 'Оптимизировать'}
        </button>
    </div>

    <div class="absolute top-4 right-4 z-10 w-80 flex flex-col gap-4">
        <DemandsPanel />
        {#if networkStore.totalCost !== null}
            <div class="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-4 text-white backdrop-blur-md">
                <div class="text-xs text-emerald-400 uppercase">Итоговая стоимость</div>
                <div class="text-2xl font-bold">{networkStore.totalCost.toFixed(2)}</div>
            </div>
        {/if}
    </div>
</main>