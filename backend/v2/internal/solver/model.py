from pyomo.environ import *

def create_model(nodes, links, demands, params):

    model = ConcreteModel()

    model.N = Set(initialize=[n.id for n in nodes])
    model.E = Set(initialize=[l.id for l in links])
    model.D = Set(initialize=[d.id for d in demands])
    params_dict = {p.key: p.value for p in params}

    U_max = params_dict["U"]
    cost_km = params_dict["c_km"]
    cost_u = params_dict["c_u"]


    demand_map = {d.id: d for d in demands}
    edge_from = {l.id: l.source_node_id for l in links}
    edge_to   = {l.id: l.dest_node_id for l in links}


    model.U = Param(initialize=U_max)

    model.ckm = Param(initialize=cost_km)
    model.cu  = Param(initialize=cost_u)
    model.de  = Param(model.E, initialize={l.id: l.distance for l in links})

    model.h = Param(model.D, initialize={d.id: d.volume for d in demands})




    model.z = Var(model.E, domain=Binary)              # активен ли канал
    model.u = Var(model.E, domain=NonNegativeReals)    # capacity
    # model.x = Var(model.D, model.E, domain=NonNegativeReals)  # flow
    model.x_fwd = Var(model.D, model.E, domain=NonNegativeReals) # source -> dest
    model.x_bwd = Var(model.D, model.E, domain=NonNegativeReals) # dest -> source




    def objective_rule(m):
        return sum(
            m.ckm * m.de[e] * m.z[e] +
            m.cu * m.u[e]
            for e in m.E
        )

    model.obj = Objective(rule=objective_rule, sense=minimize)

    def capacity_activation_rule(m, e):
        return m.u[e] <= m.U * m.z[e]

    model.capacity_activation = Constraint(model.E, rule=capacity_activation_rule)


    def capacity_limit_rule(m, e):
        return sum(m.x_fwd[d, e] + m.x_bwd[d, e] for d in m.D) <= m.u[e]
    model.capacity_limit = Constraint(model.E, rule=capacity_limit_rule)


    def flow_balance_rule(m, d, n):
        
        links_as_src = [e for e in m.E if edge_from[e] == n]
        
        links_as_dst = [e for e in m.E if edge_to[e] == n]

        if not links_as_src and not links_as_dst:
            return Constraint.Skip

        outflow = (
            sum(m.x_fwd[d, e] for e in links_as_src) +
            sum(m.x_bwd[d, e] for e in links_as_dst)
        )
        inflow = (
            sum(m.x_bwd[d, e] for e in links_as_src) +
            sum(m.x_fwd[d, e] for e in links_as_dst)
        )

        if n == demand_map[d].source_node_id:
            return outflow - inflow == m.h[d]
        elif n == demand_map[d].dest_node_id:
            return outflow - inflow == -m.h[d]
        else:
            return outflow - inflow == 0

    model.flow_balance = Constraint(model.D, model.N, rule=flow_balance_rule)

    return model