export interface NetworkNode {
    id: number;
    name: string;
    lat: number;
    lng: number;
}

export interface NodeCreate {
    name: string;
    lat: number;
    lng: number;
}

export interface LinkWithNodes {
    id: number;
    source_node: NetworkNode;
    dest_node: NetworkNode;
    distance: number;
}

export interface LinkCreate {
    source_node_id: number;
    dest_node_id: number;
}

export interface DemandWithNodes {
    id: number;
    source_node: NetworkNode;
    dest_node: NetworkNode;
    volume: number;
}

export interface DemandCreate {
    source_node_id: number;
    dest_node_id: number;
    volume: number;
}

export interface ResultLinkWithNodes {
    id: number;
    link_id: number;
    capacity: number;
    source_node: NetworkNode;
    dest_node: NetworkNode;
}

export interface FlowAssignment {
    id: number;
    demand_id: number;
    link_id: number;
    from_node_id: number;
    to_node_id: number;
    flow_value: number;
}

export interface OptimizationResponse {
    status: string;
    message: string;
    total_cost: number;
    links_built_count: number;
    flows_assigned_count: number;
}

export type EditorMode = 'view' | 'add_node' | 'add_link';