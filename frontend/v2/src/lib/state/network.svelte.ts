import { networkApi } from '#lib/api/networkApi';
import type {
    NetworkNode, LinkWithNodes, DemandWithNodes,
    ResultLinkWithNodes, FlowAssignment, EditorMode
} from '#lib/types/network';

class NetworkStore {
    // Состояние данных
    nodes = $state<NetworkNode[]>([]);
    links = $state<LinkWithNodes[]>([]);
    demands = $state<DemandWithNodes[]>([]);
    resultLinks = $state<ResultLinkWithNodes[]>([]);
    flows = $state<FlowAssignment[]>([]);
    
    // Состояние UI
    mode = $state<EditorMode>('view');
    linkStartNode = $state<NetworkNode | null>(null); // Первый выбранный узел для создания канала
    isCalculating = $state(false);
    totalCost = $state<number | null>(null);

    // Автоматический GeoJSON для потенциальных каналов (серый пунктир)
    candidateLinksGeoJson = $derived({
        type: 'FeatureCollection' as const,
        features: this.links.map((link) => ({
            type: 'Feature' as const,
            properties: { id: link.id, distance: link.distance },
            geometry: {
                type: 'LineString' as const,
                coordinates: [
                    [link.source_node.lng, link.source_node.lat],
                    [link.dest_node.lng, link.dest_node.lat]
                ]
            }
        }))
    });

    // Автоматический GeoJSON для построенных каналов z_e=1 (яркие линии)
    resultLinksGeoJson = $derived({
        type: 'FeatureCollection' as const,
        features: this.resultLinks.map((rl) => ({
            type: 'Feature' as const,
            properties: { id: rl.link_id, capacity: rl.capacity },
            geometry: {
                type: 'LineString' as const,
                coordinates: [
                    [rl.source_node.lng, rl.source_node.lat],
                    [rl.dest_node.lng, rl.dest_node.lat]
                ]
            }
        }))
    });

    setMode(newMode: EditorMode) {
        this.mode = newMode;
        this.linkStartNode = null; // Сбрасываем выбор узла при смене режима
    }

    async loadAll() {
        const [nodes, links, demands] = await Promise.all([
            networkApi.getNodes(),
            networkApi.getLinks(),
            networkApi.getDemands()
        ]);
        this.nodes = nodes;
        this.links = links;
        this.demands = demands;
    }

    async addNode(name: string, lat: number, lng: number) {
        const created = await networkApi.createNode({ name, lat, lng });
        this.nodes = [...this.nodes, created];
    }

    // Логика построения CandidateLink в 2 клика по узлам
    async handleNodeClick(node: NetworkNode) {
        if (this.mode !== 'add_link') return;

        // 1-й клик: выбираем начальный узел
        if (!this.linkStartNode) {
            this.linkStartNode = node;
            return;
        }

        // Если кликнули по тому же узлу — отменяем выбор
        if (this.linkStartNode.id === node.id) {
            this.linkStartNode = null;
            return;
        }

        // 2-й клик: создаем канал в БД
        try {
            const createdLink = await networkApi.createLink({
                source_node_id: this.linkStartNode.id,
                dest_node_id: node.id
            });
            this.links = [...this.links, createdLink];
        } finally {
            this.linkStartNode = null; // Сбрасываем для следующего канала
        }
    }

    async addDemand(sourceId: number, destId: number, volume: number) {
        const created = await networkApi.createDemand({
            source_node_id: sourceId,
            dest_node_id: destId,
            volume
        });
        this.demands = [...this.demands, created];
    }

    async removeDemand(id: number) {
        await networkApi.deleteDemand(id);
        this.demands = this.demands.filter((d) => d.id !== id);
    }

    async runOptimization() {
        this.isCalculating = true;
        try {
            const resp = await networkApi.calculate();
            this.totalCost = resp.total_cost;
            // Подгружаем построенные каналы и потоки
            const [resLinks, flows] = await Promise.all([
                networkApi.getResultLinks(),
                networkApi.getFlows()
            ]);
            this.resultLinks = resLinks;
            this.flows = flows;
        } finally {
            this.isCalculating = false;
        }
    }
}

// Экспортируем единственный экземпляр (Singleton Store)
export const networkStore = new NetworkStore();