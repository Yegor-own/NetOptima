<script lang="ts">
    import "../app.css";
    import { onMount } from 'svelte';
    import { MapLibre, Marker, MapEvents } from 'svelte-maplibre';
    import type { MapMouseEvent } from 'maplibre-gl';
    import * as maplibregl from 'maplibre-gl';
    import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

    maplibregl.setWorkerUrl(maplibreWorkerUrl);

    const API_URL = 'http://127.0.0.1:8000/api/v2';

    // Описываем точную структуру, которая приходит от FastAPI
    interface NetworkNode {
        id: number;
        name: string;
        lat: number;
        lng: number;
    }

    interface NetworkLink {
        id: number;
        source_node_id: number;
        dest_node_id: number;
    }

    // Реактивный список узлов (Svelte 5)
    let nodes = $state<NetworkNode[]>([]);

    // 1. Функция загрузки узлов с бэкенда
    async function loadNodes() {
        try {
            const res = await fetch(`${API_URL}/nodes/`);
            if (!res.ok) throw new Error('Ошибка загрузки узлов');
            
            const data: NetworkNode[] = await res.json();
            nodes = data; // Как только присвоили, метки сами появятся на карте!
        } catch (err) {
            console.error(err);
        }
    }

    // 2. Добавление нового узла по клику на карту (сразу сохраняем в БД!)
    async function handleMapClick(e: MapMouseEvent) {
        const name = prompt('Введите название узла (например, Kazan):');
        if (!name) return;

        try {
            const res = await fetch(`${API_URL}/nodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    lat: e.lngLat.lat,
                    lng: e.lngLat.lng
                })
            });

            if (!res.ok) throw new Error('Не удалось создать узел');
            
            const createdNode: NetworkNode = await res.json();
            // Добавляем созданный узел (уже с настоящим id из БД) на карту
            nodes = [...nodes, createdNode];
        } catch (err) {
            console.error(err);
            alert('Ошибка при создании узла');
        }
    }

    // Вызываем загрузку при открытии страницы в браузере
    onMount(() => {
        loadNodes();
    });
</script>

<div class="h-screen w-screen">
    <MapLibre
        style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        class="h-full w-full"
        center={[35.91, 56.85]} 
        zoom={5}
    >
        <!-- Отслеживаем клик по карте -->
        <MapEvents onclick={handleMapClick} />

        <!-- Рисуем узлы из базы данных -->
        {#each nodes as node (node.id)}
            <Marker
                lngLat={[node.lng, node.lat]} 
                class="group relative flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-2 border-cyan-400 bg-slate-900 shadow-lg"
            >
                <!-- Подпись с названием города рядом с точкой -->
                <span class="pointer-events-none absolute left-5 whitespace-nowrap rounded bg-slate-900/90 px-2 py-0.5 text-xs font-medium text-white border border-slate-700 shadow">
                    {node.name}
                </span>
            </Marker>
        {/each}
    </MapLibre>
</div>