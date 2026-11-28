<script lang="ts">
    import { networkStore } from '#lib/state/network.svelte';

    let sourceId = $state<number | ''>('');
    let destId = $state<number | ''>('');
    let volume = $state<number>(10);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!sourceId || !destId || sourceId === destId) {
            alert('Выберите два разных узла');
            return;
        }
        await networkStore.addDemand(Number(sourceId), Number(destId), Number(volume));
    }
</script>

<div class="rounded-2xl border border-slate-700/60 bg-slate-900/85 p-4 text-white backdrop-blur-md shadow-xl">
    <h3 class="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Требования (Demands)</h3>

    <form onsubmit={handleSubmit} class="flex flex-col gap-2">
        <div class="grid grid-cols-2 gap-2">
            <select bind:value={sourceId} class="rounded-lg border-slate-700 bg-slate-800 text-sm text-white">
                <option value="">Откуда...</option>
                {#each networkStore.nodes as node}
                    <option value={node.id}>{node.name}</option>
                {/each}
            </select>

            <select bind:value={destId} class="rounded-lg border-slate-700 bg-slate-800 text-sm text-white">
                <option value="">Куда...</option>
                {#each networkStore.nodes as node}
                    <option value={node.id}>{node.name}</option>
                {/each}
            </select>
        </div>

        <div class="flex gap-2">
            <input type="number" min="1" step="any" bind:value={volume} placeholder="Объем"
                class="w-full rounded-lg border-slate-700 bg-slate-800 text-sm text-white" />
            <button type="submit" class="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-500">
                Добавить
            </button>
        </div>
    </form>

    <!-- Список добавленных требований -->
    <ul class="mt-4 flex max-h-48 flex-col gap-1.5 overflow-y-auto">
        {#each networkStore.demands as d (d.id)}
            <li class="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-1.5 text-sm">
                <span>{d.source_node.name} → {d.dest_node.name} <b>({d.volume})</b></span>
                <button onclick={() => networkStore.removeDemand(d.id)} class="text-rose-400 hover:text-rose-300">✕</button>
            </li>
        {/each}
    </ul>
</div>