import type {
    NetworkNode, NodeCreate,
    LinkWithNodes, LinkCreate,
    DemandWithNodes, DemandCreate,
    ResultLinkWithNodes, FlowAssignment,
    OptimizationResponse
} from '#lib/types/network';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v2';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Ошибка API: ${res.status}`);
    }
    return res.json();
}

export const networkApi = {
    // Nodes
    getNodes: () => request<NetworkNode[]>('/nodes'),
    createNode: (body: NodeCreate) => request<NetworkNode>('/nodes', { method: 'POST', body: JSON.stringify(body) }),

    // Links
    getLinks: () => request<LinkWithNodes[]>('/links'),
    createLink: (body: LinkCreate) => request<LinkWithNodes>('/links', { method: 'POST', body: JSON.stringify(body) }),
    deleteLink: (id: number) => request(`/links/${id}`, { method: 'DELETE' }),

    // Demands
    getDemands: () => request<DemandWithNodes[]>('/demands'),
    createDemand: (body: DemandCreate) => request<DemandWithNodes>('/demands', { method: 'POST', body: JSON.stringify(body) }),
    deleteDemand: (id: number) => request(`/demands/${id}`, { method: 'DELETE' }),

    // Solver & Results
    calculate: () => request<OptimizationResponse>('/calculate', { method: 'POST' }),
    getResultLinks: () => request<ResultLinkWithNodes[]>('/results/links'),
    getFlows: () => request<FlowAssignment[]>('/results/flows'),
};